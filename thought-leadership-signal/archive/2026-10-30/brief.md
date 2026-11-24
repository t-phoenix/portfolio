# Brief — 2026-10-30

**Pillar:** builder story (Web3 x AI, lived)
**Format:** `motion_3d_film` (new format; 4:5 3D product film, 1080×1350, 30 fps, 48 s; narrated cut with original score, plus a silent cut)
**Thesis:** Conferences don't have a meeting problem. They have a remembering problem. So I built Glance for Mumbai week.
**Receipt:** Lived builder story. Glance repo `~/Desktop/Glance` (PRD v1.0, decisions log Oct 22 to 24, scanner footage from the iPhone build, Oct 29). Event data from `Glance/week-mumbai-2026/` (IBW Nov 1 to 2, Devcon Nov 3 to 6, ETHGlobal Mumbai to Nov 7).

## The problem (from PRD + decisions log)

- 50 to 150 people in a week, in loud rooms.
- Mostly X and Telegram handles, not real names. A week later: who was `@degenwizard`?
- What did we discuss, what did I promise.
- Existing apps (Convu, ConnectMachine, RELOS) solve business cards and LinkedIn, not pseudonymous crypto identities or groups.

## What Glance does (only features in the repo)

| Beat | Feature | Source |
|---|---|---|
| Capture | One scanner for X, LinkedIn, Telegram, WhatsApp, vCard, ENS QRs, decoded on the phone. Badge photo read by Claude vision. | PRD C1, C2 |
| Remember | Hold to record a voice note (Hinglish ok, on device whisper). AI turns it into who, topics, promises. | PRD C4, A1, A2 |
| Context | Time, GPS and event attached automatically, matched against 80 Mumbai week listings. | PRD C5, week-mumbai-2026 |
| Identity | One person across X, LinkedIn, Telegram, ENS, Farcaster. Nothing links until you tap Confirm. | PRD I1 to I4, D10 |
| Rush | Rush mode: scanner stays open, one group note split across everyone in the huddle. | PRD C6, A3 |
| Follow through | Every promise becomes a follow up with a drafted message in the right app. | PRD F1, F2, A4 |
| Private | No backend. Data stays on the phone, Face ID lock. Paid lookups via x402, USDC on Base, about $0.08 a person. | D6, D8, P4 |

## Film concept: "Who was @degenwizard?"

Brand kit: Glance Tidepool. Ink `#0E1215`, Tide `#8EE3D4` (the one "act" colour), pastels Harbor `#9CC3FF`, Glacier `#A9DDF2`, Dusk `#B7C0FF`, Sea `#A6E9C1`, Butter `#F5D98B`. Display Bricolage Grotesque 700, mono JetBrains Mono. The ghost bubble mark with two eyes. Dark first, "the venue at night". No gradients on pastel fills.

Visual language: a dark venue made of light. 3D lanyard badges and handle chips drift in depth like a crowd; the Glance mark is the only thing that looks at you. Real app screens sit on a 3D iPhone that turns between beats. Type is the hero on every frame.

## Script (on screen text, silent autoplay first)

| # | Time | Picture | On screen |
|---|---|---|---|
| 1 | 0.0 to 4.5 | Hundreds of 3D badges and handle chips stream toward camera through ink fog. | **150 people.** / **7 days.** / IBW · Devcon · ETHGlobal |
| 2 | 4.5 to 9.5 | Camera stops. Chips blur, names scramble to `@d3g3nw1z4rd`. One chip holds center. | **A week later.** / **Who was @degenwizard?** / "What did we talk about. What did I promise." |
| 3 | 9.5 to 13.5 | Chips collapse into a point; the Glance mark grows in 3D, eyes look up at camera. | **glance.** / Glance today, know them tomorrow. |
| 4 | 13.5 to 20 | iPhone swings in, real scanner screen (QR in frame, "Reading the link…"). | 01 **Scan anything.** / X, LinkedIn, Telegram, WhatsApp, badges. |
| 5 | 20 to 26 | Phone turns; real Note screen, waveform pulses, then a tap into the AI Review screen. Chips: who · topics · you owe. | 02 **Talk, don't type.** / A voice note becomes who, what, and what you owe. |
| 6 | 26 to 32 | Person screen, then the Account screen; chips for X, LinkedIn, Telegram, ENS orbit and turn green one by one. | 03 **One person. Every handle.** / Nothing links until you confirm. |
| 7 | 32 to 37 | Follow ups screen. | 04 **Every promise, kept.** / Follow ups drafted in the right app. |
| 8 | 37 to 41 | Phone tilts back on the People screen inside two orbit rings; chips: On device, Face ID, USDC on Base. | 05 **Yours alone.** / On device. Face ID. Pay per lookup with x402. |
| 9 | 41 to 48 | Glimpse montage: three phones fan out (Today, Scan, Person), Mumbai skyline line. | Built for **India Blockchain Week**, Mumbai · Nov 1 to 7 / **What should it remember next?** |

## Copy angle

Hook pattern: second person recognition ("open your contacts") into story cold open. Comment magnet: a one word pick anyone can answer, no community needed (what do you forget first about someone new: name, face, the conversation, or the promise). Author seeds the first comment with their own number.

## Voiceover (narrated cut)

First person, conversational, under the on screen type (never reads the type word for word). Lines start on scene cues and must end before the next scene; `audio/mix.sh` asserts this.

Story script: `creative/audio/narration.md` (first person, one continuous story: the trip, the forgetting, building Glance, how it works, the ask). Narrated cut runs 56.6 s; scenes stretch to fit the lines.

Voice: Kokoro v1.0 (Apache 2.0, runs locally). Edit the lines in `creative/audio/narration.md` (voice and speed are set there too), then run `creative/audio/rebuild.sh`. A line too long for its scene stretches that scene: the middle slows, the entrance and the phone spin stay at normal speed, and the score and captions follow. `glance-film-vo-alt.mp4` (af_heart) is from the first script and does not rebuild.

Score: original, synthesized in `audio/music.py` (no samples, no licence). 80 bpm so each feature is two bars. Drone and a soft clock for the crowd, Bm when the memory fades, riser and boom on the logo, I V vi IV with plucks and a soft kick under the features, a whoosh on every phone spin, a bell on every tap, drums drop and resolve to D on the ending. Music ducks under the voice; master at −14 LUFS, −1.5 dBTP.

## Production

- Screens: Release build of the Glance repo in the iOS Simulator (iPhone 16 Pro), sample people from `creative/screens/seed.sql`. Scanner frames are real iPhone captures from Oct 29.
- Render: `cd creative && npm i && python3 -m http.server 8765` then `node render.cjs video glance-film.mp4 30` (stills: `node render.cjs stills 3,12,22 out/`).
- Audio and narrated cut: `creative/audio/rebuild.sh` (reads `narration.md`; Kokoro model files live in `~/.cache/kokoro/`). About 35 s, or about 2 min when a scene stretches and the picture re-renders.
