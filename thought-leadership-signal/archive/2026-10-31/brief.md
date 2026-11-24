# Brief — 2026-10-31

## Pillar
Web3 only. Exchange signing desks and what an Ethereum code permission actually does. No AI bolt-on.

## Receipts
1. TRM Labs, 30 Oct 2026. Transfer-time total about $6.36B, ten chains. XRP first at 20:05 UTC. https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history
2. Blockaid, 29 Oct 2026. Nonce window, $0 delegation, 3m24s to the sweep, Circle smart account. https://blockaid.io/blog/binance-55b-hack-using-advanced-ai-models-blockaid-detects-the-biggest-theft-in-crypto-history
3. Elliptic, 30 Oct 2026. $6.43B, rehearsal, Tornado funding. https://www.elliptic.co/insights/binance-largest-hack-in-history/
4. Maborak revocation and root-cause notes, 30 Oct 2026. Clear is not a key rotation. Teng's names for the feature do not match the spec. https://www.maborak.com/blog/binance-14-eip-7702-revocation and https://www.maborak.com/blog/binance-incident-root-cause-evidence
5. BleepingComputer, 30 Oct 2026. Binance: laptop and service container, no private key leak found, not one click. https://www.bleepingcomputer.com/news/security/binance-links-63-billion-crypto-theft-to-compromised-devops-laptop/
6. Desk check, 31 Oct 2026, Ethereum RPC. Binance 14 code was a delegation pointer at block 26,301,895 and empty at 26,301,896. Revocation tx `0xafbf94c92a8d749988411669fa14d4f8866d9b4420b4ebd299f28e958dac7209`. Sweeper still 1,674 bytes.

## Numbers (caption only)
- TRM: about $6.36B at the moment of each transfer. Binance estimate: about $6.3B. Elliptic: $6.43B. These are different measurements.
- Frozen: TRM about $2.7B as of 00:30 UTC 30 Oct. Frozen is not returned.
- First Ethereum sweep: about 167,464 ETH and 63 tokens, including about 1.615B USDT, 1 ETH left behind.
- Nonce window: 18,914,775 through 18,914,824. One hit.
- Clear: 00:10:35 UTC 30 Oct, 36,800 gas.
- USDT sold for ETH at a discount of more than 10%.

## Angle
Everyone is arguing about an Ethereum feature. The clock says the signing desk was already open. The feature is why one wallet stayed open.

## Emotional bridge
Anyone who has watched a hot wallet knows the page that gets read after a bad night: the huge transfer. This one hid in a signature that moved nothing, while the wallet kept paying customers.

## Hook
They did not steal the Binance key. They got the signing desk to give one hot wallet a new job.

## Insight
Three different acts get called "the hack." Asking the desk to sign. Changing what the wallet does. Sending the money. Monitors that only know the third one are late by three and a half minutes, and blind on every chain that has no code permission at all.

## Comment magnet
What would your monitor catch first: a huge send, or a wallet that suddenly has code? One line on which you actually alert.

Second door, if they have no hot wallet: if you could only watch one thing on a treasury address, the balance or the code?

## Tags
- X: @binance
- LinkedIn: Binance

## Links
- LinkedIn body, after the insight: TRM, Blockaid, Elliptic, both Maborak notes, BleepingComputer
- X first reply: same links, plus the revocation transaction hash

## Author ops
- Seed reply: the source list in `x.md`
- First hour: answer every comment with the bank in `x.md`
- If they say "the huge send": the setup moved $0, and the code was already public
- If they say "the code": ask whether a clear is paired with retiring the address
- If they say "the key was stolen": Binance says it has not found a leak, and a 50-page window is what a request looks like
- If they blame the Ethereum feature alone: XRP left about fifteen minutes earlier

## Creative format
carousel_3d_still. Five frames. Yesterday was a 3D film, so this pack is stills. The angle needs the beats. Each frame is its own hero. True Three.js geometry, studio type on top. No paid image model.

## Real assets
- Chain reads above. No photos, no logos, no screenshots of other people's posts.
- Geometry is built in `creative/carousel.html`, not generated art.
