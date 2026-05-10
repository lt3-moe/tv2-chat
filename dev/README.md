# Dev notes

## Publish stream with ffmpeg

```bash
ffmpeg -re -f lavfi -i testsrc=size=1280x720:rate=30 \
-f lavfi -i "sine=frequency=1000:sample_rate=48000" \
-c:v libx264 -pix_fmt yuv420p -preset ultrafast -b:v 600k \
-c:a libopus -ar 48000 -ac 2 -b:a 128k \
-f whip http://localhost:8889/webrtc-stream/whip
```
