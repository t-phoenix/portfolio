// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/dev/vrf/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/dev/vrf/libraries/VRFV2PlusClient.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Potshot
 * @notice A provably fair lottery-style game using Chainlink VRF for true randomness
 * @dev Uses Chainlink VRF V2.5 (V2 Plus) for cryptographically secure random number generation
 * 
 * Game Mechanics:
 * - Players send USDC to buy tickets (minimum bet required)
 * - 50% goes to dev wallet (transferred immediately), 50% goes to shared pot
 * - Each player has a win chance (1-10%) that increases +1% per play
 * - On win: player gets 25% of pot (claimable via pull pattern), chance resets to 1%
 * - Randomness is provided by Chainlink VRF V2.5 (verifiable on-chain)
 * 
 * Security Features:
 * - Pull-over-push for player winnings (fixes C-1 vulnerability)
 * - Direct transfer for dev funds (reduces attack surface)
 * - Uses potAtTime for win calculations (fixes C-2 vulnerability)
 * - Dev wallet can be changed with timelock (reduces C-3 rug pull risk)
 */
contract Potshot is VRFConsumerBaseV2Plus {
    using SafeERC20 for IERC20;
    
    // ============ State Variables ============
    
    /// @notice USDC token contract
    IERC20 public immutable usdc;
    
    /// @notice The shared pot that accumulates from all ticket purchases
    uint256 public pot;
    
    /// @notice Developer address receiving 50% of all ticket purchases
    address public dev;
    
    /// @notice Pending dev address for two-step transfer
    address public pendingDev;
    
    /// @notice Timestamp when dev change was initiated
    uint256 public devChangeTimestamp;
    
    /// @notice Timelock duration for dev change (24 hours)
    uint256 public constant DEV_CHANGE_DELAY = 24 hours;
    
    /// @notice Minimum bet amount in USDC (6 decimals)
    uint256 public minBet;
    
    /// @notice Mapping of player address to their win chance (1-10)
    mapping(address => uint8) public chance;
    
    /// @notice Claimable winnings for each player (pull pattern)
    mapping(address => uint256) public claimableWinnings;
    
    /// @notice Total number of tickets bought
    uint256 public totalTickets;
    
    /// @notice Total amount paid to dev
    uint256 public totalToDev;
    
    /// @notice Total amount won by players
    uint256 public totalWinnings;
    
    /// @notice Total claimable winnings (not yet claimed)
    uint256 public totalClaimableWinnings;
    
    /// @notice Emergency pause state
    bool public paused;
    
    /// @notice Reentrancy guard
    bool private locked;
    
    
    // ============ Chainlink VRF Configuration ============
    
    /// @notice VRF Subscription ID (V2.5 uses uint256)
    uint256 public immutable subscriptionId;
    
    /// @notice VRF Key Hash (gas lane)
    bytes32 public immutable keyHash;
    
    /// @notice VRF Callback gas limit
    uint32 public callbackGasLimit;
    
    /// @notice VRF Request confirmations
    uint16 public requestConfirmations;
    
    /// @notice Number of random words to request
    uint32 public constant NUM_WORDS = 1;
    
    /// @notice Mapping of VRF request ID to ticket info
    mapping(uint256 => TicketRequest) public ticketRequests;
    
    /// @notice Pending tickets waiting for VRF response
    mapping(address => uint256) public pendingTickets;
    
    // ============ Structs ============
    
    struct TicketRequest {
        address player;
        uint256 ticketAmount;
        uint8 playerChance;
        uint256 potAtTime;
        uint256 requestTime;
        bool fulfilled;
        bool exists;
    }
    
    // ============ Constants ============
    
    uint8 public constant MIN_CHANCE = 1;
    uint8 public constant MAX_CHANCE = 10;
    uint256 public constant WIN_PERCENTAGE = 25; // 25% of pot on win
    uint256 public constant VRF_TIMEOUT = 1 hours; // Timeout for VRF requests
    
    // ============ Events ============
    
    /**
     * @notice Emitted when a ticket is purchased (request sent to VRF)
     * @param player Address of the player
     * @param amount Amount of USDC sent
     * @param requestId VRF request ID
     * @param playerChance Player's chance at time of purchase
     */
    event TicketRequested(
        address indexed player,
        uint256 amount,
        uint256 indexed requestId,
        uint8 playerChance
    );
    
    /**
     * @notice Emitted when randomness is fulfilled and outcome is determined
     * @param player Address of the player
     * @param requestId VRF request ID
     * @param randomWord Random number from VRF
     * @param won Whether the player won
     * @param winAmount Amount won (0 if didn't win)
     * @param newChance Player's chance after this ticket
     * @param potAfter Pot balance after the ticket
     */
    event TicketResolved(
        address indexed player,
        uint256 indexed requestId,
        uint256 randomWord,
        bool won,
        uint256 winAmount,
        uint8 newChance,
        uint256 potAfter
    );
    
    /**
     * @notice Emitted when a player claims their winnings
     * @param player Address of the player
     * @param amount Amount claimed
     */
    event WinningsClaimed(address indexed player, uint256 amount);
    
    /**
     * @notice Emitted when dev receives funds directly
     * @param dev Address of the dev
     * @param amount Amount transferred
     * @param source Source of funds ("ticket" or "tip")
     */
    event DevFundsTransferred(address indexed dev, uint256 amount, string source);
    
    /**
     * @notice Emitted when dev change is initiated
     * @param oldDev Current dev address
     * @param newDev Pending dev address
     * @param executeTime Timestamp when change can be executed
     */
    event DevChangeInitiated(address indexed oldDev, address indexed newDev, uint256 executeTime);
    
    /**
     * @notice Emitted when dev change is executed
     * @param oldDev Previous dev address
     * @param newDev New dev address
     */
    event DevChanged(address indexed oldDev, address indexed newDev);
    
    /**
     * @notice Emitted when dev change is cancelled
     * @param oldDev Current dev address
     * @param cancelledNewDev Cancelled pending dev address
     */
    event DevChangeCancelled(address indexed oldDev, address indexed cancelledNewDev);
    
    /**
     * @notice Emitted when someone tips the dev
     * @param tipper Address of the tipper
     * @param amount Amount tipped
     */
    event DevTipped(address indexed tipper, uint256 amount);
    
    /**
     * @notice Emitted when minimum bet is updated
     * @param oldMinBet Previous minimum bet
     * @param newMinBet New minimum bet
     */
    event MinBetUpdated(uint256 oldMinBet, uint256 newMinBet);
    
    /**
     * @notice Emitted when contract is paused/unpaused
     * @param paused New pause state
     */
    event PauseToggled(bool paused);
    
    /**
     * @notice Emitted when pot is seeded
     * @param seeder Address of the seeder
     * @param amount Amount added to pot
     */
    event PotSeeded(address indexed seeder, uint256 amount);
    
    /**
     * @notice Emitted when VRF config is updated
     * @param callbackGasLimit New callback gas limit
     * @param requestConfirmations New request confirmations
     */
    event VRFConfigUpdated(uint32 callbackGasLimit, uint16 requestConfirmations);
    
    /**
     * @notice Emitted when emergency withdrawal occurs
     * @param amount Amount withdrawn
     * @param potBefore Pot balance before withdrawal
     */
    event EmergencyWithdrawal(uint256 amount, uint256 potBefore);
    
    /**
     * @notice Emitted when tokens are recovered
     * @param token Address of token recovered (address(0) for native)
     * @param amount Amount recovered
     */
    event TokenRecovered(address indexed token, uint256 amount);
    
    /**
     * @notice Emitted when a ticket is cancelled due to VRF timeout
     * @param player Address of the player
     * @param requestId VRF request ID
     * @param refundAmount Amount refunded
     */
    event TicketCancelled(address indexed player, uint256 indexed requestId, uint256 refundAmount);
    
    // ============ Errors ============
    
    error BelowMinimumBet();
    error TransferFailed();
    error ContractPaused();
    error OnlyDev();
    error Reentrancy();
    error InvalidMinBet();
    error PendingTicket();
    error NoRandomness();
    error InvalidRequest();
    error NoWinningsToClaim();
    error InvalidDevAddress();
    error DevChangeNotInitiated();
    error DevChangeTooEarly();
    error NoDevChangeInProgress();
    error PlayersHaveUnclaimedWinnings();
    error TicketNotExpired();
    error InvalidWithdrawAmount();
    error InvalidRecoveryAmount();
    
    // ============ Modifiers ============
    
    modifier nonReentrant() {
        if (locked) revert Reentrancy();
        locked = true;
        _;
        locked = false;
    }
    
    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }
    
    modifier onlyDev() {
        if (msg.sender != dev) revert OnlyDev();
        _;
    }
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize the Potshot game
     * @param _dev Developer address
     * @param _usdc USDC token address
     * @param _minBet Minimum bet amount in USDC (6 decimals)
     * @param _vrfCoordinator Address of VRF Coordinator V2.5
     * @param _subscriptionId VRF subscription ID (uint256 for V2.5)
     * @param _keyHash VRF key hash (gas lane)
     * @param _callbackGasLimit Gas limit for VRF callback
     * @param _requestConfirmations Number of confirmations before VRF responds
     */
    constructor(
        address _dev,
        address _usdc,
        uint256 _minBet,
        address _vrfCoordinator,
        uint256 _subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        require(_dev != address(0), "Invalid dev address");
        require(_usdc != address(0), "Invalid USDC address");
        require(_vrfCoordinator != address(0), "Invalid VRF coordinator");
        require(_minBet > 0, "Invalid min bet");
        require(_subscriptionId > 0, "Invalid subscription ID");
        require(_callbackGasLimit >= 100000, "Gas limit too low");
        require(_requestConfirmations > 0 && _requestConfirmations <= 200, "Invalid confirmations");
        
        usdc = IERC20(_usdc);
        dev = _dev;
        minBet = _minBet;
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;
        paused = false;
        locked = false;
    }
    
    // ============ Main Game Functions ============
    
    /**
     * @notice Buy a ticket and request randomness from VRF
     * @dev Splits payment and requests random number from Chainlink VRF
     * @param amount Amount of USDC to bet (must be >= minBet)
     */
    function buyTicket(uint256 amount) external nonReentrant whenNotPaused {
        if (amount < minBet) revert BelowMinimumBet();
        if (pendingTickets[msg.sender] > 0) revert PendingTicket();
        
        // Split the payment (50/50)
        uint256 toPot = amount / 2;
        uint256 toDev = amount - toPot; // Dev gets the dust if any
        
        // Transfer USDC from player to contract
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update pot
        pot += toPot;
        
        // Get current chance (will be used for this ticket)
        uint8 currentChance = chance[msg.sender];
        if (currentChance == 0) {
            currentChance = MIN_CHANCE;
        }
        
        // Transfer dev share directly (push pattern)
        totalToDev += toDev;
        usdc.safeTransfer(dev, toDev);
        emit DevFundsTransferred(dev, toDev, "ticket");
        
        // Request randomness from Chainlink VRF V2.5
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: NUM_WORDS,
                // Set nativePayment to false to pay for VRF requests with LINK
                // Set to true to pay with native token (ETH/Base ETH) instead
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: true})
                )
            })
        );
        
        // Store ticket request
        ticketRequests[requestId] = TicketRequest({
            player: msg.sender,
            ticketAmount: amount,
            playerChance: currentChance,
            potAtTime: pot,
            requestTime: block.timestamp,
            fulfilled: false,
            exists: true
        });
        
        // Mark as pending
        pendingTickets[msg.sender] = requestId;
        
        emit TicketRequested(msg.sender, amount, requestId, currentChance);
    }
    
    /**
     * @notice Callback function called by VRF Coordinator
     * @param requestId VRF request ID
     * @param randomWords Array of random words from VRF
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        TicketRequest storage request = ticketRequests[requestId];
        
        // Validate request
        if (!request.exists) revert InvalidRequest();
        if (request.fulfilled) return; // Already fulfilled
        
        // Mark as fulfilled
        request.fulfilled = true;
        
        // Clear pending ticket
        delete pendingTickets[request.player];
        
        // Increment total tickets
        totalTickets++;
        
        // Get random number
        uint256 randomWord = randomWords[0];
        
        // Determine win using the random number
        bool won = (randomWord % 100) < request.playerChance;
        
        uint256 winAmount = 0;
        uint8 newChance = request.playerChance;
        
        if (won) {
            // Calculate win amount (25% of pot at time of request - fixes C-2 vulnerability)
            winAmount = (request.potAtTime * WIN_PERCENTAGE) / 100;
            
            // Ensure pot has enough (in case pot was drained by other winners)
            if (winAmount > pot) {
                winAmount = pot;
            }
            
            // Deduct from pot
            pot -= winAmount;
            
            // Reset chance to minimum
            chance[request.player] = MIN_CHANCE;
            newChance = MIN_CHANCE;
            
            // Track total winnings
            totalWinnings += winAmount;
            totalClaimableWinnings += winAmount;
            
            // Credit winnings to player (pull pattern - fixes C-1 vulnerability)
            claimableWinnings[request.player] += winAmount;
        } else {
            // Increment chance for next time (cap at MAX_CHANCE)
            uint8 nextChance = request.playerChance;
            if (nextChance < MAX_CHANCE) {
                nextChance += 1;
            }
            chance[request.player] = nextChance;
            newChance = nextChance;
        }
        
        // Emit resolution event
        emit TicketResolved(
            request.player,
            requestId,
            randomWord,
            won,
            winAmount,
            newChance,
            pot
        );
    }
    
    /**
     * @notice Claim winnings (pull pattern)
     * @dev Players call this to withdraw their winnings
     */
    function claimWinnings() external nonReentrant {
        uint256 amount = claimableWinnings[msg.sender];
        if (amount == 0) revert NoWinningsToClaim();
        
        // Clear claimable amount before transfer (CEI pattern)
        claimableWinnings[msg.sender] = 0;
        totalClaimableWinnings -= amount;
        
        // Transfer USDC to player
        usdc.safeTransfer(msg.sender, amount);
        
        emit WinningsClaimed(msg.sender, amount);
    }
    
    /**
     * @notice Send a tip directly to dev (no game mechanics)
     * @param amount Amount of USDC to tip
     */
    function tipDev(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Must send USDC");
        
        // Transfer USDC directly from tipper to dev (gas optimized)
        usdc.safeTransferFrom(msg.sender, dev, amount);
        
        // Track total to dev
        totalToDev += amount;
        
        emit DevTipped(msg.sender, amount);
        emit DevFundsTransferred(dev, amount, "tip");
    }
    
    /**
     * @notice Seed the pot with initial funds (anyone can call)
     * @dev Useful for bootstrapping the game
     * @param amount Amount of USDC to seed
     */
    function seedPot(uint256 amount) external whenNotPaused {
        require(amount > 0, "Must send USDC");
        
        // Transfer USDC from seeder to contract
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        
        pot += amount;
        emit PotSeeded(msg.sender, amount);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get the win chance for a specific address
     * @param user Address to check
     * @return Win chance (1-10) or 1 if never played
     */
    function getChance(address user) external view returns (uint8) {
        uint8 c = chance[user];
        return c == 0 ? MIN_CHANCE : c;
    }
    
    /**
     * @notice Get current pot balance
     * @return Current pot in wei
     */
    function getPot() external view returns (uint256) {
        return pot;
    }
    
    /**
     * @notice Get contract statistics
     * @return _pot Current pot
     * @return _totalTickets Total tickets resolved
     * @return _totalToDev Total paid to dev
     * @return _totalWinnings Total won by players
     */
    function getStats() external view returns (
        uint256 _pot,
        uint256 _totalTickets,
        uint256 _totalToDev,
        uint256 _totalWinnings
    ) {
        return (pot, totalTickets, totalToDev, totalWinnings);
    }
    
    /**
     * @notice Get ticket request details
     * @param requestId VRF request ID
     * @return Ticket request struct
     */
    function getTicketRequest(uint256 requestId) external view returns (TicketRequest memory) {
        return ticketRequests[requestId];
    }
    
    /**
     * @notice Check if user has a pending ticket
     * @param user Address to check
     * @return requestId Request ID of pending ticket (0 if none)
     */
    function getPendingTicket(address user) external view returns (uint256) {
        return pendingTickets[user];
    }
    
    /**
     * @notice Cancel expired VRF ticket and refund player
     * @dev Can be called by anyone if ticket has expired (1 hour timeout)
     * @param player Address of the player with expired ticket
     */
    function cancelExpiredTicket(address player) external nonReentrant {
        uint256 requestId = pendingTickets[player];
        require(requestId != 0, "No pending ticket");
        
        TicketRequest storage request = ticketRequests[requestId];
        require(request.exists, "Invalid request");
        require(!request.fulfilled, "Already fulfilled");
        
        // Check if VRF request has timed out (1 hour)
        if (block.timestamp < request.requestTime + VRF_TIMEOUT) {
            revert TicketNotExpired();
        }
        
        // Mark as fulfilled to prevent double processing
        request.fulfilled = true;
        
        // Clear pending ticket
        delete pendingTickets[player];
        
        // Refund 50% (pot portion) - dev already got their 50%
        uint256 refund = request.ticketAmount / 2;
        if (refund <= pot) {
            pot -= refund;
            usdc.safeTransfer(player, refund);
        }
        
        emit TicketCancelled(player, requestId, refund);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Initiate dev address change (two-step process with timelock)
     * @param newDev New developer address
     * @dev Must wait DEV_CHANGE_DELAY before executing
     */
    function initiateDevChange(address newDev) external onlyDev {
        if (newDev == address(0)) revert InvalidDevAddress();
        if (newDev == dev) revert InvalidDevAddress();
        
        pendingDev = newDev;
        devChangeTimestamp = block.timestamp + DEV_CHANGE_DELAY;
        
        emit DevChangeInitiated(dev, newDev, devChangeTimestamp);
    }
    
    /**
     * @notice Execute dev address change after timelock
     * @dev Can only be called after DEV_CHANGE_DELAY has passed
     *      Automatically transfers any pending dev funds to old dev before change
     */
    function executeDevChange() external onlyDev nonReentrant {
        if (pendingDev == address(0)) revert DevChangeNotInitiated();
        if (block.timestamp < devChangeTimestamp) revert DevChangeTooEarly();
        
        address oldDev = dev;
        
        // Change dev address first
        dev = pendingDev;
        
        // Clear pending change
        pendingDev = address(0);
        devChangeTimestamp = 0;
        
        emit DevChanged(oldDev, dev);
    }
    
    /**
     * @notice Cancel pending dev address change
     * @dev Can be called anytime before execution
     */
    function cancelDevChange() external onlyDev {
        if (pendingDev == address(0)) revert NoDevChangeInProgress();
        
        address cancelledDev = pendingDev;
        pendingDev = address(0);
        devChangeTimestamp = 0;
        
        emit DevChangeCancelled(dev, cancelledDev);
    }
    
    /**
     * @notice Update minimum bet (dev only)
     * @param _newMinBet New minimum bet amount in USDC
     */
    function setMinBet(uint256 _newMinBet) external onlyDev {
        if (_newMinBet == 0) revert InvalidMinBet();
        uint256 oldMinBet = minBet;
        minBet = _newMinBet;
        emit MinBetUpdated(oldMinBet, _newMinBet);
    }
    
    /**
     * @notice Update VRF configuration (dev only)
     * @param _callbackGasLimit New callback gas limit
     * @param _requestConfirmations New request confirmations
     */
    function setVRFConfig(uint32 _callbackGasLimit, uint16 _requestConfirmations) external onlyDev {
        require(_callbackGasLimit >= 100000, "Gas limit too low");
        require(_requestConfirmations > 0 && _requestConfirmations <= 200, "Invalid confirmations");
        
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;
        
        emit VRFConfigUpdated(_callbackGasLimit, _requestConfirmations);
    }
    
    /**
     * @notice Toggle pause state (dev only)
     * @dev Used for emergency stops
     */
    function togglePause() external onlyDev {
        paused = !paused;
        emit PauseToggled(paused);
    }
    
    /**
     * @notice Emergency withdrawal of USDC from pot
     * @dev Only callable by dev. Checks for unclaimed winnings.
     * @param amount Amount of USDC to withdraw from pot
     */
    function emergencyWithdraw(uint256 amount) external onlyDev nonReentrant {
        if (amount == 0 || amount > pot) revert InvalidWithdrawAmount();
        
        // Check that players don't have unclaimed winnings
        if (totalClaimableWinnings > 0) revert PlayersHaveUnclaimedWinnings();
        
        uint256 potBefore = pot;
        
        // Deduct from pot
        pot -= amount;
        
        // Transfer USDC to dev
        usdc.safeTransfer(dev, amount);
        
        emit EmergencyWithdrawal(amount, potBefore);
    }
    
    /**
     * @notice Recover any ERC20 token stuck in the contract
     * @dev Cannot recover USDC that belongs to pot or unclaimed winnings
     * @param token Address of the ERC20 token to recover
     * @param amount Amount to recover
     */
    function recoverToken(address token, uint256 amount) external onlyDev nonReentrant {
        if (amount == 0) revert InvalidRecoveryAmount();
        
        // If recovering USDC, ensure we don't touch pot or unclaimed winnings
        if (token == address(usdc)) {
            uint256 usdcBalance = usdc.balanceOf(address(this));
            uint256 reserved = pot + totalClaimableWinnings;
            uint256 recoverable = usdcBalance > reserved ? usdcBalance - reserved : 0;
            
            if (amount > recoverable) revert InvalidRecoveryAmount();
        }
        
        IERC20(token).safeTransfer(dev, amount);
        
        emit TokenRecovered(token, amount);
    }
    
    /**
     * @notice Recover native token (ETH/Base ETH) stuck in the contract
     * @param amount Amount to recover
     */
    function recoverNative(uint256 amount) external onlyDev nonReentrant {
        if (amount == 0) revert InvalidRecoveryAmount();
        
        uint256 balance = address(this).balance;
        if (amount > balance) revert InvalidRecoveryAmount();
        
        (bool success, ) = dev.call{value: amount}("");
        require(success, "Native transfer failed");
        
        emit TokenRecovered(address(0), amount);
    }
    
    /**
     * @notice Receive function to accept native tokens
     */
    receive() external payable {}
}
