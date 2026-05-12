## Requirements
- A modern browser (Chrome, Edge, or Firefox)
- A Douyin account (logged in — improves success rate significantly)
- Internet Download Manager (IDM) or any URL-list-based download manager

## Usage

### Step 1 — Open Douyin and the Console

1. Navigate to **[https://www.douyin.com](https://www.douyin.com)** and make sure you are logged in
2. Open the browser Developer Tools: press `F12` or `Ctrl + Shift + I`
3. Click the **Console** tab

### Step 2 — Run the Script

1. Copy the entire contents of [`douyin_link_extractor.js`](./douyin_link_extractor.js)
2. Paste it into the Console and press **Enter**
3. A prompt dialog will appear — paste your Douyin links into it, **one link per line**:

```
https://v.douyin.com/re2Hirp2aLc
https://v.douyin.com/AfHuEV-W-v0
https://v.douyin.com/72QbYRyJ1fA
```

4. Click **OK** to start

### Step 3 — Allow Popups

The script opens a small off-screen popup for each link to follow the redirect. If your browser shows a popup-blocked notification, click **Allow** and run the script again.

> To avoid being asked every time: go to browser **Settings → Privacy & Security → Site Settings → Pop-ups and redirects** → add `douyin.com` to the allowed list.

### Step 4 — Wait and Save

The script processes links one by one. Watch the Console for progress:

```
[1/5] https://v.douyin.com/re2Hirp2aLc
  → https://www.douyin.com/video/7361514408332564338
  aweme_id: 7361514408332564338
  OK: https://v5-hl-mly-ov.zjcdn.com/...

=== Done: 5/5 succeeded ===
Saved: download_links.txt
```

`download_links.txt` is automatically downloaded when all links are processed.

---

## Importing into IDM

1. Open **Internet Download Manager (IDM)**
2. Go to **Tasks → Import → Import URLs from file...**
3. Select the downloaded `download_links.txt`
4. Select the URLs you want to download (`Ctrl + A` to select all)
5. Click **OK**, choose your download folder
6. Click **Start Download**

---

## Output Format

`download_links.txt` contains one direct CDN URL per line, ready for any download manager:

```
https://v5-hl-mly-ov.zjcdn.com/video1.mp4?...
https://v5-hl-mly-ov.zjcdn.com/video2.mp4?...
https://v5-hl-mly-ov.zjcdn.com/video3.mp4?...

# FAILED [2]: https://v.douyin.com/xyz — Could not resolve video ID
```

Failed links are noted at the bottom with the reason.

---

## Supported Link Formats

| Format | Example | Supported |
|---|---|---|
| Douyin short link | `https://v.douyin.com/xxxxx` | ✅ |
| Douyin full video URL | `https://www.douyin.com/video/123456` | ✅ |
| Kuaishou / other platforms | `https://v.kuaishou.com/xxx` | ❌ |

---

## Notes

- **CDN links expire** — download the videos soon after extracting the links (usually valid for a few hours)
- **Login required** for private or age-restricted content; public videos may work without login
- **Rate limiting** — the script adds a 1-second delay between requests to avoid being blocked
- Please respect copyright and Douyin's Terms of Service when using downloaded content

---

## Also in This Repo

| File | Description |
|---|---|
| [`douyin_link_extractor.js`](./douyin_link_extractor.js) | Main browser console script (this tool) |
| [`douyin_download_all_video.js`](./douyin_download_all_video.js) | Bulk-extract all video links from a user profile page |
