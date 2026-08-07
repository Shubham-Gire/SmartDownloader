# Fix: Audio not getting in video downloads

## Steps
1. [x] Investigate download flow (frontend DownloadBar.jsx, backend downloader.py, extractor.py, models.py)
2. [x] Update DownloadBar.jsx quality options:
   - Only offer progressive formats (has_video && has_audio)
   - Add "Best quality (video + audio)" merged option (empty format_id) as default
   - Keep "Audio only (MP3)" option
3. [x] Update default selection to the merged "Best quality" option
4. [x] Rebuild/restart frontend and re-test video download has audio + MP3 extraction still works (vite build passed)
