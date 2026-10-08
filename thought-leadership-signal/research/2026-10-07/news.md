# Research — 2026-10-07 to 2026-10-08

Web3 only week. Scan run 2026-10-06 with native web search. No AgentCash spend.

Selection test: important at the protocol level, under covered outside core dev circles, attention rising this week.

## Receipts

### Ethereum Glamsterdam (10-07)
1. Sepolia activation scheduled 2026-10-06 13:53:36 UTC, epoch 353,024. Amsterdam (execution) plus Gloas (consensus). Hoodi tentative 2026-10-27. Mainnet has no confirmed date. https://www.cryptotimes.io/2026/09/29/ethereum-sets-glamsterdam-sepolia-activation-for-6-october/
2. EIP 7732 (ePBS): builder commits to a bid, then reveals the block, protocol handles payment. EIP 7928: block level access lists. Devnet ran 200M gas (up from 60M) with about 84,000 validators. 200M is a test parameter, not a mainnet decision. https://thecurrencyanalytics.com/altcoins/ethereum-eyes-200-million-gas-limit-as-glamsterdam-testing-kicks-off-october-6-299306
3. Builder abuse warning, core dev call 2026-09-17 (Potuz): bid high with free test ETH, withhold payload, stall blocks. Some clients have circuit breakers that fall back to local building. No unified protection across clients. https://www.kucoin.com/news/flash/ethereum-warns-of-builder-abuse-risks-in-glamsterdam-testnet
4. Over 90% of Ethereum blocks go through MEV Boost relays. Top four builders over 90% of blocks. https://coinpedia.org/research-report/ethereum-glamsterdam-vs-solana-alpenglow-october-2026-protocol-comparison
5. ePBS design notes: proposer is paid whether or not the builder delivers once the bid is seen in time. https://ethresear.ch/t/epbs-distilled/25800

### Solana Alpenglow (10-08)
1. Votor replaces TowerBFT. Finality about 12.8 s today, target 100 to 150 ms. Confirmed and finalized collapse into one state. Live on testnet week of 2026-09-22. Firedancer and Frankendancer cannot run it yet. https://solanacompass.com/news/alpenglow-activates-on-solana-testnet-as-frankendancer-era-ends-agave-v44-schedule-targets-november-9-mainnet-activation
2. Vote transactions average 71.5% of all Solana transactions, up to about 75%. Alpenglow moves votes off ledger. Old model needs two thirds of stake honest and online. New model tolerates 20% adversarial plus 20% offline. SIMD 0326 passed with 98.27% approval. https://coinpedia.org/research-report/ethereum-glamsterdam-vs-solana-alpenglow-october-2026-protocol-comparison
3. Mainnet rides Agave 4.3, targeted October 2026, no confirmed date. A tentative September 28 start passed without activation. https://cryptoticker.io/en/solana-alpenglow-mainnet-date-missed/

## Also scanned, not used
- Zcash NU7 testnet 2026-10-06, mainnet 2026-11-05. Block time 75 s to 25 s. Shielded assets deferred. Parked for a privacy week.
- Chainlink CCIP 2.0 (2026-09-28), BNB Jenner fork, UK FCA licensing regime. Lower surprise.
- Circle Arc post quantum signatures. Skipped, Arc was the 09-13 pack.

## Arc (two mechanisms, not one thesis twice)
- 10-07: enforcement. A rule only replaces a referee when breaking it costs something.
- 10-08: time. Every wait before finality is a loan someone prices.

## Verify before posting
- Confirm Sepolia activation actually happened on 10-06 and whether the builder withholding issue showed up.
- Recheck Alpenglow mainnet date on the morning of 10-08.
