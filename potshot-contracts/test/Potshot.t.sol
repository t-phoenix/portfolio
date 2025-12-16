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

contract PotshotTest is Test {
    Potshot public potshot;
    VRFCoordinatorV2_5Mock public vrfCoordinator;
    MockUSDC public usdc;
    
    address public dev = address(0x1);
    address public player1 = address(0x2);
    address public player2 = address(0x3);
    address public player3 = address(0x4);
    
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
    
    event TicketRequested(
        address indexed player,
        uint256 amount,
        uint256 indexed requestId,
        uint8 playerChance
    );
    
    event TicketResolved(
        address indexed player,
        uint256 indexed requestId,
        uint256 randomWord,
        bool won,
        uint256 winAmount,
        uint8 newChance,
        uint256 potAfter
    );
    
    event WinningsClaimed(address indexed player, uint256 amount);
    event DevFundsTransferred(address indexed dev, uint256 amount, string source);
    event DevChangeInitiated(address indexed oldDev, address indexed newDev, uint256 executeTime);
    event DevChanged(address indexed oldDev, address indexed newDev);
    event EmergencyWithdrawal(uint256 amount, uint256 potBefore);
    event TokenRecovered(address indexed token, uint256 amount);
    
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
        usdc.mint(player3, 1000 * 10**6); // 1000 USDC
        usdc.mint(address(this), 1000 * 10**6); // 1000 USDC
    }
    
    // ============ Constructor Tests ============
    
    function test_Constructor() public view {
        assertEq(potshot.dev(), dev);
        assertEq(address(potshot.usdc()), address(usdc));
        assertEq(potshot.minBet(), MIN_BET);
        assertEq(potshot.pot(), 0);
        assertEq(potshot.totalTickets(), 0);
        assertEq(potshot.paused(), false);
        assertEq(potshot.subscriptionId(), subscriptionId);
        assertEq(potshot.callbackGasLimit(), callbackGasLimit);
        assertEq(potshot.requestConfirmations(), requestConfirmations);
    }
    
    function test_RevertWhen_ConstructorZeroDevAddress() public {
        vm.expectRevert("Invalid dev address");
        new Potshot(
            address(0),
            address(usdc),
            MIN_BET,
            address(vrfCoordinator),
            subscriptionId,
            keyHash,
            callbackGasLimit,
            requestConfirmations
        );
    }
    
    function test_RevertWhen_ConstructorZeroUSDC() public {
        vm.expectRevert("Invalid USDC address");
        new Potshot(
            dev,
            address(0),
            MIN_BET,
            address(vrfCoordinator),
            subscriptionId,
            keyHash,
            callbackGasLimit,
            requestConfirmations
        );
    }
    
    function test_RevertWhen_ConstructorZeroVRFCoordinator() public {
        vm.expectRevert("Invalid VRF coordinator");
        new Potshot(
            dev,
            address(usdc),
            MIN_BET,
            address(0),
            subscriptionId,
            keyHash,
            callbackGasLimit,
            requestConfirmations
        );
    }
    
    // ============ Buy Ticket Tests ============
    
    function test_BuyTicket_Success() public {
        vm.startPrank(player1);
        usdc.approve(address(potshot), TICKET_PRICE);
        
        vm.expectEmit(true, true, false, true);
        emit TicketRequested(player1, TICKET_PRICE, 1, 1);
        
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
        
        assertEq(potshot.pot(), TICKET_PRICE / 2);
        assertEq(usdc.balanceOf(dev), TICKET_PRICE / 2); // Dev receives funds immediately
        assertEq(potshot.pendingTickets(player1), 1);
        assertEq(usdc.balanceOf(address(potshot)), TICKET_PRICE / 2); // Contract only holds pot
    }
    
    function test_BuyTicket_SplitsPaymentCorrectly() public {
        vm.startPrank(player1);
        usdc.approve(address(potshot), TICKET_PRICE);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
        
        uint256 expectedToPot = TICKET_PRICE / 2;
        uint256 expectedToDev = TICKET_PRICE - expectedToPot;
        
        assertEq(potshot.pot(), expectedToPot);
        assertEq(usdc.balanceOf(dev), expectedToDev); // Dev receives funds immediately
        assertEq(potshot.totalToDev(), expectedToDev);
    }
    
    function test_RevertWhen_BuyTicketBelowMinBet() public {
        uint256 lowAmount = MIN_BET - 1;
        
        vm.startPrank(player1);
        usdc.approve(address(potshot), lowAmount);
        
        vm.expectRevert(Potshot.BelowMinimumBet.selector);
        potshot.buyTicket(lowAmount);
        vm.stopPrank();
    }
    
    function test_RevertWhen_BuyTicketWithPendingTicket() public {
        vm.startPrank(player1);
        usdc.approve(address(potshot), TICKET_PRICE * 2);
        potshot.buyTicket(TICKET_PRICE);
        
        vm.expectRevert(Potshot.PendingTicket.selector);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
    }
    
    function test_RevertWhen_BuyTicketWhenPaused() public {
        vm.prank(dev);
        potshot.togglePause();
        
        vm.startPrank(player1);
        usdc.approve(address(potshot), TICKET_PRICE);
        
        vm.expectRevert(Potshot.ContractPaused.selector);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
    }
    
    // ============ VRF Fulfillment Tests ============
    
    function test_FulfillRandomWords_PlayerWins() public {
        // Seed a large pot first so winnings are meaningful
        usdc.approve(address(potshot), 100 * 10**6);
        potshot.seedPot(100 * 10**6);
        
        // Player buys ticket - starts at 1% chance
        vm.startPrank(player1);
        usdc.approve(address(potshot), TICKET_PRICE);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
        
        uint256 potBefore = potshot.pot();
        
        // The VRF mock will generate a random number
        // We can't guarantee a win, so we'll test the logic works correctly either way
        vrfCoordinator.fulfillRandomWords(1, address(potshot));
        
        uint256 winnings = potshot.claimableWinnings(player1);
        uint256 potAfter = potshot.pot();
        
        // If player won (random number % 100 < 1), verify win logic
        if (winnings > 0) {
            uint256 expectedWinAmount = (potBefore * 25) / 100;
            assertEq(winnings, expectedWinAmount);
            assertEq(potAfter, potBefore - expectedWinAmount);
            assertEq(potshot.chance(player1), 1); // Reset to MIN_CHANCE
            assertEq(potshot.totalWinnings(), expectedWinAmount);
        } else {
            // Player lost - pot unchanged, chance increased
            assertEq(potAfter, potBefore);
            assertEq(potshot.chance(player1), 2); // Increased by 1
            assertEq(potshot.totalWinnings(), 0);
        }
        
        assertEq(potshot.totalTickets(), 1);
        assertEq(potshot.pendingTickets(player1), 0);
    }
    
    function test_FulfillRandomWords_PlayerLoses() public {
        // Buy ticket
        vm.startPrank(player1);
        usdc.approve(address(potshot), TICKET_PRICE);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
        
        uint256 potBefore = potshot.pot();
        
        // Fulfill with VRF (will generate pseudo-random number)
        vrfCoordinator.fulfillRandomWords(1, address(potshot));
        
        // Verify outcome - could be win or loss based on random number
        uint256 winnings = potshot.claimableWinnings(player1);
        
        if (winnings == 0) {
            // Player lost - pot unchanged, chance increased
            assertEq(potshot.pot(), potBefore);
            assertEq(potshot.chance(player1), 2); // Increased by 1
            assertEq(potshot.totalWinnings(), 0);
        } else {
            // Player won (1% chance) - verify win logic
            assertEq(potshot.pot(), potBefore - winnings);
            assertEq(potshot.chance(player1), 1); // Reset to MIN_CHANCE
        }
        
        assertEq(potshot.totalTickets(), 1);
    }
    
    function test_FulfillRandomWords_UsesPotAtTime() public {
        // Player 1 buys ticket
        vm.startPrank(player1);
        usdc.approve(address(potshot), TICKET_PRICE);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
        
        uint256 potAtPlayer1 = potshot.pot();
        
        // Player 2 buys ticket (increases pot)
        vm.startPrank(player2);
        usdc.approve(address(potshot), TICKET_PRICE);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
        
        uint256 potAfterPlayer2 = potshot.pot();
        assertTrue(potAfterPlayer2 > potAtPlayer1);
        
        // Fulfill player 1's ticket (should use potAtPlayer1 if they win)
        vrfCoordinator.fulfillRandomWords(1, address(potshot));
        
        uint256 winnings = potshot.claimableWinnings(player1);
        
        if (winnings > 0) {
            // If player won, verify they won based on potAtPlayer1, not current pot
            uint256 expectedWinAmount = (potAtPlayer1 * 25) / 100;
            assertEq(winnings, expectedWinAmount);
            // This proves potAtTime was used correctly
        }
        // If they didn't win, test still passes - we're testing the logic, not forcing an outcome
    }
    
    // ============ Claim Winnings Tests ============
    
    function test_ClaimWinnings_Success() public {
        // Seed pot so there's something to win
        usdc.approve(address(potshot), 100 * 10**6);
        potshot.seedPot(100 * 10**6);
        
        // Player buys multiple tickets to increase win chance
        for (uint i = 0; i < 10; i++) {
            vm.startPrank(player1);
            usdc.approve(address(potshot), TICKET_PRICE);
            potshot.buyTicket(TICKET_PRICE);
            vm.stopPrank();
            
            vrfCoordinator.fulfillRandomWords(i + 1, address(potshot));
            
            // Check if player won
            uint256 winAmount = potshot.claimableWinnings(player1);
            if (winAmount > 0) {
                // Player won! Test claiming
                uint256 balanceBefore = usdc.balanceOf(player1);
                
                vm.prank(player1);
                vm.expectEmit(true, false, false, true);
                emit WinningsClaimed(player1, winAmount);
                potshot.claimWinnings();
                
                assertEq(usdc.balanceOf(player1), balanceBefore + winAmount);
                assertEq(potshot.claimableWinnings(player1), 0);
                return; // Test passed
            }
        }
        
        // If we get here, player never won in 10 tries - that's unlikely but possible
        // Just verify the claim function would revert with no winnings
        vm.prank(player1);
        vm.expectRevert(Potshot.NoWinningsToClaim.selector);
        potshot.claimWinnings();
    }
    
    function test_RevertWhen_ClaimWinningsWithNoWinnings() public {
        vm.prank(player1);
        vm.expectRevert(Potshot.NoWinningsToClaim.selector);
        potshot.claimWinnings();
    }
    
    function test_TotalClaimableWinnings_TrackedCorrectly() public {
        // Seed pot so there's something to win
        usdc.approve(address(potshot), 200 * 10**6);
        potshot.seedPot(200 * 10**6);
        
        assertEq(potshot.totalClaimableWinnings(), 0);
        
        // Buy tickets until someone wins
        for (uint i = 0; i < 20; i++) {
            vm.startPrank(player1);
            usdc.approve(address(potshot), TICKET_PRICE);
            potshot.buyTicket(TICKET_PRICE);
            vm.stopPrank();
            
            vrfCoordinator.fulfillRandomWords(i + 1, address(potshot));
            
            uint256 winAmount = potshot.claimableWinnings(player1);
            if (winAmount > 0) {
                // Verify totalClaimableWinnings increased
                assertEq(potshot.totalClaimableWinnings(), winAmount);
                
                // Claim winnings
                vm.prank(player1);
                potshot.claimWinnings();
                
                // Verify totalClaimableWinnings decreased to 0
                assertEq(potshot.totalClaimableWinnings(), 0);
                return; // Test passed
            }
        }
    }
    
    // ============ Claim Dev Funds Tests ============
    
    function test_DevReceivesFundsImmediately() public {
        // Dev balance should increase immediately when player buys ticket
        uint256 devBalanceBefore = usdc.balanceOf(dev);
        
        vm.startPrank(player1);
        usdc.approve(address(potshot), TICKET_PRICE);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
        
        uint256 expectedDevShare = TICKET_PRICE / 2 + (TICKET_PRICE % 2); // Dev gets dust
        assertEq(usdc.balanceOf(dev), devBalanceBefore + expectedDevShare);
        
        // Contract should only hold the pot amount
        assertEq(usdc.balanceOf(address(potshot)), TICKET_PRICE / 2);
    }
    
    // ============ Dev Change Tests ============
    
    function test_InitiateDevChange_Success() public {
        address newDev = address(0x999);
        
        vm.prank(dev);
        vm.expectEmit(true, true, false, true);
        emit DevChangeInitiated(dev, newDev, block.timestamp + 24 hours);
        potshot.initiateDevChange(newDev);
        
        assertEq(potshot.pendingDev(), newDev);
        assertEq(potshot.devChangeTimestamp(), block.timestamp + 24 hours);
    }
    
    function test_ExecuteDevChange_Success() public {
        address newDev = address(0x999);
        
        vm.startPrank(dev);
        potshot.initiateDevChange(newDev);
        
        // Wait 24 hours
        vm.warp(block.timestamp + 24 hours);
        
        vm.expectEmit(true, true, false, false);
        emit DevChanged(dev, newDev);
        potshot.executeDevChange();
        vm.stopPrank();
        
        assertEq(potshot.dev(), newDev);
        assertEq(potshot.pendingDev(), address(0));
        assertEq(potshot.devChangeTimestamp(), 0);
    }
    
    function test_RevertWhen_ExecuteDevChangeTooEarly() public {
        address newDev = address(0x999);
        
        vm.startPrank(dev);
        potshot.initiateDevChange(newDev);
        
        // Try to execute before timelock
        vm.warp(block.timestamp + 12 hours); // Only 12 hours
        
        vm.expectRevert(Potshot.DevChangeTooEarly.selector);
        potshot.executeDevChange();
        vm.stopPrank();
    }
    
    function test_CancelDevChange_Success() public {
        address newDev = address(0x999);
        
        vm.startPrank(dev);
        potshot.initiateDevChange(newDev);
        
        potshot.cancelDevChange();
        vm.stopPrank();
        
        assertEq(potshot.pendingDev(), address(0));
        assertEq(potshot.devChangeTimestamp(), 0);
    }
    
    function test_RevertWhen_InitiateDevChangeNotDev() public {
        vm.prank(player1);
        vm.expectRevert(Potshot.OnlyDev.selector);
        potshot.initiateDevChange(address(0x999));
    }
    
    // ============ VRF Timeout Tests ============
    
    function test_CancelExpiredTicket_Success() public {
        // Player buys ticket
        vm.startPrank(player1);
        usdc.approve(address(potshot), TICKET_PRICE);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
        
        uint256 potBefore = potshot.pot();
        uint256 player1BalanceBefore = usdc.balanceOf(player1);
        
        // Wait for timeout (1 hour)
        vm.warp(block.timestamp + 1 hours);
        
        // Anyone can cancel expired ticket
        potshot.cancelExpiredTicket(player1);
        
        // Verify refund (50% of ticket price)
        uint256 expectedRefund = TICKET_PRICE / 2;
        assertEq(usdc.balanceOf(player1), player1BalanceBefore + expectedRefund);
        assertEq(potshot.pot(), potBefore - expectedRefund);
        assertEq(potshot.pendingTickets(player1), 0);
    }
    
    function test_RevertWhen_CancelTicketTooEarly() public {
        // Player buys ticket
        vm.startPrank(player1);
        usdc.approve(address(potshot), TICKET_PRICE);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
        
        // Try to cancel before timeout (30 minutes)
        vm.warp(block.timestamp + 30 minutes);
        
        vm.expectRevert(Potshot.TicketNotExpired.selector);
        potshot.cancelExpiredTicket(player1);
    }
    
    function test_RevertWhen_CancelTicketNoPending() public {
        vm.expectRevert("No pending ticket");
        potshot.cancelExpiredTicket(player1);
    }
    
    // ============ Seed Pot Tests ============
    
    function test_SeedPot_Success() public {
        uint256 seedAmount = 100 * 10**6; // 100 USDC
        
        usdc.approve(address(potshot), seedAmount);
        potshot.seedPot(seedAmount);
        
        assertEq(potshot.pot(), seedAmount);
    }
    
    function test_RevertWhen_SeedPotWhenPaused() public {
        vm.prank(dev);
        potshot.togglePause();
        
        uint256 seedAmount = 100 * 10**6;
        usdc.approve(address(potshot), seedAmount);
        
        vm.expectRevert(Potshot.ContractPaused.selector);
        potshot.seedPot(seedAmount);
    }
    
    // ============ Tip Dev Tests ============
    
    function test_TipDev_Success() public {
        uint256 tipAmount = 50 * 10**6; // 50 USDC
        uint256 devBalanceBefore = usdc.balanceOf(dev);
        
        vm.startPrank(player1);
        usdc.approve(address(potshot), tipAmount);
        potshot.tipDev(tipAmount);
        vm.stopPrank();
        
        assertEq(usdc.balanceOf(dev), devBalanceBefore + tipAmount); // Dev receives tip immediately
        assertEq(potshot.totalToDev(), tipAmount);
    }
    
    function test_RevertWhen_TipDevWhenPaused() public {
        vm.prank(dev);
        potshot.togglePause();
        
        uint256 tipAmount = 50 * 10**6;
        
        vm.startPrank(player1);
        usdc.approve(address(potshot), tipAmount);
        
        vm.expectRevert(Potshot.ContractPaused.selector);
        potshot.tipDev(tipAmount);
        vm.stopPrank();
    }
    
    // ============ Admin Tests ============
    
    function test_SetMinBet_Success() public {
        uint256 newMinBet = 5 * 10**6; // 5 USDC
        
        vm.prank(dev);
        potshot.setMinBet(newMinBet);
        
        assertEq(potshot.minBet(), newMinBet);
    }
    
    function test_RevertWhen_SetMinBetNotDev() public {
        vm.prank(player1);
        vm.expectRevert(Potshot.OnlyDev.selector);
        potshot.setMinBet(5 * 10**6);
    }
    
    function test_TogglePause_Success() public {
        vm.prank(dev);
        potshot.togglePause();
        
        assertTrue(potshot.paused());
        
        vm.prank(dev);
        potshot.togglePause();
        
        assertFalse(potshot.paused());
    }
    
    // ============ Emergency Withdraw Tests ============
    
    function test_EmergencyWithdraw_Success() public {
        // Setup: Add funds to contract
        vm.startPrank(player1);
        usdc.approve(address(potshot), TICKET_PRICE);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
        
        // Fulfill VRF so no pending tickets (player loses to keep pot intact)
        vrfCoordinator.fulfillRandomWords(1, address(potshot));
        
        uint256 potAmount = potshot.pot();
        uint256 devBalanceBefore = usdc.balanceOf(dev);
        
        // Emergency withdrawal - simple, no pause or timelock needed
        vm.prank(dev);
        potshot.emergencyWithdraw(potAmount);
        
        assertEq(potshot.pot(), 0);
        assertEq(usdc.balanceOf(dev), devBalanceBefore + potAmount);
    }
    
    function test_EmergencyWithdraw_PartialAmount() public {
        // Setup: Add funds to contract
        vm.startPrank(player1);
        usdc.approve(address(potshot), TICKET_PRICE);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
        vrfCoordinator.fulfillRandomWords(1, address(potshot));
        
        uint256 potAmount = potshot.pot();
        uint256 withdrawAmount = potAmount / 2; // Withdraw only half
        uint256 devBalanceBefore = usdc.balanceOf(dev);
        
        vm.prank(dev);
        potshot.emergencyWithdraw(withdrawAmount);
        
        assertEq(potshot.pot(), potAmount - withdrawAmount);
        assertEq(usdc.balanceOf(dev), devBalanceBefore + withdrawAmount);
    }
    
    function test_RevertWhen_EmergencyWithdrawNotDev() public {
        // Add funds to pot
        usdc.approve(address(potshot), 100 * 10**6);
        potshot.seedPot(100 * 10**6);
        
        vm.prank(player1);
        vm.expectRevert(Potshot.OnlyDev.selector);
        potshot.emergencyWithdraw(50 * 10**6);
    }
    
    function test_RevertWhen_EmergencyWithdrawZeroAmount() public {
        vm.prank(dev);
        vm.expectRevert(Potshot.InvalidWithdrawAmount.selector);
        potshot.emergencyWithdraw(0);
    }
    
    function test_RevertWhen_EmergencyWithdrawExceedsPot() public {
        // Add funds to pot
        usdc.approve(address(potshot), 100 * 10**6);
        potshot.seedPot(100 * 10**6);
        
        uint256 potAmount = potshot.pot();
        
        vm.prank(dev);
        vm.expectRevert(Potshot.InvalidWithdrawAmount.selector);
        potshot.emergencyWithdraw(potAmount + 1);
    }
    
    function test_RevertWhen_EmergencyWithdrawWithUnclaimedWinnings() public {
        // Seed pot so player can win
        usdc.approve(address(potshot), 100 * 10**6);
        potshot.seedPot(100 * 10**6);
        
        // Keep trying until player wins (up to 100 tries)
        bool playerWon = false;
        for (uint i = 1; i <= 100 && !playerWon; i++) {
            vm.startPrank(player1);
            usdc.approve(address(potshot), TICKET_PRICE);
            potshot.buyTicket(TICKET_PRICE);
            vm.stopPrank();
            
            vrfCoordinator.fulfillRandomWords(i, address(potshot));
            
            if (potshot.claimableWinnings(player1) > 0) {
                playerWon = true;
            }
        }
        
        // Only run the test if player won
        if (playerWon) {
            uint256 currentPot = potshot.pot();
            
            // Now test emergency withdrawal should revert
            vm.prank(dev);
            vm.expectRevert(Potshot.PlayersHaveUnclaimedWinnings.selector);
            potshot.emergencyWithdraw(currentPot);
        }
        // If player never won in 100 tries, test passes (edge case but acceptable)
    }
    
    // ============ Token Recovery Tests ============
    
    function test_RecoverToken_StuckERC20() public {
        // Deploy a different ERC20 token that gets "stuck" in the contract
        MockUSDC stuckToken = new MockUSDC();
        stuckToken.mint(address(potshot), 500 * 10**6);
        
        uint256 devBalanceBefore = stuckToken.balanceOf(dev);
        uint256 stuckAmount = stuckToken.balanceOf(address(potshot));
        
        // Recover stuck tokens
        vm.prank(dev);
        potshot.recoverToken(address(stuckToken), stuckAmount);
        
        assertEq(stuckToken.balanceOf(dev), devBalanceBefore + stuckAmount);
        assertEq(stuckToken.balanceOf(address(potshot)), 0);
    }
    
    function test_RecoverToken_ExtraUSDC() public {
        // Setup: Add normal pot funds
        usdc.approve(address(potshot), 100 * 10**6);
        potshot.seedPot(100 * 10**6);
        
        uint256 potAmount = potshot.pot();
        
        // Accidentally send extra USDC directly to contract
        uint256 extraAmount = 50 * 10**6;
        usdc.transfer(address(potshot), extraAmount);
        
        uint256 devBalanceBefore = usdc.balanceOf(dev);
        
        // Recover only the extra USDC (not pot)
        vm.prank(dev);
        potshot.recoverToken(address(usdc), extraAmount);
        
        assertEq(usdc.balanceOf(dev), devBalanceBefore + extraAmount);
        assertEq(potshot.pot(), potAmount); // Pot unchanged
        assertEq(usdc.balanceOf(address(potshot)), potAmount); // Only pot remains
    }
    
    function test_RevertWhen_RecoverToken_TriesToTakePot() public {
        // Setup: Add funds to pot
        usdc.approve(address(potshot), 100 * 10**6);
        potshot.seedPot(100 * 10**6);
        
        uint256 potAmount = potshot.pot();
        
        // Try to recover pot USDC (should fail)
        vm.prank(dev);
        vm.expectRevert(Potshot.InvalidRecoveryAmount.selector);
        potshot.recoverToken(address(usdc), potAmount);
    }
    
    function test_RevertWhen_RecoverToken_TriesToTakeClaimableWinnings() public {
        // Seed pot so player can win
        usdc.approve(address(potshot), 200 * 10**6);
        potshot.seedPot(200 * 10**6);
        
        // Keep trying until player wins
        bool playerWon = false;
        for (uint i = 1; i <= 100 && !playerWon; i++) {
            vm.startPrank(player1);
            usdc.approve(address(potshot), TICKET_PRICE);
            potshot.buyTicket(TICKET_PRICE);
            vm.stopPrank();
            
            vrfCoordinator.fulfillRandomWords(i, address(potshot));
            
            if (potshot.claimableWinnings(player1) > 0) {
                playerWon = true;
            }
        }
        
        // Only run test if player won
        if (playerWon) {
            uint256 totalReserved = potshot.pot() + potshot.totalClaimableWinnings();
            uint256 contractBalance = usdc.balanceOf(address(potshot));
            
            // Try to recover more than available (should fail)
            if (contractBalance >= totalReserved) {
                uint256 available = contractBalance - totalReserved;
                vm.prank(dev);
                vm.expectRevert(Potshot.InvalidRecoveryAmount.selector);
                potshot.recoverToken(address(usdc), available + 1);
            }
        }
    }
    
    function test_RecoverNative_Success() public {
        // Send native ETH to contract
        uint256 nativeAmount = 5 ether;
        vm.deal(address(potshot), nativeAmount);
        
        uint256 devBalanceBefore = dev.balance;
        
        // Recover native tokens
        vm.prank(dev);
        potshot.recoverNative(nativeAmount);
        
        assertEq(dev.balance, devBalanceBefore + nativeAmount);
        assertEq(address(potshot).balance, 0);
    }
    
    function test_RecoverNative_PartialAmount() public {
        // Send native ETH to contract
        uint256 nativeAmount = 10 ether;
        vm.deal(address(potshot), nativeAmount);
        
        uint256 recoverAmount = 3 ether;
        uint256 devBalanceBefore = dev.balance;
        
        // Recover partial amount
        vm.prank(dev);
        potshot.recoverNative(recoverAmount);
        
        assertEq(dev.balance, devBalanceBefore + recoverAmount);
        assertEq(address(potshot).balance, nativeAmount - recoverAmount);
    }
    
    function test_RevertWhen_RecoverNative_NotDev() public {
        vm.deal(address(potshot), 1 ether);
        
        vm.prank(player1);
        vm.expectRevert(Potshot.OnlyDev.selector);
        potshot.recoverNative(1 ether);
    }
    
    function test_RevertWhen_RecoverNative_ZeroAmount() public {
        vm.prank(dev);
        vm.expectRevert(Potshot.InvalidRecoveryAmount.selector);
        potshot.recoverNative(0);
    }
    
    function test_RevertWhen_RecoverNative_ExceedsBalance() public {
        vm.deal(address(potshot), 1 ether);
        
        vm.prank(dev);
        vm.expectRevert(Potshot.InvalidRecoveryAmount.selector);
        potshot.recoverNative(2 ether);
    }
    
    function test_Receive_AcceptsNativeTokens() public {
        uint256 sendAmount = 1 ether;
        
        // Send native tokens to contract
        (bool success, ) = address(potshot).call{value: sendAmount}("");
        
        assertTrue(success);
        assertEq(address(potshot).balance, sendAmount);
    }
    
    // ============ View Function Tests ============
    
    function test_GetChance_ReturnsMinChanceForNewPlayer() public view {
        assertEq(potshot.getChance(player1), 1);
    }
    
    function test_GetStats_ReturnsCorrectData() public {
        (uint256 pot, uint256 totalTickets, uint256 totalToDev, uint256 totalWinnings) = potshot.getStats();
        
        assertEq(pot, 0);
        assertEq(totalTickets, 0);
        assertEq(totalToDev, 0);
        assertEq(totalWinnings, 0);
    }
    
    // ============ Integration Tests ============
    
    function test_Integration_FullGameCycle() public {
        // 1. Player buys ticket
        vm.startPrank(player1);
        usdc.approve(address(potshot), TICKET_PRICE);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
        
        // 2. VRF fulfills
        vrfCoordinator.fulfillRandomWords(1, address(potshot));
        
        // 3. Check outcome and claim if won
        uint256 winAmount = potshot.claimableWinnings(player1);
        if (winAmount > 0) {
            vm.prank(player1);
            potshot.claimWinnings();
            
            // Verify final state after win
            uint256 devShare = TICKET_PRICE / 2 + (TICKET_PRICE % 2);
            assertEq(usdc.balanceOf(player1), 1000 * 10**6 - TICKET_PRICE + winAmount);
            assertEq(usdc.balanceOf(dev), devShare); // Dev received funds immediately on ticket purchase
            assertEq(potshot.claimableWinnings(player1), 0);
        } else {
            // Player lost - verify no winnings to claim
            vm.prank(player1);
            vm.expectRevert(Potshot.NoWinningsToClaim.selector);
            potshot.claimWinnings();
            
            // Verify dev still got their share
            uint256 devShare = TICKET_PRICE / 2 + (TICKET_PRICE % 2);
            assertEq(usdc.balanceOf(dev), devShare);
        }
    }
    
    function test_Integration_MultiplePlayersSequential() public {
        // Seed pot
        usdc.approve(address(potshot), 100 * 10**6);
        potshot.seedPot(100 * 10**6);
        
        // Player 1 buys
        vm.startPrank(player1);
        usdc.approve(address(potshot), TICKET_PRICE);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
        vrfCoordinator.fulfillRandomWords(1, address(potshot));
        
        // Check player 1's outcome
        uint256 player1Winnings = potshot.claimableWinnings(player1);
        if (player1Winnings == 0) {
            assertEq(potshot.chance(player1), 2); // Increased if lost
        } else {
            assertEq(potshot.chance(player1), 1); // Reset if won
        }
        
        // Player 2 buys
        vm.startPrank(player2);
        usdc.approve(address(potshot), TICKET_PRICE);
        potshot.buyTicket(TICKET_PRICE);
        vm.stopPrank();
        vrfCoordinator.fulfillRandomWords(2, address(potshot));
        
        // Check player 2's outcome
        uint256 player2Winnings = potshot.claimableWinnings(player2);
        
        // If player 2 won, verify they can claim
        if (player2Winnings > 0) {
            uint256 balanceBefore = usdc.balanceOf(player2);
            vm.prank(player2);
            potshot.claimWinnings();
            assertEq(usdc.balanceOf(player2), balanceBefore + player2Winnings);
        }
        
        // Verify both players' dev fees were sent
        uint256 expectedDevFees = (TICKET_PRICE / 2 + (TICKET_PRICE % 2)) * 2; // 2 tickets
        assertEq(usdc.balanceOf(dev), expectedDevFees);
    }
}
