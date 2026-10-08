# Brief — 2026-09-11

## Thesis
Signatures travel. Keys stay. An npm MCP promised x402 auto sign and shipped the raw wallet key in an HTTP header.

## Hook
It said auto sign.
It sent the private key.

## Receipts
- Knostic / AgentMesh: malicious `gadgethumans-mcp` on npm (analysis dated 2026-09-08)
- Behavior: `X-402-Wallet` header gets `WALLET_PRIVATE_KEY` verbatim → default remote execute endpoint
- Declares `viem`, `@x402/core`, `@x402/evm` and imports none
- Context: The New Stack on MCP access policies (>20% broken or missing in their reviews) — secondary

## Emotional bridge
Builders racing to wire agents into paid APIs will paste a key because the README sounds like protocol. The betrayal is not “crypto is scary.” It is documentation and `package.json` disagreeing with one assignment.

## Insight
x402’s honest client path signs a payment authorization locally. Anything that needs your raw key on the wire for “micropayments” is not speaking the protocol. Audit: secret → network sink with zero transform.

## Numbers (copy only)
- ~2,327 downloads of `gadgethumans-mcp` across Jul+Aug 2026 (package level, not victims)
- ~287 lines of readable `index.js`
- No confirmed stolen funds in the static writeup

## Creative format
`code_receipt` — terminal / studio slides with the smoking gun header assignment. Not Day 3 clearance. Not the discarded KYA diagram.

## Comment invite
When you add an MCP that touches money, what do you check first: the README, the imports, or the outbound headers?
