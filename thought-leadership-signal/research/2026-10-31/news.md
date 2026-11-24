# News — 2026-10-31

## Queries run
- Binance hack October 2026 EIP-7702 TraderTraitor
- Binance hot wallet exploit October 29 2026 EIP-7702 delegation
- Binance Teng self-destruct laptop signing container EIP-7702 October 30 2026

## Headlines
1. **North Korea Steals USD 6.36 Billion From Binance** — TRM Labs — https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history — 30 Oct 2026
   Numbers: about $6.36B across 10 chains at transfer-time prices. ETH about $3.79B. BTC 18,270 (about $1.47B). Tron about $628M. XRP 233.46M (about $296M). SOL 970,500 (about $96M). Frozen about $2.7B as of 00:30 UTC 30 Oct. Attacker still held about $2.4B in ETH plus BTC that issuers cannot freeze.
   Note: XRP outflows start 20:05–20:09 UTC, before the Ethereum delegation at 20:20. Fifty authorizations, one nonce match. Sweeps continue 20:41, 20:59, 21:04, 21:44, 22:39, 23:56. USDT sold for ETH at an implied price more than 10% rich to spot.
2. **Binance $6.3B Hack** — Blockaid — https://blockaid.io/blog/binance-55b-hack-using-advanced-ai-models-blockaid-detects-the-biggest-theft-in-crypto-history — 29 Oct 2026
   Numbers: Binance estimate about $6.3B. First sweep about $2.5B at 20:24:23 UTC, 3m24s after delegation. Nonce window 18,914,775 through 18,914,824. Binance 14 left with 1 ETH. Delegation tx moved no inventory. Wallet kept sending its own withdrawals. Circle smart account pull about 823M USDC at 20:41.
   Note: 49 authorizations invalid. Policy before the signature is the stop. Rotating keys does not clear a delegation, because the code sits on the address.
3. **Largest theft in history** — Elliptic — https://www.elliptic.co/insights/binance-largest-hack-in-history/ — 30 Oct 2026
   Numbers: $6.43B across 11 chains. $2.84B frozen (44%), almost all USDT and USDC. Sweeper deployed 15:59 UTC. Rehearsed about four hours earlier. Tornado Cash: three 0.1 ETH withdrawals 28–29 Oct.
   Note: Binance 16 also sent about $174M by ordinary signature. Commingled with suspected Bitget proceeds. No government confirmation of attribution in this piece.
4. **Binance 14 revocation, checked on chain** — Maborak — https://www.maborak.com/blog/binance-14-eip-7702-revocation — 30 Oct 2026
   Numbers: clear at block 26,301,896, 00:10:35 UTC, gas 36,800. Auth nonce 18,914,904. Delegate zero address.
   Note: clear proves a valid signature existed at that minute. It does not prove the key is safe, who signed, or that the address is retired.
5. **RCA: delegation proved, access unexplained** — Maborak — https://www.maborak.com/blog/binance-incident-root-cause-evidence — 30 Oct 2026
   Note: Teng transcript calls EIP-7702 a multisignature protocol. The spec is code delegation. Self-destruct line is about tooling and traces, not the sweeper contract. Laptop story was revised the same day to "additional points of breach."
6. **Compromised DevOps laptop** — BleepingComputer — https://www.bleepingcomputer.com/news/security/binance-links-63-billion-crypto-theft-to-compromised-devops-laptop/ — 30 Oct 2026
   Note: Binance: service container, unauthorized withdrawal requests, no evidence of a wallet private key leak. Teng: not one engineer's permissions, not one click.
7. **Multiple breach points** — CoinDesk — https://www.coindesk.com/tech/2026/10/30/binance-uncovers-wider-breach-in-usd6-3-billion-exploit-targets-sunday-withdrawal-restart — 30 Oct 2026
   Note: initial laptop account was incomplete. Sunday withdrawal target. Treat Teng's "multisig" wording via the Maborak transcript, not this headline.

## Chain check (this desk, 31 Oct 2026)
Public Ethereum RPC `https://eth.drpc.org`.
- Revocation tx `0xafbf94c92a8d749988411669fa14d4f8866d9b4420b4ebd299f28e958dac7209`
- Type 4, status success, gas 36,800, from and to `0x28c6c06298d514db089934071355e5743bf21d60`
- Block 26,301,896, timestamp 2026-10-30T00:10:35Z
- Auth nonce 18,914,904, delegate `0x0000000000000000000000000000000000000000`
- `eth_getCode` at block 26,301,895: `0xef0100` + `63e842b054bd624a465454d533c33f573e9c6fae`
- Same address at 26,301,896 and at latest: `0x`
- Sweeper `0x63e842b054bd624a465454d533c33f573e9c6fae` still has 1,674 bytes of code

## What the usual posts skip
- Chronology: XRP first, so the Ethereum feature did not open the night.
- A 50-nonce window is the fingerprint of "request a signature," not "hold the key." Binance says it has not found a leaked key. Those two facts belong in one sentence.
- The setup transaction moved no funds. The code was public for 3 minutes 24 seconds before the sweep.
- Clearing the delegation does not rotate the key. The sweeper contract was not destroyed.
- Teng's public names for the tool (multisig, self-destruct) do not match the spec or the remaining bytecode.
- Dollar headlines mix three measurements: transfer-time sum, company estimate, frozen balance.

## Discarded
- BingX flash headline that fuses EIP-7702 and SELFDESTRUCT into one mechanism. Maborak separates them, and the sweeper bytecode is still present.
- Any single loss figure presented as the only total.
- Contract source from the uploaded one-pager. It is labeled conceptual. The public reports describe behavior, not a verified source listing. Do not publish it.
