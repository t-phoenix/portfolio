#!/bin/zsh
# Builds youtube-short.mp4 (1080x1920) from the intro film, cut at voice pauses.
set -e
cd "${0:a:h}"
SRC=../t1-intro.mp4
segs=(a:20.3:37.2 b:49.1:55.3 c:65.2:86.6 d:93.9:102.5 e:110.0:118.2)
list=()
for s in $segs; do
  id=${s%%:*}; rest=${s#*:}; a=${rest%%:*}; b=${rest#*:}
  d=$(echo "$b - $a" | bc)
  fo=$(echo "$d - 0.12" | bc)
  ffmpeg -loglevel error -y -loop 1 -i bg-$id.png -ss $a -to $b -i $SRC \
    -filter_complex "[1:v]scale=1080:608,setsar=1[v];[0:v][v]overlay=0:656:shortest=1,format=yuv420p[o];[1:a]afade=t=in:d=0.08,afade=t=out:st=$fo:d=0.12[au]" \
    -map "[o]" -map "[au]" -t $d -r 30 -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 160k -ar 48000 seg-$id.mp4
  list+=("file 'seg-$id.mp4'")
done
printf "%s\n" $list > list.txt
ffmpeg -loglevel error -y -f concat -safe 0 -i list.txt -c copy -movflags +faststart ../youtube-short.mp4
rm -f seg-*.mp4 list.txt
echo built ../youtube-short.mp4
