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

/**
 * @title PotshotFuzzTest
 * @notice Comprehensive fuzz tests for Potshot contract
 * @dev Tests invariants, edge cases, and property-based testing
 */
contract PotshotFuzzTest is Test {
    Potshot public potshot;
    VRFCoordinatorV2_5Mock public vrfCoordinator;
    MockUSDC public usdc;
    
    address public dev = address(0x1);
    address public constant PLAYER_BASE = address(0x1000);
    
    uint256 constant MIN_BET = 1 * 10**6;        // 1 USDC
    
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
    }
    
    // ============ Invariant Tests ============
    
    /**
     * @notice INVARIANT: Contract USDC balance should always equal pot + claimable winnings
     */
    function testFuzz_Invariant_ContractBalanceEqualsPotPlusWinnings(
        uint256 ticketAmount
    ) public {
        // Bound ticket amount to reasonable range
        ticketAmount = bound(ticketAmount, MIN_BET, 1000 * 10**6);
        
        address player = PLAYER_BASE;
        usdc.mint(player, ticketAmount * 2);
        
        // Seed pot to ensure there are funds for winnings
        usdc.mint(address(this), 100 * 10**6);
        usdc.approve(address(potshot), 100 * 10**6);
        potshot.seedPot(100 * 10**6);
        
        // Player buys ticket
        vm.startPrank(player);
        usdc.approve(address(potshot), ticketAmount);
        potshot.buyTicket(ticketAmount);
        vm.stopPrank();
        
        // Fulfill VRF
        vrfCoordinator.fulfillRandomWords(1, address(potshot));
        
        // Calculate expected balance
        uint256 expectedBalance = potshot.pot() + potshot.claimableWinnings(player);
        uint256 actualBalance = usdc.balanceOf(address(potshot));
        
        assertEq(actualBalance, expectedBalance, "Contract balance != pot + winnings");
    }
    
    /**
     * @notice INVARIANT: Pot should never decrease except for wins or emergency withdraw
     */
    function testFuzz_Invariant_PotOnlyDecreasesOnWin(
        uint256 ticketAmount
    ) public {
        ticketAmount = bound(ticketAmount, MIN_BET, 100 * 10**6);
        
        // Seed pot
        usdc.mint(address(this), 100 * 10**6);
        usdc.approve(address(potshot), 100 * 10**6);
        potshot.seedPot(100 * 10**6);
        
        uint256 potBefore = potshot.pot();
        
        address player = PLAYER_BASE;
        usdc.mint(player, ticketAmount);
        
        vm.startPrank(player);
        usdc.approve(address(potshot), ticketAmount);
        potshot.buyTicket(ticketAmount);
        vm.stopPrank();
        
        uint256 potAfterTicket = potshot.pot();
        
        // Pot should increase or stay same after ticket purchase
        assertGe(potAfterTicket, potBefore, "Pot decreased without win");
        
        vrfCoordinator.fulfillRandomWords(1, address(potshot));
        
        uint256 potAfterFulfill = potshot.pot();
        uint256 winAmount = potshot.claimableWinnings(player);
        
        if (winAmount > 0) {
            // If player won, pot should have decreased by win amount
            assertEq(potAfterFulfill, potAfterTicket - winAmount, "Pot decrease != win amount");
        } else {
            // If player lost, pot should remain unchanged
            assertEq(potAfterFulfill, potAfterTicket, "Pot changed without win");
        }
    }
    
    /**
     * @notice INVARIANT: Total paid to dev should equal sum of all ticket dev shares
     */
    function testFuzz_Invariant_DevSharesAccurate(
        uint8 numTickets,
        uint256 ticketAmount
    ) public {
        numTickets = uint8(bound(numTickets, 1, 20));
        ticketAmount = bound(ticketAmount, MIN_BET, 50 * 10**6);
        
        uint256 expectedDevTotal = 0;
        
        for (uint8 i = 0; i < numTickets; i++) {
            address player = address(uint160(PLAYER_BASE) + i);
            usdc.mint(player, ticketAmount);
            
            uint256 toPot = ticketAmount / 2;
            uint256 toDev = ticketAmount - toPot;
            expectedDevTotal += toDev;
            
            vm.startPrank(player);
            usdc.approve(address(potshot), ticketAmount);
            potshot.buyTicket(ticketAmount);
            vm.stopPrank();
            
            vrfCoordinator.fulfillRandomWords(i + 1, address(potshot));
        }
        
        assertEq(potshot.totalToDev(), expectedDevTotal, "Total dev share mismatch");
    }
    
    // ============ Boundary Tests ============
    
    /**
     * @notice Test minimum bet boundary
     */
    function testFuzz_BoundaryMinBet(uint256 amount) public {
        address player = PLAYER_BASE;
        usdc.mint(player, 10 * MIN_BET);
        
        vm.startPrank(player);
        usdc.approve(address(potshot), amount);
        
        if (amount < MIN_BET) {
            vm.expectRevert(Potshot.BelowMinimumBet.selector);
            potshot.buyTicket(amount);
        } else {
            // Should succeed for amounts >= MIN_BET
            if (amount <= 10 * MIN_BET) {
                potshot.buyTicket(amount);
                assertTrue(potshot.pendingTickets(player) > 0, "Ticket not created");
            }
        }
        vm.stopPrank();
    }
    
    /**
     * @notice Test chance progression
     */
    function testFuzz_ChanceProgression(uint8 numLosses) public {
        numLosses = uint8(bound(numLosses, 1, 15)); // Start from 1, not 0
        
        address player = PLAYER_BASE;
        usdc.mint(player, 1000 * 10**6);
        
        vm.startPrank(player);
        
        for (uint8 i = 0; i < numLosses; i++) {
            usdc.approve(address(potshot), MIN_BET);
            potshot.buyTicket(MIN_BET);
            
            // Fulfill with a losing outcome (override with high number)
            uint256[] memory randomWords = new uint256[](1);
            randomWords[0] = type(uint256).max - i; // Ensure loss
            
            vm.stopPrank();
            vrfCoordinator.fulfillRandomWordsWithOverride(i + 1, address(potshot), randomWords);
            vm.startPrank(player);
            
            // Verify winnings
            if (potshot.claimableWinnings(player) > 0) {
                // Player won unexpectedly, break
                break;
            }
        }
        
        vm.stopPrank();
        
        uint8 finalChance = potshot.chance(player);
        
        // Chance should be min(initial + losses, MAX_CHANCE)
        // Initial chance is 1, after numLosses it becomes min(1 + numLosses, 10)
        uint8 expectedChance = numLosses >= 9 ? 10 : uint8(1 + numLosses);
        assertEq(finalChance, expectedChance, "Chance progression incorrect");
    }
    
    /**
     * @notice Test win percentage calculation
     */
    function testFuzz_WinPercentageAccurate(uint256 potAmount) public {
        potAmount = bound(potAmount, 100 * 10**6, 10000 * 10**6);
        
        // Seed pot
        usdc.mint(address(this), potAmount);
        usdc.approve(address(potshot), potAmount);
        potshot.seedPot(potAmount);
        
        address player = PLAYER_BASE;
        usdc.mint(player, MIN_BET);
        
        vm.startPrank(player);
        usdc.approve(address(potshot), MIN_BET);
        potshot.buyTicket(MIN_BET);
        vm.stopPrank();
        
        uint256 potAtTime = potAmount + (MIN_BET / 2);
        
        // Force a win
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 0; // 0 % 100 = 0, which is < 1 (player's chance)
        
        vrfCoordinator.fulfillRandomWordsWithOverride(1, address(potshot), randomWords);
        
        uint256 winAmount = potshot.claimableWinnings(player);
        uint256 expectedWin = (potAtTime * 25) / 100;
        
        assertEq(winAmount, expectedWin, "Win amount != 25% of pot");
    }
    
    // ============ Edge Case Tests ============
    
    /**
     * @notice Test odd ticket amounts (dust handling)
     */
    function testFuzz_OddAmounts(uint256 ticketAmount) public {
        // Test odd numbers to ensure dust is handled correctly
        ticketAmount = bound(ticketAmount, MIN_BET, 1000 * 10**6);
        if (ticketAmount % 2 == 0) {
            ticketAmount += 1; // Make it odd
        }
        
        address player = PLAYER_BASE;
        usdc.mint(player, ticketAmount);
        
        uint256 devBalanceBefore = usdc.balanceOf(dev);
        
        vm.startPrank(player);
        usdc.approve(address(potshot), ticketAmount);
        potshot.buyTicket(ticketAmount);
        vm.stopPrank();
        
        uint256 toPot = ticketAmount / 2;
        uint256 toDev = ticketAmount - toPot; // Dev gets the dust
        
        assertEq(potshot.pot(), toPot, "Pot amount incorrect");
        assertEq(usdc.balanceOf(dev), devBalanceBefore + toDev, "Dev didn't get dust");
        assertEq(toPot + toDev, ticketAmount, "Split doesn't add up");
    }
    
    /**
     * @notice Test multiple sequential wins (pot depletion)
     */
    function testFuzz_MultipleWinsPotDepletion(uint8 numWins) public {
        numWins = uint8(bound(numWins, 1, 5));
        
        // Seed a large pot
        usdc.mint(address(this), 1000 * 10**6);
        usdc.approve(address(potshot), 1000 * 10**6);
        potshot.seedPot(1000 * 10**6);
        
        uint256 initialPot = potshot.pot();
        uint256 totalWon = 0;
        
        for (uint8 i = 0; i < numWins; i++) {
            address player = address(uint160(PLAYER_BASE) + i);
            usdc.mint(player, MIN_BET);
            
            vm.startPrank(player);
            usdc.approve(address(potshot), MIN_BET);
            potshot.buyTicket(MIN_BET);
            vm.stopPrank();
            
            // Force win
            uint256[] memory randomWords = new uint256[](1);
            randomWords[0] = 0;
            
            vrfCoordinator.fulfillRandomWordsWithOverride(i + 1, address(potshot), randomWords);
            
            uint256 winAmount = potshot.claimableWinnings(player);
            totalWon += winAmount;
        }
        
        // Pot should have decreased by total winnings
        assertLe(potshot.pot(), initialPot, "Pot increased after wins");
        assertGe(initialPot, totalWon, "Total won exceeds initial pot");
    }
    
    /**
     * @notice Test pot at time is used for win calculation
     */
    function testFuzz_PotAtTimeUsedForWin(
        uint256 ticket1Amount,
        uint256 ticket2Amount
    ) public {
        ticket1Amount = bound(ticket1Amount, MIN_BET, 100 * 10**6);
        ticket2Amount = bound(ticket2Amount, MIN_BET, 100 * 10**6);
        
        address player1 = PLAYER_BASE;
        address player2 = address(uint160(PLAYER_BASE) + 1);
        
        usdc.mint(player1, ticket1Amount);
        usdc.mint(player2, ticket2Amount);
        
        // Player 1 buys
        vm.startPrank(player1);
        usdc.approve(address(potshot), ticket1Amount);
        potshot.buyTicket(ticket1Amount);
        vm.stopPrank();
        
        uint256 potAfterPlayer1 = potshot.pot();
        
        // Player 2 buys (increases pot)
        vm.startPrank(player2);
        usdc.approve(address(potshot), ticket2Amount);
        potshot.buyTicket(ticket2Amount);
        vm.stopPrank();
        
        uint256 potAfterPlayer2 = potshot.pot();
        assertTrue(potAfterPlayer2 > potAfterPlayer1, "Pot didn't increase");
        
        // Force player 1 to win
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 0;
        vrfCoordinator.fulfillRandomWordsWithOverride(1, address(potshot), randomWords);
        
        uint256 player1Winnings = potshot.claimableWinnings(player1);
        uint256 expectedWin = (potAfterPlayer1 * 25) / 100;
        
        // Player 1 should win based on pot at their ticket time, not current pot
        assertEq(player1Winnings, expectedWin, "Win not based on potAtTime");
    }
    
    /**
     * @notice Test that chance resets after win
     */
    function testFuzz_ChanceResetsAfterWin(uint8 currentChance) public {
        currentChance = uint8(bound(currentChance, 2, 10)); // Start from 2 to ensure at least 1 loss
        
        address player = PLAYER_BASE;
        usdc.mint(player, 1000 * 10**6);
        
        // Seed pot
        usdc.mint(address(this), 1000 * 10**6);
        usdc.approve(address(potshot), 1000 * 10**6);
        potshot.seedPot(1000 * 10**6);
        
        // Build up chance by losing
        vm.startPrank(player);
        for (uint8 i = 1; i < currentChance; i++) {
            usdc.approve(address(potshot), MIN_BET);
            potshot.buyTicket(MIN_BET);
            
            uint256[] memory randomWords = new uint256[](1);
            randomWords[0] = type(uint256).max; // Ensure loss
            
            vm.stopPrank();
            vrfCoordinator.fulfillRandomWordsWithOverride(i, address(potshot), randomWords);
            vm.startPrank(player);
        }
        vm.stopPrank();
        
        assertEq(potshot.chance(player), currentChance, "Chance setup incorrect");
        
        // Now make player win
        vm.startPrank(player);
        usdc.approve(address(potshot), MIN_BET);
        potshot.buyTicket(MIN_BET);
        vm.stopPrank();
        
        uint256[] memory winWords = new uint256[](1);
        winWords[0] = 0; // Force win
        
        vrfCoordinator.fulfillRandomWordsWithOverride(currentChance, address(potshot), winWords);
        
        // Chance should reset to 1
        assertEq(potshot.chance(player), 1, "Chance didn't reset after win");
    }
    
    /**
     * @notice Test reentrancy protection
     */
    function testFuzz_ReentrancyProtection(uint256 ticketAmount) public {
        ticketAmount = bound(ticketAmount, MIN_BET, 100 * 10**6);
        
        address player = PLAYER_BASE;
        usdc.mint(player, ticketAmount * 2);
        
        vm.startPrank(player);
        usdc.approve(address(potshot), ticketAmount * 2);
        
        // Buy first ticket
        potshot.buyTicket(ticketAmount);
        
        // Try to buy second ticket while first is pending
        vm.expectRevert(Potshot.PendingTicket.selector);
        potshot.buyTicket(ticketAmount);
        
        vm.stopPrank();
    }
    
    /**
     * @notice Test dev change timelock
     */
    function testFuzz_DevChangeTimelock(uint256 timeAdvance) public {
        timeAdvance = bound(timeAdvance, 0, 48 hours);
        
        address newDev = address(0x999);
        
        vm.startPrank(dev);
        potshot.initiateDevChange(newDev);
        
        vm.warp(block.timestamp + timeAdvance);
        
        if (timeAdvance < 24 hours) {
            vm.expectRevert(Potshot.DevChangeTooEarly.selector);
            potshot.executeDevChange();
        } else {
            potshot.executeDevChange();
            assertEq(potshot.dev(), newDev, "Dev not changed");
        }
        
        vm.stopPrank();
    }
    
    /**
     * @notice Test min bet updates
     */
    function testFuzz_MinBetUpdate(uint256 newMinBet) public {
        newMinBet = bound(newMinBet, 1, 1000 * 10**6);
        
        vm.prank(dev);
        potshot.setMinBet(newMinBet);
        
        assertEq(potshot.minBet(), newMinBet, "Min bet not updated");
        
        address player = PLAYER_BASE;
        usdc.mint(player, newMinBet);
        
        vm.startPrank(player);
        usdc.approve(address(potshot), newMinBet);
        potshot.buyTicket(newMinBet);
        vm.stopPrank();
        
        assertTrue(potshot.pendingTickets(player) > 0, "Ticket not created with new min bet");
    }
}
