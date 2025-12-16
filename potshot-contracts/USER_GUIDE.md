# Potshot - User Guide

## Overview
Potshot is a provably fair lottery game using Chainlink VRF for verifiable randomness. Players buy tickets with USDC for a chance to win 25% of the shared pot.

---

## For Players

### How to Play

**1. Buy a Ticket**
```solidity
// Approve USDC first
usdc.approve(potshotAddress, amount);

// Buy ticket (minimum bet applies)
potshot.buyTicket(amount);
```

**2. Payment Split**
- 50% goes to pot (shared prize pool)
- 50% goes to developer

**3. Win Mechanics**
- Initial win chance: **1%**
- Each loss increases chance by **+1%** (max 10%)
- On win: get **25% of pot**, chance resets to 1%
- Randomness is verifiable via Chainlink VRF

**4. Claim Winnings**
```solidity
// Check your winnings
uint256 amount = potshot.claimableWinnings(msg.sender);

// Claim when ready
potshot.claimWinnings();
```

### View Functions

```solidity
// Your current win chance (1-10%)
potshot.getChance(yourAddress);

// Current pot size
potshot.getPot();

// Contract statistics
potshot.getStats(); // Returns: pot, totalTickets, totalToDev, totalWinnings

// Check pending ticket
potshot.getPendingTicket(yourAddress);

// Your claimable winnings
potshot.claimableWinnings(yourAddress);
```

### Rules & Limits
- **One ticket at a time** - Wait for VRF response before buying again
- **Minimum bet** - Check `potshot.minBet()` (set by admin)
- **VRF timeout** - If VRF doesn't respond in 1 hour, request refund via `cancelExpiredTicket()`

### Optional Features

**Seed the Pot** (help bootstrap the game)
```solidity
usdc.approve(potshotAddress, amount);
potshot.seedPot(amount); // Goes 100% to pot
```

**Tip the Developer**
```solidity
usdc.approve(potshotAddress, amount);
potshot.tipDev(amount); // Goes 100% to dev
```

---

## For Admins (Developer Only)

### Configuration Management

**Update Minimum Bet**
```solidity
potshot.setMinBet(newAmount); // In USDC (6 decimals)
```

**Update VRF Configuration**
```solidity
potshot.setVRFConfig(callbackGasLimit, requestConfirmations);
// callbackGasLimit: min 100,000
// requestConfirmations: 1-200
```

### Emergency Controls

**Pause/Unpause Contract**
```solidity
potshot.togglePause(); // Stops buyTicket(), seedPot(), tipDev()
// Note: VRF callbacks and claimWinnings still work during pause
```

**Change Developer Address** (24-hour timelock)
```solidity
// Step 1: Initiate change
potshot.initiateDevChange(newDevAddress);

// Step 2: Wait 24 hours, then execute
potshot.executeDevChange();

// Or cancel before execution
potshot.cancelDevChange();
```

**Emergency Withdrawal** (Simple, no timelock)
```solidity
// Withdraw from pot (immediate, no pause required)
potshot.emergencyWithdraw(amount);

// Requirements:
// - No players have unclaimed winnings
// - Amount <= pot balance
```

**Token Recovery** (Recover stuck tokens)
```solidity
// Recover any ERC20 token (e.g., accidentally sent tokens)
potshot.recoverToken(tokenAddress, amount);

// Recover native ETH/Base ETH
potshot.recoverNative(amount);

// For USDC recovery, only "extra" USDC (not pot or unclaimed winnings) can be recovered
```

### Monitoring & Analytics

**Key Metrics**
```solidity
potshot.pot();                    // Current pot size
potshot.totalTickets();           // Tickets resolved
potshot.totalToDev();             // Dev earnings
potshot.totalWinnings();          // Total won
potshot.totalClaimableWinnings(); // Pending claims
potshot.paused();                 // Pause state
```

**Dev Change Status**
```solidity
potshot.pendingDev();             // Pending new dev
potshot.devChangeTimestamp();     // When change can execute
```

**Player Data**
```solidity
potshot.chance(playerAddress);              // Player's win chance
potshot.claimableWinnings(playerAddress);   // Player's unclaimed winnings
potshot.pendingTickets(playerAddress);      // Player's pending VRF request
```

---

## Important Notes

⚠️ **Risk Warnings**
- This is a gambling application - never bet more than you can afford to lose
- Smart contracts carry inherent risks - see SECURITY_AUDIT.md
- Chainlink VRF can occasionally fail - use `cancelExpiredTicket()` after 1 hour

💡 **Best Practices**
- Always check `minBet` before buying tickets
- Monitor VRF request status if transaction seems stuck
- Claim winnings regularly (pull pattern)
- Use block explorers to verify randomness from Chainlink

📊 **How It Works**
1. Player submits ticket purchase → funds split 50/50
2. Chainlink VRF generates random number (verifiable on-chain)
3. Contract checks if `randomNumber % 100 < playerChance`
4. Winner gets 25% of pot at purchase time (uses `potAtTime`)
5. Winnings are credited to claimable balance (not auto-sent)

---

## Contract Addresses

**Mainnet:**
- Contract: `[TO BE DEPLOYED]`
- USDC: `[CHAIN_USDC_ADDRESS]`
- VRF Coordinator: `[CHAIN_VRF_COORDINATOR]`

**Testnet:**
- Contract: `[TESTNET_ADDRESS]`
- USDC: `[TESTNET_USDC]`
- VRF Coordinator: `[TESTNET_VRF]`

---

## Support

For questions, issues, or bug reports:
- GitHub: [repository_link]
- Twitter: [@potshot_game]
- Email: dev@potshot.game

**Found a bug?** Please report responsibly via email before public disclosure.
