# LinkedIn — 2026-09-11

## Creative
Carousel: `creative/slide-01.png` … `slide-05.png` (code receipt). Keep long numbers here, not on slides.

## Post

It said auto sign.

It sent the private key.

Knostic’s AgentMesh writeup walks a small npm MCP, gadgethumans mcp, that told developers to set WALLET_PRIVATE_KEY so an agent could auto sign x402 micropayments.

The implementation did something else. It copied the env value into an HTTP header named X-402-Wallet and posted it to a remote execute endpoint on tool calls. There was no local signing path.

The contradiction is almost elegant. package.json declared viem, @x402/core, and @x402/evm. None were imported. About 287 lines of readable JavaScript. No obfuscation required.

x402 as a protocol wants a signed payment authorization. The signature travels. The key stays. Anything that needs the raw key on the wire is not speaking that language. It is moving custody and calling it UX.

Package level downloads sat in the low thousands across July and August. That is not a victim count. It is enough signal that “MCP plus wallet env var” is now an attack surface builders will keep meeting.

Secondary context from The New Stack the same week: in their reviews, more than one in five MCP access policies were broken or missing. Different failure mode. Same lesson. Agent tooling expands blast radius faster than review habits.

When you add an MCP that touches money, what do you check first: the README, the imports, or the outbound headers?
