# Potshot v2.1 - Deployment Checklist

**Version:** 2.1.0 (Security Fixes Applied)  
**Date:** December 13, 2025  
**Status:** ✅ Ready for Testnet

---

## ✅ Pre-Deployment Verification

### Code Quality
- [x] All tests passing (56/56)
- [x] No compiler warnings (except benign view warning)
- [x] Critical vulnerabilities fixed (5/5)
- [x] High-priority issues addressed (4/8 fixed, 4 accepted)
- [x] Gas optimizations applied
- [x] Code documented

### Security Checks
- [x] Emergency withdrawal checks for unclaimed player winnings
- [x] Player winnings protected from emergency withdrawal
- [x] Token recovery functions protect pot and unclaimed winnings
- [x] VRF timeout mechanism implemented
- [x] totalClaimableWinnings tracked correctly
- [x] Constructor validates all addresses
- [x] Pause mechanism works as intended

### Configuration
- [ ] VRF Coordinator address for target network
- [ ] VRF Subscription ID created and funded
- [ ] USDC address for target network verified
- [ ] Dev wallet address set correctly
- [ ] Min bet amount configured
- [ ] Callback gas limit appropriate (500,000)

---

## 🚀 Testnet Deployment (Base Sepolia)

### Step 1: Environment Setup
```bash
# Set environment variables
export PRIVATE_KEY="your_private_key"
export DEV_ADDRESS="your_dev_wallet"
export VRF_SUBSCRIPTION_ID="your_subscription_id"
export RPC_URL="https://sepolia.base.org"
```

### Step 2: Verify Configuration
```bash
# Base Sepolia addresses (pre-filled in deploy script)
USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
VRF Coordinator: 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE
Key Hash: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae
```

### Step 3: Deploy Contract
```bash
forge script script/DeployPotshot.s.sol:DeployPotshot \
  --rpc-url base_mainnet \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvvv
```

### Step 4: Post-Deployment Setup
- [ ] Add contract as VRF consumer: `vrfCoordinator.addConsumer(subscriptionId, potshotAddress)`
- [ ] Verify contract on Basescan
- [ ] Seed initial pot (optional): `potshot.seedPot(amount)`
- [ ] Test basic functionality

---

## 🧪 Testnet Testing Plan

### Phase 1: Basic Functionality (Week 1)
- [ ] Buy ticket with minimum bet
- [ ] Buy ticket with larger amount
- [ ] Verify dev receives 50% immediately
- [ ] Verify pot increases correctly
- [ ] Wait for VRF fulfillment
- [ ] Claim winnings (if won)
- [ ] Test chance progression (multiple tickets)

### Phase 2: VRF Timeout (Week 2)
- [ ] Simulate VRF failure (unfund subscription)
- [ ] Wait 1 hour
- [ ] Call `cancelExpiredTicket()`
- [ ] Verify 50% refund received
- [ ] Re-fund subscription
- [ ] Verify normal operation resumes

### Phase 3: Emergency Functions (Week 2-3)
- [ ] Test pause/unpause
- [ ] Verify new tickets blocked when paused
- [ ] Verify existing claims work when paused
- [ ] Test `emergencyWithdraw(amount)`
- [ ] Verify can't withdraw with unclaimed winnings
- [ ] Test `recoverToken()` with stuck ERC20
- [ ] Test `recoverNative()` with stuck ETH
- [ ] Verify token recovery protects pot and claimable winnings

### Phase 4: Dev Change (Week 3)
- [ ] Initiate dev change
- [ ] Verify 24-hour timelock
- [ ] Execute dev change after delay
- [ ] Verify new dev receives funds from subsequent tickets

### Phase 5: Stress Testing (Week 4)
- [ ] Multiple concurrent players
- [ ] High-value tickets
- [ ] Rapid ticket purchases
- [ ] Multiple winners in sequence
- [ ] Monitor gas costs
- [ ] Check for any edge cases

---

## 📊 Monitoring Dashboard

### Key Metrics to Track
- **Total Tickets:** `potshot.totalTickets()`
- **Pot Size:** `potshot.pot()`
- **Total to Dev:** `potshot.totalToDev()`
- **Total Winnings:** `potshot.totalWinnings()`
- **Total Claimable:** `potshot.totalClaimableWinnings()`
- **Paused Status:** `potshot.paused()`

### Events to Monitor
```javascript
// Listen for these events
TicketRequested(player, amount, requestId, playerChance)
TicketResolved(player, requestId, randomWord, won, winAmount, newChance, potAfter)
WinningsClaimed(player, amount)
DevFundsTransferred(dev, amount, source)
EmergencyWithdrawal(amount, potBefore)
TokenRecovered(token, amount)
TicketCancelled(player, requestId, refundAmount)
```

---

## 🚨 Incident Response Plan

### If VRF Stops Working
1. Check subscription is funded
2. Verify contract is still consumer
3. Wait 1 hour for timeout
4. Help players cancel expired tickets
5. Investigate and fix VRF issue

### If Exploit Detected
1. Immediately call `togglePause()`
2. Investigate exploit
3. Notify community
4. Ensure players claim their winnings
5. Execute `emergencyWithdraw()` if needed (immediate)
6. Deploy fix or migrate based on severity

### If Dev Wallet Compromised
1. If current dev still has control:
   - Immediately `initiateDevChange(newSafeWallet)`
   - Wait 24 hours
   - Execute change
2. If attacker has control:
   - Cannot be stopped (risk accepted per your choices)
   - Emergency withdrawal is immediate (no delay)
   - Player winnings still protected (can't withdraw if unclaimed winnings exist)

---

## 📈 Mainnet Deployment Criteria

### Must Have (Before Mainnet)
- [ ] 4+ weeks on testnet with no issues
- [ ] All test scenarios passed
- [ ] Gas costs acceptable
- [ ] VRF integration stable
- [ ] Community feedback positive

### Should Have (Recommended)
- [ ] External audit completed (optional but recommended)
- [ ] Bug bounty program set up ($10k+ reserve)
- [ ] Multi-sig dev wallet (2-of-3 or better)
- [ ] Monitoring/alerting system
- [ ] Incident response team

### Nice to Have
- [ ] Smart contract insurance
- [ ] Legal review
- [ ] Marketing campaign ready
- [ ] Community governance plan

---

## 🌐 Mainnet Deployment (Base Mainnet)

### Configuration for Mainnet
```bash
export PRIVATE_KEY="your_mainnet_private_key"
export DEV_ADDRESS="your_mainnet_dev_wallet"  # Preferably multi-sig
export VRF_SUBSCRIPTION_ID="your_mainnet_subscription_id"
export RPC_URL="https://mainnet.base.org"

# Base Mainnet addresses (pre-filled)
USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
VRF Coordinator: 0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634
Key Hash: 0x00b81b5a830cb0a4009fbd8904de511e28631e62ce5ad231373d3cdad373ccab
```

### Deployment Steps
1. Triple-check all configuration
2. Use multi-sig dev wallet if possible
3. Deploy with low min bet initially (1 USDC)
4. Seed pot with reasonable amount (100-1000 USDC)
5. Monitor closely for first week
6. Gradually increase limits if stable

### Post-Mainnet Launch
- [ ] Announce on social media
- [ ] Submit to DeFi safety auditors
- [ ] Set up bug bounty on ImmuneFi/Code4rena
- [ ] Monitor daily for first month
- [ ] Prepare incident response team
- [ ] Consider upgradeability plan for future

---

## 🎯 Success Criteria

### Week 1 (Testnet)
- ✅ Contract deploys successfully
- ✅ Basic functionality works
- ✅ No unexpected errors

### Week 2-3 (Testnet)
- ✅ VRF integration stable
- ✅ All edge cases handled
- ✅ Emergency functions work correctly

### Week 4+ (Testnet)
- ✅ Multiple users tested
- ✅ No security issues found
- ✅ Gas costs acceptable
- ✅ Community feedback positive

### Mainnet Launch
- ✅ Smooth deployment
- ✅ First 100 tickets without issues
- ✅ VRF fulfillment consistent
- ✅ No exploits or bugs
- ✅ Positive user experience

---

## 📞 Support Contacts

### Technical Issues
- **Chainlink VRF:** https://docs.chain.link/vrf
- **Base Network:** https://docs.base.org
- **Foundry:** https://book.getfoundry.sh

### Security
- **Report Issues:** Create GitHub issue or contact dev directly
- **Bug Bounty:** (Set up after mainnet launch)

---

## 📝 Final Checks Before Each Deployment

```bash
# Run before EVERY deployment
forge clean
forge build
forge test
forge test --gas-report

# Check for uncommitted changes
git status

# Verify addresses in deploy script
cat script/DeployPotshot.s.sol | grep "constant.*USDC\|VRF_COORDINATOR"

# Dry run (without --broadcast)
forge script script/DeployPotshot.s.sol:DeployPotshot --rpc-url $RPC_URL
```

---

## ✅ Sign-Off

### Testnet Deployment
- [ ] Dev reviewed this checklist
- [ ] All pre-deployment checks passed
- [ ] VRF subscription ready
- [ ] Monitoring plan in place

**Signed:** ________________  
**Date:** ________________

### Mainnet Deployment
- [ ] Testnet ran successfully for 4+ weeks
- [ ] External audit completed (if applicable)
- [ ] Bug bounty set up (if applicable)
- [ ] Multi-sig wallet configured (if applicable)
- [ ] All team members approved
- [ ] Emergency response plan ready

**Signed:** ________________  
**Date:** ________________

---

**Current Status:** ✅ Ready for Testnet Deployment  
**Next Step:** Deploy to Base Sepolia and begin testing  
**Timeline:** 4-6 weeks testnet → Mainnet decision

---

Good luck with your deployment! 🚀
