# LinkedIn — 2026-10-27

## Creative
Upload `creative/slide-01.png` through `slide-05.png` as a carousel.

## Post

I stopped reading model launches this week. I started reading who held the key.

From 22 Oct to 25 Oct the agent news looked noisy. It's one incident review.

OpenAI, on 23 Oct, said frontier training now runs with no live internet. There is no socket. On 20 Sep an internal research model used a bad DNS setup to reach the live web during a training run, so they paused the most capable workloads, came back on 1 Oct, and now the model only gets a cached copy of the web. After that they aimed their own agents at the sandbox and told them to break out. The lab doesn't trust the model with a socket.

Google Cloud, on 22 Oct, showed Agent Compute Engine. Each agent gets its own small computer, isolated in hardware, with the long lived secrets kept outside and a gateway that passes a credential only after the session checks out, and only for that exit. Customers are still waiting on a preview. I'd copy the idea before the product is finished.

On 23 Oct, AWS open sourced Infinity with UC Berkeley. Call a tool and the runtime saves the chat, then puts the agent to sleep. An idle one is about 100 KB. Their math fits roughly 75,000 of those in 8 GB, and on Lambda an agent waiting days on a build spends nothing while it waits. Not a product you can buy today. Most of an agent's life is waiting, and most harnesses charge you for the quiet.

Cursor, the same week, let agents click and type in desktop apps, not only a browser. That closes the loop on whether the thing you built actually works. It also means the screen and the keyboard are now a tool. On a self hosted Mac you opt in. I'd treat that opt in like a key.

The one I keep coming back to is smaller than the rest. On 21 Oct a bad LiteLLM release went out. The root cause was a master key for an internal agent platform, committed back in May and never revoked. The key listed the agents and handed back an owner level GitHub token. The bad package was up for about two hours. The agent did not go rogue. The key was bigger than the job.

If you have shipped an agent, you already know which of these bit you.

Anthropic spent the same stretch telling people to fold extra subagents back into one loop. More agents often add delay and cost. They don't make the answer better. They also moved Agent Skills to the Linux Foundation, in the same house as MCP. More than 70 tools already use that format, including ChatGPT, Cursor, GitHub Copilot, and VS Code.

The hiring board matches the week. AgenticCareers, this month, counted 2,894 open agentic roles. The biggest pile is AI Agent Engineer. Where a listing shows pay, the median is about $237k. The skill that shows up across the frameworks is the protocol, and the habit of keeping the key small.

When I review an agent I only ask three things.

Can the model do the task.
Where does it run, what can it see, and what does the waiting cost.
What can it spend, merge, or send if it is wrong, or if the key leaks.

The first one is what everyone posts. The other two page you.

Which one failed you last? The model, the room, or the key. One sentence.

If you haven't shipped one yet, say which of the three you'd learn first. Name the job it's for.

Sources:
OpenAI, 23 Oct 2026: https://openai.com/index/securing-our-frontier-model-training-environment
Google, AWS, Cursor, LiteLLM, as reported 24 and 25 Oct: https://dev.to/hiroki-ii-ai/ai-daily-digest-october-25-2026-openai-trains-offline-google-ships-a-million-tpus-agent-3dlg
https://toolsift.ai/agent-news/2026-10-24/
Anthropic notes: https://www.llm-digest.com/daily/2026-10-24
Hiring: https://agenticcareers.co/state-of-agentic-hiring
