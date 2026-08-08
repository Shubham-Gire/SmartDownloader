# Task TODO — Show video thumbnail while downloading & save to browser Downloads

## Goal
1. Show the YouTube video thumbnail in the DownloadBar ready state.
2. Ensure downloaded files land in the browser's native Downloads section.

## Steps
- [x] 1. Edit `src/components/DownloadBar.jsx`:
      - Display `info.thumbnail` as a 16:9 rounded thumbnail next to the title.
      - Add `onError` fallback to gracefully hide a broken thumbnail.
- [x] 2. Verify download flow already saves files into browser Downloads (Blob + anchor click).
- [x] 3. Run `npm run build` to confirm the frontend compiles.

