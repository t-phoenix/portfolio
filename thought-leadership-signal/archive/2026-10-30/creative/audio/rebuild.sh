#!/bin/zsh
# Rebuild glance-film-vo.mp4 from narration.md. Needs uv, ffmpeg, node, Chrome, and Kokoro files in ~/.cache/kokoro.
cd "${0:A:h}" && exec uv run -q --python 3.12 --with kokoro-onnx --with soundfile --with scipy python build.py
