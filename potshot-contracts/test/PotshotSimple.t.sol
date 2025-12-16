// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test, console2} from "forge-std/Test.sol";
import {Potshot} from "../src/Potshot.sol";
import {VRFCoordinatorV2_5Mock} from "./mocks/VRFCoordinatorV2_5Mock.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock USDC contract for testing
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {
        _mint(msg.sender, 1000000 * 10**6); // 1M USDC with 6 decimals
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract PotshotSimpleTest is Test {
    Potshot public potshot;
    VRFCoordinatorV2_5Mock public vrfCoordinator;
    MockUSDC public usdc;
    
    address public dev = address(0x1);
    address public player1 = address(0x2);
    address public player2 = address(0x3);
    
    uint256 constant MIN_BET = 1 * 10**6;        // 1 USDC
    uint256 constant TICKET_PRICE = 10 * 10**6;  // 10 USDC
    
    // VRF V2.5 Configuration
    uint256 public subscriptionId;
    bytes32 public keyHash = bytes32(uint256(1));
    uint32 public callbackGasLimit = 500000;
    uint16 public requestConfirmations = 3;
    
    // VRF Mock params
    uint96 constant MOCK_BASE_FEE = 0.00025 ether;
    uint96 constant MOCK_GAS_PRICE = 1e9;
    
    function setUp() public {
        // Deploy Mock USDC
        usdc = new MockUSDC();
        
        // Deploy VRF Coordinator V2.5 Mock
        vrfCoordinator = new VRFCoordinatorV2_5Mock(
            MOCK_BASE_FEE,
            MOCK_GAS_PRICE
        );
        
        // Create subscription
        subscriptionId = vrfCoordinator.createSubscription();
        
        // Fund subscription with native token (ETH) for native payment
        vrfCoordinator.fundSubscriptionWithNative{value: 10 ether}(subscriptionId);
        
        // Deploy Potshot with VRF V2.5 and USDC
        potshot = new Potshot(
            dev,
            address(usdc),
            MIN_BET,
            address(vrfCoordinator),
            subscriptionId,
            keyHash,
            callbackGasLimit,
            requestConfirmations
        );
        
        // Add consumer to subscription
        vrfCoordinator.addConsumer(subscriptionId, address(potshot));
        
        // Mint USDC to test addresses
        usdc.mint(player1, 1000 * 10**6); // 1000 USDC
        usdc.mint(player2, 1000 * 10**6); // 1000 USDC
        usdc.mint(address(this), 1000 * 10**6); // 1000 USDC
    }
    
    function test_FullGameFlow_WithRandomOutcome() public {
        // Buy ticket
        vm.startPrank(player1);
        usdc.approve(address(potshot), TICKET_PRICE);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
        
        uint256 potBefore = potshot.pot();
        uint256 chanceBefore = potshot.getChance(player1);
        
        // Fulfill VRF
        vrfCoordinator.fulfillRandomWords(1, address(potshot));
        
        // Check that ticket was resolved
        assertEq(potshot.pendingTickets(player1), 0);
        assertEq(potshot.totalTickets(), 1);
        
        // Check if player won or lost
        uint256 claimable = potshot.claimableWinnings(player1);
        
        if (claimable > 0) {
            // Player won
            assertTrue(potshot.pot() < potBefore);
            assertEq(potshot.chance(player1), 1); // Reset
            
            // Claim winnings
            vm.prank(player1);
            potshot.claimWinnings();
            
            assertTrue(usdc.balanceOf(player1) > 1000 * 10**6 - TICKET_PRICE);
        } else {
            // Player lost
            assertEq(potshot.pot(), potBefore); // Pot unchanged
            assertEq(potshot.chance(player1), chanceBefore + 1); // Increased
        }
        
        // Dev received funds immediately on ticket purchase
        uint256 devShare = TICKET_PRICE / 2 + (TICKET_PRICE % 2);
        assertEq(usdc.balanceOf(dev), devShare);
    }
    
    function test_DevChangeFlow() public {
        address newDev = address(0x999);
        
        // Initiate change
        vm.prank(dev);
        potshot.initiateDevChange(newDev);
        
        assertEq(potshot.pendingDev(), newDev);
        
        // Wait 24 hours
        vm.warp(block.timestamp + 24 hours);
        
        // Execute change
        vm.prank(dev);
        potshot.executeDevChange();
        
        assertEq(potshot.dev(), newDev);
        assertEq(potshot.pendingDev(), address(0));
    }
}
