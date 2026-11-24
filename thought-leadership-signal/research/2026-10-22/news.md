# Research — 2026-10-22

Follow up to the 2026-10-17 Wrong Floor post. New mechanism, not a repeat of "Base beat mainnet."

## What the last post already said
Window 15 Jul to 12 Oct 2026, Token Terminal via Ethereum Institutional:
- Base $8.5T stablecoin transfer volume
- Ethereum mainnet $7.1T
- Optimism $0.8T, other ETH L2s $0.35T
- Family $16.75T of $21.55T (~77%)
- EI: mostly institutional transfers and DeFi (flash loans, liquidity), not coffee
- No new protocol or issuer launch inside the window

Sources:
- https://cryptobriefing.com/ethereum-l2s-settle-77-stablecoin-volume/
- https://ethereuminstitutional.org/research/ethereum-institutional-briefing-issue-01
- https://x.com/touchey_phoenix/status/2111426045908021658

## New receipt (different denominator: USDC, not all stablecoins)
Talos / Coin Metrics, State of the Network, Tanay Ved, 11 Aug 2026.
https://www.talos.com/insights/beneath-the-trillions-whats-driving-usdc-and-usdt-transfer-volume

USDC on Base, 2026, raw transfer volume tagged by Talos CM ATLAS (lower bound):
- Base was 67% of all USDC transfer volume
- More than 90% of Base USDC volume traced to three contracts
- DEX liquidity (Aerodrome): 69%
- Flash loans (Morpho singleton): 23%
- Residual: about 8%
- One June day of flash loans exceeded $500B

USDC on Ethereum, same study:
- Flash loans 65%
- DEX liquidity 0.3%
- CEX flows 2%
- Residual about 33%

Also: USDC annualized velocity 741x vs USDT 74x. Tags are lower bounds. Residual includes payments, bridges, treasury, and anything not isolated. Do not apply the 8% to the $8.5T all stablecoin figure. Different cut, different window.

## Subtle inference
Usual read: Base won dollars from mainnet.
Unusual read: Base won laps. Cheap fees make the same USDC reprint itself through two Aerodrome pools and Morpho. Mainnet USDC still has a much larger unexplained slice (about 33% vs about 8%). The leftover, not the headline, is where a payment might live.

## Who / when / why
- Who: Aerodrome liquidity bots and Morpho flash loan bots, on Coinbase's L2. Not a crowd of payers.
- When: composition is 2026 YTD as of 11 Aug 2026. The $8.5T vs $7.1T race is 15 Jul to 12 Oct 2026, and EI says it was a drift, not a launch.
- Why: Base fees make constant rebalancing cheap. Mainnet fees tax that loop, so more of its USDC volume sits outside the tagged machines.

## AgentCash
Exa search $0.01 on Base. Confirmed the 69 / 23 / 8 split is USDC on Base only, and that labels are a lower bound on unadjusted volume.
Tx: 0x0ac51be1564d1728b1797b1a5c2e21ce5beaaed659470bee2af1d1969eae5207

## Monid
No Monid API key in the environment. Did not run chain SQL. Monid's own docs warn that dollar totals can cover only enriched rows and that filtered SQL can return a false zero. Primary composition stays with Talos.

## Tags
X: @base @ethereum @tokenterminal
Reply: @ethereuminsti
LinkedIn names: Base, Ethereum, Coinbase
Protocols named in copy, not extra tags: Aerodrome, Morpho
