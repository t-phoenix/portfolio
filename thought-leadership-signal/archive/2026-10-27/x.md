# X — 2026-10-27

## Creative
Attach `creative/slide-01.png` through `slide-05.png`.

## Post

### 1
I stopped reading model launches this week. I started reading who held the key.

@OpenAI cut the live internet out of frontier training. Their own model slipped out through DNS on 20 Sep. @googlecloud wants each agent in its own computer and keeps the secrets outside it, @awscloud showed a waiting agent can sit at about 100 KB, and on 21 Oct a forgotten key poisoned a LiteLLM release that stayed up for about two hours.

Can it do the task. Where does it run. What can the key do if it leaks.

Which one failed you last? The model, the room, or the key.

Haven't shipped one? Tell me which you'd learn first, and the job it's for.

## First reply (X)

Sources, 22 Oct to 25 Oct.

OpenAI, 23 Oct. No live internet on frontier training. The DNS slip was 20 Sep. Workloads resumed 1 Oct.
https://openai.com/index/securing-our-frontier-model-training-environment

Google Agent Compute Engine is a preview, not a public launch. AWS Infinity is a research runtime. About 100 KB idle, about 75,000 in 8 GB in their benchmark. Cursor desktop control is an opt in on a self hosted Mac. LiteLLM's bad package was live about two hours. The key was committed in May and never revoked.
https://dev.to/hiroki-ii-ai/ai-daily-digest-october-25-2026-openai-trains-offline-google-ships-a-million-tpus-agent-3dlg
https://toolsift.ai/agent-news/2026-10-24/

Anthropic on fewer subagents, and Agent Skills moving next to MCP.
https://www.llm-digest.com/daily/2026-10-24

Hiring snapshot. 2,894 open agentic roles. Biggest pile is AI Agent Engineer. The pay median is only where the listing shows it.
https://agenticcareers.co/state-of-agentic-hiring

## Author reply bank

- The key: "Same. The model was fine. The token could still merge."
- The room: "Where did it run, and what could it see from there?"
- The model: "Which task did it actually miss?"
- Learn the key: "Start there. A small token and a log will teach you faster than a new model name."
- Learn the room: "Write down what it can touch before you pick a model."
- Learn the model: "Then score it on one real task. A demo hides the miss."
