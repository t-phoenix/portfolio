// SPDX-License-Identifier: MIT
// A mock for testing code that relies on VRFCoordinatorV2_5 (V2Plus).
pragma solidity ^0.8.4;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/dev/vrf/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/dev/vrf/libraries/VRFV2PlusClient.sol";

/**
 * @title VRFCoordinatorV2_5Mock
 * @notice Mock coordinator for testing VRF V2.5 (V2 Plus) contracts
 * @dev Simplified mock that supports both LINK and native payment
 */
contract VRFCoordinatorV2_5Mock {
    uint96 public immutable BASE_FEE;
    uint96 public immutable GAS_PRICE;
    uint16 public constant MAX_CONSUMERS = 100;

    error InvalidSubscription();
    error InsufficientBalance();
    error MustBeSubOwner(address owner);
    error TooManyConsumers();
    error InvalidConsumer();
    error InvalidRandomWords();
    error Reentrant();

    event RandomWordsRequested(
        bytes32 indexed keyHash,
        uint256 requestId,
        uint256 preSeed,
        uint256 indexed subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        bool nativePayment,
        address indexed sender
    );
    
    event RandomWordsFulfilled(
        uint256 indexed requestId,
        uint256 outputSeed,
        uint256 indexed subId,
        uint96 payment,
        bool nativePayment,
        bool success
    );
    
    event SubscriptionCreated(uint256 indexed subId, address owner);
    event SubscriptionFunded(uint256 indexed subId, uint256 oldBalance, uint256 newBalance);
    event SubscriptionFundedWithNative(uint256 indexed subId, uint256 oldBalance, uint256 newBalance);
    event SubscriptionCanceled(uint256 indexed subId, address to, uint256 amountLink, uint256 amountNative);
    event ConsumerAdded(uint256 indexed subId, address consumer);
    event ConsumerRemoved(uint256 indexed subId, address consumer);

    struct Config {
        bool reentrancyLock;
    }
    
    Config private s_config;
    uint256 s_currentSubId;
    uint256 s_nextRequestId = 1;
    uint256 s_nextPreSeed = 100;
    
    struct Subscription {
        address owner;
        uint96 balance;
        uint96 nativeBalance;
    }
    
    mapping(uint256 => Subscription) s_subscriptions;
    mapping(uint256 => address[]) s_consumers;

    struct Request {
        uint256 subId;
        uint32 callbackGasLimit;
        uint32 numWords;
        bool nativePayment;
    }
    
    mapping(uint256 => Request) s_requests;

    constructor(uint96 _baseFee, uint96 _gasPrice) {
        BASE_FEE = _baseFee;
        GAS_PRICE = _gasPrice;
        s_config = Config({reentrancyLock: false});
    }

    modifier nonReentrant() {
        if (s_config.reentrancyLock) {
            revert Reentrant();
        }
        s_config.reentrancyLock = true;
        _;
        s_config.reentrancyLock = false;
    }

    /**
     * @notice Request random words using V2.5 format
     */
    function requestRandomWords(
        VRFV2PlusClient.RandomWordsRequest calldata req
    ) external returns (uint256 requestId) {
        if (s_subscriptions[req.subId].owner == address(0)) {
            revert InvalidSubscription();
        }

        // Decode extraArgs to get nativePayment flag
        // extraArgs is encoded as VRFV2PlusClient.ExtraArgsV1
        bool nativePayment = false;
        if (req.extraArgs.length > 0) {
            // Try to decode, default to false if it fails
            try this.decodeExtraArgs(req.extraArgs) returns (bool _nativePayment) {
                nativePayment = _nativePayment;
            } catch {
                nativePayment = false;
            }
        }

        requestId = s_nextRequestId++;
        uint256 preSeed = s_nextPreSeed++;

        s_requests[requestId] = Request({
            subId: req.subId,
            callbackGasLimit: req.callbackGasLimit,
            numWords: req.numWords,
            nativePayment: nativePayment
        });

        emit RandomWordsRequested(
            req.keyHash,
            requestId,
            preSeed,
            req.subId,
            req.requestConfirmations,
            req.callbackGasLimit,
            req.numWords,
            nativePayment,
            msg.sender
        );

        return requestId;
    }

    /**
     * @notice Helper to decode extraArgs
     */
    function decodeExtraArgs(bytes calldata extraArgs) external pure returns (bool nativePayment) {
        // Skip the first 4 bytes (function selector) and decode the struct
        if (extraArgs.length >= 36) {
            // The nativePayment bool is at position 32 (after selector)
            nativePayment = abi.decode(extraArgs[4:], (bool));
        }
        return nativePayment;
    }

    /**
     * @notice Fulfill random words request
     */
    function fulfillRandomWords(uint256 _requestId, address _consumer) external nonReentrant {
        fulfillRandomWordsWithOverride(_requestId, _consumer, new uint256[](0));
    }

    /**
     * @notice Fulfill random words with custom random values
     */
    function fulfillRandomWordsWithOverride(
        uint256 _requestId,
        address _consumer,
        uint256[] memory _words
    ) public {
        uint256 startGas = gasleft();
        
        if (s_requests[_requestId].subId == 0) {
            revert("nonexistent request");
        }
        
        Request memory req = s_requests[_requestId];

        if (_words.length == 0) {
            _words = new uint256[](req.numWords);
            for (uint256 i = 0; i < req.numWords; i++) {
                _words[i] = uint256(keccak256(abi.encode(_requestId, i)));
            }
        } else if (_words.length != req.numWords) {
            revert InvalidRandomWords();
        }

        // Call the consumer's fulfillRandomWords
        VRFConsumerBaseV2Plus v;
        bytes memory callReq = abi.encodeWithSelector(
            v.rawFulfillRandomWords.selector,
            _requestId,
            _words
        );
        
        s_config.reentrancyLock = true;
        (bool success, ) = _consumer.call{gas: req.callbackGasLimit}(callReq);
        s_config.reentrancyLock = false;

        // Calculate and deduct payment
        uint96 payment = uint96(BASE_FEE + ((startGas - gasleft()) * GAS_PRICE));
        
        if (req.nativePayment) {
            if (s_subscriptions[req.subId].nativeBalance < payment) {
                revert InsufficientBalance();
            }
            s_subscriptions[req.subId].nativeBalance -= payment;
        } else {
            if (s_subscriptions[req.subId].balance < payment) {
                revert InsufficientBalance();
            }
            s_subscriptions[req.subId].balance -= payment;
        }

        delete (s_requests[_requestId]);
        emit RandomWordsFulfilled(_requestId, _requestId, req.subId, payment, req.nativePayment, success);
    }

    /**
     * @notice Fund a subscription with LINK
     */
    function fundSubscription(uint256 _subId, uint96 _amount) external {
        if (s_subscriptions[_subId].owner == address(0)) {
            revert InvalidSubscription();
        }
        uint96 oldBalance = s_subscriptions[_subId].balance;
        s_subscriptions[_subId].balance += _amount;
        emit SubscriptionFunded(_subId, oldBalance, oldBalance + _amount);
    }

    /**
     * @notice Fund a subscription with native token
     */
    function fundSubscriptionWithNative(uint256 _subId) external payable {
        if (s_subscriptions[_subId].owner == address(0)) {
            revert InvalidSubscription();
        }
        uint96 oldBalance = s_subscriptions[_subId].nativeBalance;
        s_subscriptions[_subId].nativeBalance += uint96(msg.value);
        emit SubscriptionFundedWithNative(_subId, oldBalance, oldBalance + uint96(msg.value));
    }

    /**
     * @notice Create a new subscription
     */
    function createSubscription() external returns (uint256 subId) {
        s_currentSubId++;
        subId = s_currentSubId;
        s_subscriptions[subId] = Subscription({
            owner: msg.sender,
            balance: 0,
            nativeBalance: 0
        });
        emit SubscriptionCreated(subId, msg.sender);
        return subId;
    }

    /**
     * @notice Get subscription details
     */
    function getSubscription(
        uint256 _subId
    ) external view returns (uint96 balance, uint96 nativeBalance, uint64 reqCount, address owner, address[] memory consumers) {
        if (s_subscriptions[_subId].owner == address(0)) {
            revert InvalidSubscription();
        }
        return (
            s_subscriptions[_subId].balance,
            s_subscriptions[_subId].nativeBalance,
            0, // reqCount not tracked in this simple mock
            s_subscriptions[_subId].owner,
            s_consumers[_subId]
        );
    }

    /**
     * @notice Cancel a subscription
     */
    function cancelSubscription(uint256 _subId, address _to) external {
        if (s_subscriptions[_subId].owner != msg.sender) {
            revert MustBeSubOwner(s_subscriptions[_subId].owner);
        }
        emit SubscriptionCanceled(
            _subId,
            _to,
            s_subscriptions[_subId].balance,
            s_subscriptions[_subId].nativeBalance
        );
        delete (s_subscriptions[_subId]);
        delete (s_consumers[_subId]);
    }

    /**
     * @notice Add a consumer to a subscription
     */
    function addConsumer(uint256 _subId, address _consumer) external {
        if (s_subscriptions[_subId].owner != msg.sender) {
            revert MustBeSubOwner(s_subscriptions[_subId].owner);
        }
        if (s_consumers[_subId].length >= MAX_CONSUMERS) {
            revert TooManyConsumers();
        }

        if (consumerIsAdded(_subId, _consumer)) {
            return;
        }

        s_consumers[_subId].push(_consumer);
        emit ConsumerAdded(_subId, _consumer);
    }

    /**
     * @notice Remove a consumer from a subscription
     */
    function removeConsumer(uint256 _subId, address _consumer) external {
        if (s_subscriptions[_subId].owner != msg.sender) {
            revert MustBeSubOwner(s_subscriptions[_subId].owner);
        }
        if (!consumerIsAdded(_subId, _consumer)) {
            revert InvalidConsumer();
        }

        address[] storage consumers = s_consumers[_subId];
        for (uint256 i = 0; i < consumers.length; i++) {
            if (consumers[i] == _consumer) {
                consumers[i] = consumers[consumers.length - 1];
                consumers.pop();
                break;
            }
        }

        emit ConsumerRemoved(_subId, _consumer);
    }

    /**
     * @notice Check if consumer is added to subscription
     */
    function consumerIsAdded(uint256 _subId, address _consumer) public view returns (bool) {
        address[] memory consumers = s_consumers[_subId];
        for (uint256 i = 0; i < consumers.length; i++) {
            if (consumers[i] == _consumer) {
                return true;
            }
        }
        return false;
    }
}
