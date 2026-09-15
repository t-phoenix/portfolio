# Video Creative — post-03 (slide-03 motion)

## Source
- `slide-03.png` (Transition thesis)

## Output
- File: `post-03.mp4`
- Codec: H.264 (libx264), yuv420p
- Resolution: `1080x1080`
- Duration: `6.0s` (~30fps)
- Audio: none

## Motion
- Subtle centered zoom/pan to create scroll-stop movement without adding any new text.
- Zoom envelope: ~`1.00x -> 1.08x`

## Build command
```bash
ffmpeg -y -loop 1 -i slide-03.png -t 6 \
  -vf "zoompan=z='min(zoom+0.0015,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1080:fps=30,fade=t=in:st=0:d=0.3,fade=t=out:st=5.7:d=0.3,format=yuv420p" \
  -movflags +faststart post-03.mp4
```

