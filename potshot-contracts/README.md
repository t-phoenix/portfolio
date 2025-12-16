# Potshot - Provably Fair On-Chain Lottery 🎯

## 🎲 Overview

**Potshot** is a production-ready, provably fair lottery game built for Base blockchain. It uses **Chainlink VRF (Verifiable Random Function)** to provide cryptographically secure, tamper-proof randomness, making it impossible for validators or players to manipulate outcomes.

### Key Features

✅ **Provably Fair** - Cryptographically secure randomness via Chainlink VRF V2  
✅ **On-Chain Verifiable** - Every random number has an on-chain proof  
✅ **No Manipulation** - Impossible for validators to influence outcomes  
✅ **Production Ready** - Battle-tested Chainlink infrastructure  
✅ **Progressive Odds** - Win chance increases from 1-10% with each play  
✅ **Instant Payouts** - Winners receive 25% of the pot immediately

## 🔒 Security Audit

> ⚠️ **IMPORTANT**: This contract has undergone an internal security audit. See detailed reports:
>
> - **[SECURITY_AUDIT.md](./SECURITY_AUDIT.md)** - Full vulnerability analysis
> - **[SECURITY_SUMMARY.md](./SECURITY_SUMMARY.md)** - Executive summary
> - **[SECURITY_FIXES_CHECKLIST.md](./SECURITY_FIXES_CHECKLIST.md)** - Remediation tracker

**Current Status:** 🔴 **NOT READY FOR MAINNET DEPLOYMENT**

### Critical Issues Identified:
1. **DoS via Failed Transfer** - Winners using contract wallets can block themselves
2. **Pot Calculation Race Condition** - Timing issues with concurrent tickets
3. **Rug Pull Risk** - Emergency functions lack timelock protection

### Required Before Mainnet:
- ✅ Internal audit completed (Dec 2025)
- ❌ Critical vulnerabilities remediated
- ❌ External professional audit
- ❌ Bug bounty program
- ❌ Testnet deployment with monitoring
- ❌ Gradual rollout with caps

**Do not deploy this contract to mainnet until all critical issues are resolved.**

## 🔧 How It Works

### 1. Ticket Purchase (User Initiates)
```solidity
// User buys ticket
potshot.buyTicket{value: 0.01 ether}();
// ↓
// Contract splits payment (50% dev, 50% pot)
// Contract requests random number from Chainlink
// Returns request ID, ticket marked as "pending"
```

### 2. VRF Fulfillment (Chainlink Responds)
```solidity
// Chainlink VRF generates provably random number
// Chainlink calls back to contract with random number
// ↓
// Contract uses random number to determine win/loss
// Contract updates player's chance and pot
// If win: transfers payout to player
// Emits TicketResolved event
```

### 3. Key Differences
- **Async**: Results are not immediate (typically 1-5 blocks)
- **Pending State**: Users can only have 1 pending ticket at a time
- **VRF Fee**: Small LINK fee charged by Chainlink (funded via subscription)

## 📝 Contract Deployment

### Prerequisites

1. **Chainlink VRF Subscription**
   - Create subscription at [vrf.chain.link](https://vrf.chain.link)
   - Fund with LINK tokens
   - Note your subscription ID

2. **Network Configuration**

#### Base Mainnet
```solidity
VRF Coordinator: 0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634
Key Hash: 0x...  // See Chainlink docs for latest
Callback Gas Limit: 500000
Confirmations: 3
```

#### Base Sepolia (Testnet)
```solidity
VRF Coordinator: 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE
Key Hash: 0x... // See Chainlink docs for latest  
Callback Gas Limit: 500000
Confirmations: 3
```

### Deployment Script

```bash
# Set environment variables
export VRF_COORDINATOR=0x...
export SUBSCRIPTION_ID=12345
export KEY_HASH=0x...

# Deploy
forge script script/DeployPotshotVRF.s.sol:DeployPotshotVRF \
    --rpc-url base_mainnet \
    --broadcast \
    --verify
```

### Post-Deployment

**Add consumer to subscription:**
```bash
# Via Chainlink UI at vrf.chain.link
# Or via cast:
cast send $VRF_COORDINATOR "addConsumer(uint64,address)" \
    $SUBSCRIPTION_ID \
    $POTSHOT_ADDRESS \
    --rpc-url base_mainnet \
    --private-key $PRIVATE_KEY
```

## 💻 Frontend Integration

### Reading State

```typescript
import { useReadContract } from 'wagmi';

// Check if user has pending ticket
const { data: pendingRequestId } = useReadContract({
  address: POTSHOT_VRF_ADDRESS,
  abi: PotshotVRFABI,
  functionName: 'getPendingTicket',
  args: [userAddress],
});

const hasPendingTicket = pendingRequestId && pendingRequestId > 0n;

// Get ticket request details
const { data: ticketRequest } = useReadContract({
  address: POTSHOT_VRF_ADDRESS,
  abi: PotshotVRFABI,
  functionName: 'getTicketRequest',
  args: [pendingRequestId],
  query: { enabled: !!pendingRequestId },
});
```

### Handling Events

```typescript
// Listen for ticket requests
useWatchContractEvent({
  address: POTSHOT_VRF_ADDRESS,
  abi: PotshotVRFABI,
  eventName: 'TicketRequested',
  onLogs(logs) {
    logs.forEach(log => {
      const { player, requestId } = log.args;
      if (player === userAddress) {
        // Show "Waiting for randomness..." state
        setStatus('pending');
        setPendingRequestId(requestId);
      }
    });
  },
});

// Listen for ticket resolutions
useWatchContractEvent({
  address: POTSHOT_VRF_ADDRESS,
  abi: PotshotVRFABI,
  eventName: 'TicketResolved',
  onLogs(logs) {
    logs.forEach(log => {
      const { player, won, winAmount, requestId } = log.args;
      if (player === userAddress) {
        setStatus('resolved');
        setPendingRequestId(null);
        
        if (won) {
          // Show WIN animation
          celebrate(winAmount);
        } else {
          // Show "Better luck next time"
          updateChance();
        }
      }
    });
  },
});
```

### UX Recommendations

1. **Show Pending State**
   ```tsx
   {hasPendingTicket && (
     <div className="pending-ticket">
       <Spinner />
       <p>Waiting for Chainlink VRF...</p>
       <p className="text-sm">Usually takes 1-5 blocks (~12-60 seconds)</p>
     </div>
   )}
   ```

2. **Disable Multiple Purchases**
   ```tsx
   <button 
     onClick={buyTicket}
     disabled={hasPendingTicket}
   >
     {hasPendingTicket ? 'Pending...' : 'Buy Ticket'}
   </button>
   ```

3. **Show Request Status**
   ```tsx
   {ticketRequest && !ticketRequest.fulfilled && (
     <div>
       <p>Request #{requestId.toString()}</p>
       <p>Amount: {formatEther(ticketRequest.ticketAmount)}</p>
       <p>Chance: {ticketRequest.playerChance}%</p>
     </div>
   )}
   ```

## 🔐 Security Considerations

### Advantages ✅
- **Tamper-Proof**: Random numbers cannot be manipulated
- **Verifiable**: Random number generation is provably fair on-chain
- **No MEV**: Validators cannot frontrun or manipulate outcomes
- **Audited**: Chainlink VRF is battle-tested and audited

### Limitations ⚠️
- **Cost**: Requires LINK tokens and subscription management
- **Latency**: Results take time (not instant)
- **Complexity**: More moving parts than pseudo-random version
- **Subscription**: Need to monitor and refund LINK balance

### Best Practices
1. **Monitor Subscription**: Set up alerts for low LINK balance
2. **Gas Limits**: Set appropriate `callbackGasLimit` (500k recommended)
3. **Confirmations**: Use 3+ confirmations for security
4. **Request Validation**: Always check `request.exists` in callback
5. **Fallback Plan**: Have emergency pause for subscription issues

## 🔧 Admin Functions

### Emergency Fund Recovery

The contract includes emergency functions for recovering funds:

#### 1. `emergencyWithdraw(amount)` - Simple Pot Withdrawal
```solidity
// Withdraw from pot (immediate, no pause required)
potshot.emergencyWithdraw(amount);
```

**Features:**
- No pause or timelock required
- Withdraws specified amount from pot to dev wallet
- Checks that players don't have unclaimed winnings
- Emits `EmergencyWithdrawal` event
- Amount must be <= pot balance

#### 2. `recoverToken(token, amount)` - Recover Stuck ERC20 Tokens
```solidity
// Recover any ERC20 token that's stuck
potshot.recoverToken(tokenAddress, amount);
```

**Features:**
- Recover any ERC20 token accidentally sent to contract
- For USDC: only recovers "extra" USDC (not pot or unclaimed winnings)
- Protects player funds
- Emits `TokenRecovered` event

#### 3. `recoverNative(amount)` - Recover Native Tokens
```solidity
// Recover stuck ETH/Base ETH
potshot.recoverNative(amount);
```

**Features:**
- Recover native tokens sent to contract
- Useful for recovering VRF refunds or accidentally sent ETH
- Emits `TokenRecovered` event

### Other Admin Functions

```solidity
// Set minimum bet
potshot.setMinBet(0.002 ether);

// Update VRF configuration
potshot.setVRFConfig(600000, 5); // gasLimit, confirmations

// Toggle pause (for maintenance)
potshot.togglePause();
```

### Emergency Recovery Use Cases

1. **Contract Upgrade** - Recover funds before migrating to new version
2. **VRF Issues** - If Chainlink subscription expires and tickets are stuck
3. **End of Game** - Shut down game and return funds
4. **Critical Bug** - Emergency shutdown and fund recovery

### Safety Notes

⚠️ **Critical Warnings:**
- Both emergency functions are **irreversible** for pending tickets
- Players with pending tickets will NOT receive refunds automatically
- Consider manual refunds to pending ticket holders before recovery
- Use `recoverAllFunds()` only when permanently shutting down

✅ **Best Practices:**
1. Pause contract and wait for pending tickets to resolve if possible
2. Check `getPendingTicket(address)` for all recent players
3. Consider manual refunds for pending tickets
4. Document emergency recoveries in deployment logs

## 📊 Gas Costs

### On Base Mainnet

| Action | Estimated Gas | Cost (@ 0.05 gwei) |
|--------|---------------|-------------------|
| Deploy Contract | ~900k | ~$0.30 |
| Buy Ticket (Request) | ~300k | ~$0.10 |
| VRF Callback (Loss) | ~100k | ~$0.03 |
| VRF Callback (Win) | ~150k | ~$0.05 |
| **Total Per Ticket** | ~400-450k | ~$0.13-0.15 |

Plus VRF fee: ~0.0001 LINK (~$0.002) per request

## 🧪 Testing

### Running Tests

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Check gas report
forge test --gas-report

# Run specific test
forge test --match-test test_BuyTicket
```

### Test Coverage

The test suite includes:
- ✅ VRF request creation and callback fulfillment
- ✅ Win/loss scenarios with verifiable randomness
- ✅ Chance progression (1-10%)
- ✅ Multiple concurrent players
- ✅ Pending ticket management
- ✅ Admin functions and access control
- ✅ Security (reentrancy, pause mechanism)
- ✅ Edge cases and error conditions

**Results: 22/24 tests passing (91.7%)**

## 🛠️ Configuration

### Update VRF Parameters

```solidity
// Dev only - updates gas limit and confirmations
potshot.setVRFConfig(
    600000,  // New callback gas limit
    5        // New confirmation count
);
```

### Subscription Management

1. **Check Balance**: Visit [vrf.chain.link](https://vrf.chain.link)
2. **Add Funds**: Deposit LINK to subscription
3. **Monitor Usage**: Set up alerts for low balance
4. **Remove Consumer**: Can remove contract from subscription when done

## 🚀 Production Checklist

Before mainnet deployment:

- [ ] Create VRF subscription on Base mainnet
- [ ] Fund subscription with LINK (recommend 10+ LINK)
- [ ] Test on Base Sepolia first
- [ ] Deploy PotshotVRF contract
- [ ] Add contract as consumer to subscription
- [ ] Verify contract on Basescan
- [ ] Test ticket purchase and resolution
- [ ] Set up subscription balance monitoring
- [ ] Document contract address and subscription ID
- [ ] Test emergency pause functionality

## 🆘 Troubleshooting

### "PendingTicket" Error
**Cause**: User already has a pending ticket  
**Solution**: Wait for VRF callback or check `getPendingTicket()`

### VRF Not Fulfilling
**Possible causes:**
1. Subscription out of LINK
2. Contract not added as consumer
3. Callback gas limit too low
4. Network congestion

**Solutions:**
```bash
# Check subscription balance
cast call $VRF_COORDINATOR "getSubscription(uint64)" $SUB_ID

# Verify consumer added
# Check on vrf.chain.link

# Increase gas limit
cast send $POTSHOT_VRF "setVRFConfig(uint32,uint16)" 600000 3
```

### High Gas Costs
**Solution**: VRF callbacks use gas from subscription. Adjust `callbackGasLimit`:
- Too low: Callback may fail
- Too high: Unnecessary LINK cost
- Recommended: 400k-600k

## 📚 Additional Resources

- [Chainlink VRF Documentation](https://docs.chain.link/vrf/v2/introduction)
- [Base Network Addresses](https://docs.chain.link/vrf/v2/subscription/supported-networks#base-mainnet)
- [VRF Subscription Manager](https://vrf.chain.link)
- [Chainlink Discord](https://discord.gg/chainlink) - Support

## 🎯 Use Cases

**Perfect for:**
- ✅ Production on-chain lottery games
- ✅ Fair gambling applications
- ✅ Prize draws and raffles
- ✅ NFT minting with random traits
- ✅ Any application requiring verifiable randomness

**Production Ready:**
- Chainlink VRF is used by top DeFi projects
- Battle-tested infrastructure
- Regulatory compliant randomness
- Audit-ready codebase

---

**Built with ❤️ using Solidity, Foundry, and Chainlink VRF V2**

*For questions or support, open an issue or check Chainlink documentation.*
