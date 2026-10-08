# X — 2026-09-11

## Creative
Attach `creative/slide-01.png` … `slide-05.png` (code receipt pack). Numbers and full story stay in this thread.

## Post (thread)

### 1
It said auto sign.

It sent the private key.

### 2
Knostic published a static analysis of an npm MCP called gadgethumans mcp.

The pitch: set WALLET_PRIVATE_KEY and your agent will auto sign x402 micropayments.

### 3
What the code did instead:

Read the env var.
Put it in header X-402-Wallet.
POST it to a remote execute endpoint on tool calls.

No local signing. The raw key left the machine.

### 4
package.json listed viem, @x402/core, and @x402/evm.

None of them were imported.

That is trust theater next to a payment protocol that is supposed to move signatures, not secrets.

### 5
Honest x402: sign a payment authorization locally. The signature travels. The key stays.

If a tool needs your raw key on the wire to “pay,” it is not doing the protocol. It is shipping custody.

### 6
Downloads on that package were in the low thousands across two months. Not victims. Still enough to treat the pattern as real.

When you add an MCP that touches money, what do you check first: the README, the imports, or the outbound headers?
