# Rebuild the narrated film from narration.md: voice -> scene time map -> score -> video -> mix -> captions.
# Run via ./rebuild.sh (from this folder). Writes ../glance-film-vo.mp4 and ../glance-film-vo.srt.
import json, os, re, subprocess, sys, time, urllib.request
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__)); CREATIVE = os.path.dirname(HERE)
os.chdir(HERE)
SCENES = [0, 4.5, 9.6, 13.6, 19.7, 25.7, 31.7, 36.7, 40.8, 48.0]  # scene boundaries in film.html (film time)
CUE = [0.35, 0.5, 0.2, 0.15, 0.6, 0.6, 0.7, 0.5, 0.7]               # voice starts this long into its scene
GAP, END_PAD, LEAD_IN, LEAD_OUT, BREATH = 0.15, 0.6, 1.2, 1.0, 0.22   # LEAD_*: scene entrance/exit kept at 1x
SR = 24000

# 1. parse narration.md
text = open('narration.md').read()
voice = re.search(r'^voice:\s*(\S+)', text, re.M).group(1)
speed = float(re.search(r'^speed:\s*([\d.]+)', text, re.M).group(1))
scenes = []
for block in re.split(r'^## ', text, flags=re.M)[1:]:
    lines = [l.strip() for l in block.split('\n')[1:] if l.strip() and not l.strip().startswith(('>', '#'))]
    cap = next((l[8:].strip() for l in lines if l.lower().startswith('caption:')), None)
    scenes.append({'phrases': [l for l in lines if not l.lower().startswith('caption:')], 'caption': cap})
assert len(scenes) == 9, f'narration.md needs exactly 9 "## " scenes, found {len(scenes)}'

# 2. voice, one clip per scene, phrase timings kept for captions
k = Kokoro(os.path.expanduser('~/.cache/kokoro/kokoro-v1.0.onnx'), os.path.expanduser('~/.cache/kokoro/voices-v1.0.bin'))
os.makedirs('lines', exist_ok=True)
for i, s in enumerate(scenes):
    parts, s['spans'], pos = [], [], 0.0
    for p in s['phrases']:
        a, _ = k.create(p, voice=voice, speed=speed, lang='en-us')
        nz = np.nonzero(np.abs(a) > 0.01)[0]
        a = a[max(0, nz[0] - 480):nz[-1] + 2400] if len(nz) else a   # trim model silence, keep 0.1 s tail
        s['spans'].append((pos, pos + len(a) / SR)); pos += len(a) / SR + BREATH
        parts += [a, np.zeros(int(SR * BREATH), np.float32)]
    clip = np.concatenate(parts[:-1]) if parts else np.zeros(1, np.float32)
    sf.write(f'lines/{i+1:02d}.wav', clip, SR)
    s['dur'] = len(clip) / SR if parts else 0.0

# 3. time map: a scene grows when its line would run into the next line (or the end)
knots, out = [[0.0, 0.0]], 0.0
for i, s in enumerate(scenes):
    a, b = SCENES[i], SCENES[i + 1]; L0 = b - a
    need = CUE[i] + s['dur'] + (END_PAD if i == 8 else GAP - CUE[i + 1])
    L = max(L0, need)
    if L > L0 + 1e-3:
        knots += [[out + LEAD_IN, a + LEAD_IN], [out + L - LEAD_OUT, b - LEAD_OUT]]
    out += L; knots.append([round(out, 4), b])
    s['start'] = knots[-1][0] - L + CUE[i]
    print(f'scene {i+1}: line {s["dur"]:4.1f}s  scene {L0:3.1f}s -> {L:4.1f}s' + ('  (stretched)' if L > L0 + 1e-3 else ''))
stretched = out > 48.0 + 1e-3
json.dump(knots, open('timemap.json', 'w'))
print(f'total {out:.1f}s')

# 4. score
subprocess.run([sys.executable, 'music.py'], check=True)

# 5. picture: reuse the 48 s render unless a scene stretched
video = os.path.join(CREATIVE, 'glance-film.mp4')
if stretched:
    video = os.path.join(HERE, 'film-stretched.mp4')
    if not os.path.isdir(os.path.join(CREATIVE, 'node_modules')):
        subprocess.run(['npm', 'i', '--silent'], cwd=CREATIVE, check=True)
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8765'], cwd=CREATIVE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(50):
            try: urllib.request.urlopen('http://localhost:8765/film.html'); break
            except Exception: time.sleep(0.2)
        subprocess.run(['node', 'render.cjs', 'video', video, '30'], cwd=CREATIVE, check=True,
                       env={**os.environ, 'TIMEMAP': os.path.join(HERE, 'timemap.json')})
    finally:
        srv.terminate()

# 6. mix: voice bus placed on cues, music ducked under it, -14 LUFS
ins, chain, labels = [], '', ''
for i, s in enumerate(scenes):
    if not s['dur']: continue
    n = len(ins) // 2 + 1
    ins += ['-i', f'lines/{i+1:02d}.wav']
    chain += f'[{n}:a]aresample=48000,adelay={int(s["start"]*1000)}:all=1[v{n}];'; labels += f'[v{n}]'
n = len(ins) // 2
fc = (f'{chain}{labels}amix=inputs={n}:normalize=0,apad=whole_dur={out},atrim=0:{out},'
      'highpass=f=85,equalizer=f=3200:t=q:w=1.2:g=2.5,equalizer=f=250:t=q:w=1:g=-2,'
      'acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=3,aformat=channel_layouts=stereo,asplit[vo][key];'
      '[0:a]volume=-7dB[mus];[mus][key]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=450[duck];'
      '[duck][vo]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9[a]')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'music.wav', *ins, '-filter_complex', fc, '-map', '[a]', '-ar', '48000', 'mixed.wav'], check=True)
final = os.path.join(CREATIVE, 'glance-film-vo.mp4')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', video, '-i', 'mixed.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', final], check=True)

# 7. captions: one per phrase (or the scene's caption: line), timed from the clips
ts = lambda x: f'{int(x//3600):02d}:{int(x%3600//60):02d}:{int(x%60):02d},{int(round(x*1000))%1000:03d}'
cues = []
for s in scenes:
    if not s['dur']: continue
    if s['caption']: cues.append((s['start'], s['start'] + s['dur'], s['caption']))
    else: cues += [(s['start'] + a, s['start'] + b, p) for (a, b), p in zip(s['spans'], s['phrases'])]
srt = '\n'.join(f'{n}\n{ts(a)} --> {ts(min(b + 0.2, out))}\n{t}\n' for n, (a, b, t) in enumerate(cues, 1))
open(os.path.join(CREATIVE, 'glance-film-vo.srt'), 'w').write(srt)
assert all(cues[j][1] <= cues[j + 1][0] for j in range(len(cues) - 1)), 'caption overlap'
print('wrote', final, f'({out:.1f}s)', 'and glance-film-vo.srt')
