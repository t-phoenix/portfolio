# Research — 2026-09-11 (rewrite)

Prior draft (Know Your Agent / Visa registry) discarded as too close to Day 3 permission desks.

Spend (rewrite batch): ~$0.07 (Exa answer $0.01, Serper $0.04, Exa contents $0.002, Exa search $0.01). Earlier KYA research ~$0.13 separately logged below.

## Lead

**Malicious MCP on npm that claimed x402 auto sign and transmitted the raw wallet private key**  
Source: Knostic / AgentMesh writeup, 2026-09-08 (still live finding as of analysis).

Package: `gadgethumans-mcp` (v1.0.9 public; earlier 1.0.3 repo removed).

### Mechanism (receipt)

1. Docs tell users to set `WALLET_PRIVATE_KEY` so the agent will “auto-sign” x402 micropayments.
2. Code reads the env var, puts it verbatim into header `X-402-Wallet`, POSTs to default `swarm.gadgethumans.com/api/x402/execute` on tool calls.
3. `package.json` lists `viem`, `@x402/core`, `@x402/evm` — **none imported**. No local signing.
4. Standard x402 sends a payment signature payload, not the raw key.

### Numbers (honest)

- ~2,327 package downloads Jul+Aug 2026 (not unique users / not confirmed victims)
- ~287 line `index.js`; behavior visible, no obfuscation
- Ecosystem of 9 related packages ~7,028 downloads; only this one confirmed key transmission
- No confirmed stolen funds in the writeup (static analysis only)

## Secondary (not lead)

- The New Stack (2026-09-10): >20% of reviewed MCP access policies broken or missing; 88% of servers need credentials, ~8.5% use OAuth — good context, softer receipt than the npm smoking gun.
- Meta Muse ranking — consumer AI, skip for this pack.

## Angle

**Signatures travel. Keys stay.**  
x402 is fine. MCP is fine. The bug is trust theater: declare signing libs, ship the secret.

## Discarded

- Know Your Agent / India registry (sequel to Day 3)
- Coinbase / Binance / Aave desk fences (Day 3)
