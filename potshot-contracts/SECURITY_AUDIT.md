# Potshot - Security Audit Report

**Contract:** Potshot.sol  
**Version:** 2.0 (Chainlink VRF V2.5)  
**Date:** December 13, 2025  
**Status:** ⚠️ USE AT YOUR OWN RISK

---

## Executive Summary

Potshot is a lottery-style smart contract using Chainlink VRF for provably fair randomness. The contract has undergone internal security review and implements several security features including:

✅ Pull-over-push pattern for winnings  
✅ Reentrancy guards  
✅ Timelocks on admin functions  
✅ Pause mechanism  
✅ Verifiable randomness (Chainlink VRF)

However, **inherent risks remain** that users and deployers must understand.

---

## Risk Assessment

### Overall Risk Level: **MEDIUM-HIGH** ⚠️

| Category | Risk | Notes |
|----------|------|-------|
| Smart Contract Risk | MEDIUM | Standard Solidity risks apply |
| Admin Controls | MEDIUM | Dev has privileged functions with timelocks |
| Economic Design | MEDIUM | Sybil attacks possible, no max bet |
| External Dependencies | MEDIUM | Relies on Chainlink VRF and USDC |
| User Experience | LOW-MEDIUM | VRF can timeout (1hr refund available) |

---

## Known Security Risks

### 🔴 Critical Risks

**1. Developer Privileges**
- **Risk:** Dev can pause contract and initiate emergency withdrawals
- **Mitigation:** 7-day timelock on emergency withdrawals, requires no unclaimed player winnings
- **Recommendation:** Use multi-sig wallet for dev address

**2. USDC Token Dependency**
- **Risk:** USDC can blacklist addresses, preventing claims
- **Mitigation:** None currently implemented
- **Impact:** Blacklisted users cannot claim winnings (lost funds)

**3. Chainlink VRF Dependency**
- **Risk:** If VRF fails, players may be stuck waiting
- **Mitigation:** 1-hour timeout allows manual refund via `cancelExpiredTicket()`
- **Impact:** Temporary lockup of funds, poor UX

### 🟠 High Risks

**4. Sybil Attack Economics**
- **Risk:** Users can create new wallets to always play at 1% win chance
- **Mitigation:** None (intentional design choice)
- **Impact:** Increases house edge against legitimate players

**5. Pause Mechanism Limitations**
- **Risk:** VRF callbacks and winnings claims still work during pause
- **Impact:** Contract isn't truly "frozen" during emergency
- **Note:** By design - prevents locking user funds

**6. MEV & Front-Running**
- **Risk:** Bots can monitor mempool and optimize entry timing
- **Mitigation:** VRF delay provides some protection
- **Impact:** Sophisticated players may have edge

### 🟡 Medium Risks

**7. No Maximum Bet**
- **Risk:** Whales can buy massive tickets and manipulate pot size
- **Mitigation:** None (intentional design)
- **Impact:** Can affect game economics

**8. Immutable Critical Addresses**
- **Risk:** USDC and VRF addresses cannot be changed
- **Impact:** If USDC upgrades incompatibly, contract must be redeployed
- **Note:** Standard practice for immutable contracts

**9. No Slippage Protection**
- **Risk:** If pot drains between purchase and VRF callback, payout is less
- **Mitigation:** Uses `potAtTime` (pot size at purchase)
- **Impact:** Players may win less if pot empties before their callback

---

## Security Features Implemented

### ✅ Attack Prevention

**Reentrancy Protection**
- Custom `nonReentrant` modifier on all external value transfers
- Follows checks-effects-interactions pattern

**Pull-Over-Push Pattern**
- Player winnings are credited, not auto-sent
- Prevents DoS via failed transfers
- Users must call `claimWinnings()` to withdraw

**VRF Integration**
- Uses Chainlink VRF V2.5 for cryptographically secure randomness
- Random numbers are verifiable on-chain
- No way for dev or players to manipulate outcomes

**Timelock Protection**
- Dev changes: 24-hour delay
- Emergency withdrawals: 7-day delay
- Provides transparency and exit window for users

### ✅ Safe Design Patterns

**Immutability**
- Core parameters (USDC, VRF config) are immutable
- Prevents backdoor changes after deployment

**Event Logging**
- All critical actions emit events
- On-chain audit trail for transparency

**Input Validation**
- Constructor checks for zero addresses
- Minimum bet enforcement
- VRF parameter bounds checking

---

## Admin Trust Assumptions

Users must trust that the developer will:

1. **Not abuse pause function** - Can pause anytime, but can't steal during pause
2. **Not initiate malicious emergency withdrawal** - 7-day warning period, requires no unclaimed winnings
3. **Properly maintain VRF subscription** - If subscription runs out, game stops
4. **Not change dev address maliciously** - 24-hour warning period

### Recommended Mitigation
- Deploy with **multi-sig wallet** (3-of-5 or similar)
- Use **Gnosis Safe** or equivalent
- Publicly disclose signer identities

---

## External Dependencies

### Chainlink VRF V2.5
- **Trust:** High (industry standard oracle)
- **Risk:** Service downtime, subscription issues
- **Mitigation:** 1-hour timeout → manual refund

### USDC Token
- **Trust:** High (Circle stablecoin)
- **Risk:** Blacklist enforcement, protocol changes
- **Mitigation:** None for blacklist, immutable address

### Ethereum/Base/[Chain]
- **Trust:** High (established L1/L2)
- **Risk:** Network congestion, reorgs
- **Mitigation:** VRF confirmations parameter

---

## Game Economics Security

### House Edge
- **Nominal:** -25% (players win 25% of pot)
- **Effective:** ~0% (50% goes to dev on each ticket)
- **Player ROI:** Negative in long run (50% fee effectively makes it -50% EV)

### Pot Drainage Risk
- Pot can theoretically drain to zero if many winners in a row
- Uses `potAtTime` to prevent race conditions
- Admin can seed pot via `seedPot()` or emergency functions

### Economic Attacks
- **Sybil:** Possible (new address = reset chance to 1%)
- **Whale:** Possible (no max bet limit)
- **MEV:** Possible (sandwich attacks on large pot changes)

**Note:** These are game theory issues, not smart contract bugs.

---

## Audit Scope & Testing

### Internal Review
✅ Manual code review completed  
✅ Common vulnerability patterns checked  
✅ Foundry test suite (>200 tests)  
✅ Fuzz testing implemented  
❌ External audit NOT performed  
❌ Formal verification NOT performed

### Test Coverage
- Basic functionality: ✅ Full coverage
- Edge cases: ✅ Covered
- Fuzz testing: ✅ Implemented
- VRF timeout: ✅ Tested
- Emergency functions: ✅ Tested
- Reentrancy: ✅ Tested

### Known Test Gaps
- Long-term economic modeling
- Large-scale stress testing
- Real VRF integration testing (uses mock in tests)

---

## Recommendations Before Use

### For Deployers
1. ✅ Deploy with multi-sig dev address
2. ✅ Adequately fund VRF subscription
3. ✅ Set reasonable `minBet` (e.g., $5-10 USD)
4. ✅ Seed initial pot (e.g., 10-100x minBet)
5. ✅ Monitor VRF subscription balance
6. ⚠️ Consider external audit ($20k-60k)
7. ⚠️ Set up bug bounty program
8. ⚠️ Get legal review (gambling regulations vary)

### For Users
1. ⚠️ Only gamble what you can afford to lose
2. ⚠️ Understand this is -EV game (50% dev fee)
3. ⚠️ Check dev address is multi-sig
4. ⚠️ Monitor for emergency withdrawal announcements (7-day warning)
5. ⚠️ Claim winnings regularly (don't leave funds in contract)
6. ⚠️ Verify randomness on Chainlink VRF explorer

---

## Emergency Procedures

### If You Win
1. Wait for VRF callback (usually 1-2 minutes)
2. Check `claimableWinnings(yourAddress)`
3. Call `claimWinnings()` when ready
4. If USDC blacklisted → funds may be stuck (no recovery)

### If VRF Times Out
1. Wait 1 hour from ticket purchase
2. Anyone can call `cancelExpiredTicket(yourAddress)`
3. Receive 50% refund (dev already received their 50%)

### If Contract Pauses
1. Don't panic - existing winnings are safe
2. Cannot buy new tickets during pause
3. Can still claim existing winnings
4. Monitor for dev announcements
5. If emergency withdrawal initiated → 7 days to claim winnings

---

## Security Contact

**Report vulnerabilities privately to:**
- Email: security@potshot.game
- GitHub: [Private Security Advisory]
- PGP Key: [if available]

**Bug Bounty:** [If active]
- Critical: Up to $10,000
- High: Up to $5,000
- Medium: Up to $1,000

---

## Legal Disclaimer

⚠️ **USE AT YOUR OWN RISK**

This smart contract is provided "AS IS" without warranty of any kind. The developers and deployers:

- Make no guarantees about contract security
- Are not liable for any loss of funds
- Do not guarantee contract availability
- May pause or stop the contract at any time (with timelocks)

**Gambling Regulations:** Check your local laws. Online gambling may be illegal in your jurisdiction.

**Tax Implications:** Winnings may be taxable. Consult a tax professional.

**No Investment Advice:** This is entertainment, not an investment.

---

## Version History

**v2.0** (Current)
- Upgraded to Chainlink VRF V2.5
- Implemented pull pattern for winnings
- Added timelocks on admin functions
- Uses `potAtTime` for win calculations
- Added VRF timeout mechanism

**v1.0** (Deprecated)
- Initial version
- Had push pattern vulnerabilities
- No timelocks

---

## Conclusion

Potshot implements reasonable security measures for a lottery contract but carries inherent risks:

✅ **Safe For:** Entertainment, small bets, informed users  
⚠️ **Risky For:** Large sums, risk-averse users, jurisdictions with strict gambling laws

**Final Recommendation:** 
- **Testnet first** - Run for 2+ weeks
- **Gradual rollout** - Start with low bet limits
- **Active monitoring** - Watch for anomalies
- **External audit** - Strongly recommended before significant TVL

---

**Last Updated:** December 13, 2025  
**Contract Version:** 2.0  
**Next Review:** [After mainnet deployment + 30 days]
