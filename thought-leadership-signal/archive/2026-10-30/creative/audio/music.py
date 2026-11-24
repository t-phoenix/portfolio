# Original 48s score for the Glance film. 80 bpm so each 6s feature = 2 bars. Writes music.wav (48k stereo).
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve
import json, os
SR = 48000
# timemap.json (written by build.py): [[outT, srcT], ...]; W maps a film-time cue to output time.
KN = json.load(open('timemap.json')) if os.path.exists('timemap.json') else [[0, 0], [48, 48]]
W = lambda t: float(np.interp(t, [k[1] for k in KN], [k[0] for k in KN]))
DUR = W(48.0)
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

def hz(m): return 440 * 2 ** ((m - 69) / 12)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def env(n, a, r, sus=True):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na) if na else 1
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def add(x, at, gain=1.0, pan=0.0, raw=False):
    i = int((at if raw else W(at)) * SR); x = x[:max(0, N - i)]
    L[i:i + len(x)] += x * gain * np.sqrt((1 - pan) / 2) * 1.414
    R[i:i + len(x)] += x * gain * np.sqrt((1 + pan) / 2) * 1.414

def pad(notes, at, dur, gain, a=1.2, r=1.5, cut=1800, raw=False):
    n = int((dur if raw else W(at + dur) - W(at)) * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for m in notes:
        for d in (-0.09, 0.0, 0.11):  # detuned saw stack, additive
            f = hz(m) * 2 ** (d / 12)
            for k in range(1, 14):
                if f * k > 9000: break
                out += np.sin(2 * np.pi * f * k * t + rng.uniform(0, 6.28)) / k
    out = lp(out, cut) * env(n, a, r) / (len(notes) * 6)
    add(out, at, gain, -0.25, raw); add(np.roll(out, 211), at, gain, 0.25, raw)

def pluck(m, at, gain, pan=0.0, dec=1.1, raw=False):
    n = int(2.2 * SR); t = np.arange(n) / SR; f = hz(m)
    x = (np.sin(2*np.pi*f*t) + 0.35*np.sin(4*np.pi*f*t) + 0.12*np.sin(6*np.pi*f*t)) * np.exp(-t / dec * 3)
    x *= env(n, 0.004, 0.05)
    add(lp(x, 5000), at, gain, pan, raw)

def bell(m, at, gain, pan=0.0):
    n = int(4 * SR); t = np.arange(n) / SR; f = hz(m); x = np.zeros(n)
    for ratio, amp, d in ((1, 1, 2.2), (2.76, .35, 1.0), (5.4, .15, .5), (2.0, .3, 1.6)):
        x += amp * np.sin(2*np.pi*f*ratio*t) * np.exp(-t / d)
    add(x * env(n, 0.002, 0.2), at, gain, pan)

def kick(at, gain, raw=False):
    n = int(0.6 * SR); t = np.arange(n) / SR
    ph = 2*np.pi*np.cumsum(45 + 90*np.exp(-t*30)) / SR
    add(np.sin(ph) * np.exp(-t*7) * env(n, 0.001, 0.05), at, gain, raw=raw)

def shaker(at, gain, pan, raw=False):
    n = int(0.09 * SR); x = hp(rng.standard_normal(n), 6000) * np.exp(-np.arange(n)/SR*55)
    add(x, at, gain, pan, raw)

def sweep(at, dur, gain, up=True):  # noise riser / whoosh
    n = int(dur * SR); x = rng.standard_normal(n); s = np.linspace(0, 1, n)
    out = np.zeros(n); seg = 2048
    for i in range(0, n, seg):
        p = s[i] if up else 1 - s[i]
        out[i:i+seg] = lp(x[i:i+seg], 300 + 7000 * p**2, 1)
    e = s**2 if up else np.sin(np.pi * s) ** 1.5
    add(out * e, at, gain, 0.0)

def boom(at, gain):
    n = int(3 * SR); t = np.arange(n) / SR
    x = np.sin(2*np.pi*np.cumsum(38 + 60*np.exp(-t*8))/SR) * np.exp(-t*1.6)
    add(x + 0.15*lp(rng.standard_normal(n), 900)*np.exp(-t*4), at, gain)

D, A, B, G, Fs = 50, 57, 59, 55, 54  # D3 A3 B3 G3 F#3
# A: 0 to 9.6, the crowd. Low drone, room noise, a soft clock.
sub = np.sin(2*np.pi*hz(38)*t_all) * np.clip((W(9.7) - t_all) / 0.4, 0, 1) * np.clip(t_all / 1.5, 0, 1)
L += sub * 0.10; R += sub * 0.10
room = lp(rng.standard_normal(int(W(9.8)*SR)), 700) * env(int(W(9.8)*SR), 1.5, 0.6) * 0.05
add(room, 0, 1, -0.3); add(np.roll(room, 999), 0, 1, 0.3)
pad([D, A, 64], 0.0, 4.9, 0.7, a=1.5, r=0.9, cut=1100)          # D sus, open
pad([47, 54, 62], 4.4, 5.3, 0.75, a=0.8, r=0.6, cut=900)          # Bm, the forgetting
for i, tt in enumerate(np.arange(0.6, 9.4, 0.75)):
    bell(81 if i % 2 == 0 else 76, tt, 0.035 * (1 - tt / 12), pan=(-0.5 if i % 2 else 0.5))
sweep(7.9, 1.75, 0.22)
# B: 9.65 logo hit and air.
boom(9.65, 0.55)
for j, m in enumerate((74, 78, 81, 86)): bell(m, 9.66 + j*0.05, 0.10, pan=-0.6 + j*0.4)
pad([D, A, 64, 66, 69], 9.6, 4.6, 0.85, a=0.25, r=1.2, cut=2600)  # Dmaj9 bloom
# C: 13.7 to 40.8, the product. I V vi IV, one chord per bar (3s).
prog = [[50, 57, 62, 66], [49, 57, 61, 64], [47, 54, 62, 66], [43, 55, 59, 62]]
arp = [[62, 66, 69, 74], [61, 64, 69, 73], [59, 62, 66, 71], [59, 62, 67, 71]]
# constant tempo across the (possibly stretched) feature section: whole bars, about 80 bpm
t0 = W(13.7); nbars = max(1, round((W(40.8) - t0) / 3.0)); barlen = (W(40.8) - t0) / nbars; beat = barlen / 4
for bar in range(nbars):
    at = t0 + bar * barlen; c = bar % 4
    pad(prog[c], at, barlen + 0.25, 0.62, a=0.35, r=0.6, cut=1600 + min(bar, 8) * 120, raw=True)
    bassn = int(SR*barlen); tb = np.arange(bassn)/SR
    add(np.sin(2*np.pi*hz(prog[c][0]-12)*tb) * env(bassn, 0.02, 0.3) * 0.5, at, 0.22, raw=True)
    for s in range(8):
        pluck(arp[c][[0, 2, 1, 3, 2, 0, 3, 1][s]] + 12 * (bar >= 4 and s % 4 == 3), at + s * beat / 2,
              0.11 if bar else 0.11 * (s / 8), pan=(-0.35 if s % 2 else 0.35), raw=True)
    for k in range(4):
        if bar >= 1: kick(at + k * beat, 0.32 if k % 2 == 0 else 0.16, raw=True)
        if bar >= 2:
            for h in range(4): shaker(at + k*beat + h*beat/4, 0.05 if h % 2 else 0.025, 0.5 if h % 2 else -0.4, raw=True)
for st in (19.7, 25.7, 31.7, 36.7):            # phone spins
    sweep(st - 0.55, 0.9, 0.14, up=False)
for tap in (16.4, 23.0, 28.4):                 # in-screen taps
    bell(86, tap, 0.05, pan=0.3)
# D: 40.8 to 48, the fan out. Drums drop, IV to I, ring out.
sweep(40.2, 0.8, 0.18, up=False)
boom(40.85, 0.35)
pad([43, 55, 59, 62, 69], 40.8, 3.3, 0.75, a=0.2, r=0.9, cut=2200)
pad([38, 50, 57, 62, 66, 69], 43.6, 4.4, 0.8, a=0.9, r=3.0, cut=2000)
for j, m in enumerate((74, 78, 81, 85, 86)): bell(m, 44.2 + j * 0.375, 0.06, pan=-0.5 + j * 0.25)

# Master: plate-ish reverb from decaying stereo noise, gentle glue, fade.
irn = int(2.6 * SR); tir = np.arange(irn) / SR
irL = rng.standard_normal(irn) * np.exp(-tir * 2.4); irR = rng.standard_normal(irn) * np.exp(-tir * 2.4)
irL, irR = lp(irL, 5000), lp(irR, 5000)
wetL = fftconvolve(L, irL)[:N]; wetR = fftconvolve(R, irR)[:N]
w = 0.28 / np.max(np.abs(np.concatenate([wetL, wetR]))) * np.max(np.abs(np.concatenate([L, R])))
mix = np.stack([L + wetL * w, R + wetR * w], 1)
mix = hp(mix.T, 30).T
mix *= np.clip((DUR - t_all) / 1.2, 0, 1)[:, None]
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.4) / np.tanh(1.4) * 0.89
assert mix.shape == (N, 2) and np.isfinite(mix).all()
sf.write('music.wav', mix.astype(np.float32), SR)
print('ok', mix.shape)
