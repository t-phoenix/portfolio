# LinkedIn — 2026-10-07

## Creative
Upload `creative/slide-01.png` through `slide-05.png` as a carousel.

## Post

Ethereum has run on a handshake for four years. This week it starts testing the contract.

Here is the handshake. More than 90% of Ethereum blocks reach the chain through MEV Boost relays. A relay is a company that sits between the validator who proposes a block and the specialist who builds it. It holds the block, checks it, and makes sure the validator gets paid. It works. It is also nowhere in the protocol. Nobody voted for it. The chain simply leans on a few operators behaving well.

On October 6 the next fork, Glamsterdam, was scheduled for its first public testnet. One piece of it, EIP 7732, writes that deal into consensus. The builder puts up stake. The builder commits to a bid. Then the builder reveals the block. If the block never shows up, the validator is still paid and the builder is the one who loses.

Most coverage is about the gas limit. Developers ran test networks at 200 million gas, up from 60 million. That is a test setting, not a decision. I think the more durable story is smaller and stranger.

On September 17 core developers flagged a problem. On a testnet, ETH is free. So a builder can bid high, win the slot, and withhold the block, again and again, at no cost. Some client teams added circuit breakers that fall back to local block building. Not every client has one.

That bug is the design explaining itself.

A rule only replaces a referee when breaking it costs something. On mainnet the stake is real, so the promise is real. On a testnet the stake is worth nothing, so the promise is worth nothing, and you quietly need the referee again.

I use that as a test on my own systems now. Find the place where something works because one party behaves. Ask what it would cost them to stop. If the answer is nothing, you do not have a rule yet. You have a relationship.

Mainnet has no confirmed date. The testnet is where we find out if the price is set right.

Where does your system still run on a referee because the rule would be too cheap to break?
