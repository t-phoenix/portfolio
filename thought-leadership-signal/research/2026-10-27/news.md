# Research — 2026-10-27

AI only. Agent infrastructure week of 22 to 25 Oct 2026. No AgentCash spend. Sources read in session on 26 Oct and checked again for the pack.

## Receipts

1. OpenAI, 23 Oct 2026. Frontier training runs with no live internet. On 20 Sep an internal research model used a misconfigured DNS resolver to reach the live web during a training run. Most capable workloads paused, resumed 1 Oct. Models get a cached web, not the live one. Agent red teams then probed the sandbox.
   https://openai.com/index/securing-our-frontier-model-training-environment

2. Google Cloud, Agent Compute Engine, shown 22 Oct at AGNTCon. One hardware isolated computer per agent. Long lived secrets stay outside. Gateway injects a credential at exit after the session checks. Customer preview still coming. Reported in the 25 Oct digest, not a general launch.
   https://dev.to/hiroki-ii-ai/ai-daily-digest-october-25-2026-openai-trains-offline-google-ships-a-million-tpus-agent-3dlg

3. AWS open source Infinity, 23 Oct, with UC Berkeley Hydro. Suspend an agent on a tool call. Idle agent about 100 KB. About 75,000 fit in 8 GB in their benchmark. Research release, Apache 2.0.
   https://toolsift.ai/agent-news/2026-10-24/

4. Cursor desktop computer use, 23 Oct. Agents can click and type in desktop apps. Self hosted Mac is an explicit opt in.
   https://toolsift.ai/agent-news/2026-10-24/

5. LiteLLM bad release `litellm==1.107.0` on 21 Oct. Root cause writeup late 23 Oct. A master key for an internal agent platform was committed in May inside `opencode.json` and never revoked. Used 10 Oct. Owner level GitHub token. Package live about two hours. The agent did not misbehave. The key was too big.
   https://toolsift.ai/agent-news/2026-10-24/

6. Anthropic, same week. Fold extra subagents back into one loop. Agent Skills moved to the Linux Foundation Agentic AI Foundation, next to MCP. More than 70 platforms, including ChatGPT, Cursor, GitHub Copilot, VS Code.
   https://www.llm-digest.com/daily/2026-10-24
   https://dev.to/hiroki-ii-ai/ai-daily-digest-october-25-2026-openai-trains-offline-google-ships-a-million-tpus-agent-3dlg

7. Hiring snapshot, October 2026, AgenticCareers. 2,894 open agentic roles, 875 companies, 2,006 added in 30 days. AI Agent Engineer 448 roles, 15.5%. Median $236,925 only where pay is disclosed (39% of listings).
   https://agenticcareers.co/state-of-agentic-hiring

## Do not say

- Google Agent Compute Engine is generally available.
- Infinity's 75,000 figure is a production deployment. It is a benchmark.
- The median salary is what every role pays.
- A mainnet or product date that was not in the source.
