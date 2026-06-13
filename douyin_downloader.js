/**
 * Douyin Video Downloader — Direct Video ID Input
 *
 * Usage:
 * 1. Open https://www.douyin.com (log in for best results)
 * 2. Press F12 → Console tab → Paste this script → Press Enter
 * 3. Enter your list of Video IDs (one per line) → Click OK
 * 4. download_links.txt will be saved automatically when done
 */

const sleep = ms => new Promise(r => setTimeout(r, ms));

function inputIds() {
  const raw = prompt(
    "Paste your Douyin Video IDs below (one per line):\n(Example: 7385123456789012345)",
    ""
  );
  if (!raw) return [];
  return raw
    .split(/[\n,\s]+/)
    .map(s => s.trim())
    .filter(s => /^\d{15,20}$/.test(s)); // Douyin IDs are typically 15-20 digits
}

async function getVideoInfo(awemeId) {
  const r = await fetch(
    `https://www.douyin.com/aweme/v1/web/aweme/detail/?device_platform=webapp&aid=6383&aweme_id=${awemeId}&version_code=170400&version_name=17.4.0`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
      },
      referrer: "https://www.douyin.com/",
      credentials: "include",
    }
  );
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

function extractBestUrl(data) {
  const v = data?.aweme_detail?.video;
  if (!v) return null;
  for (const list of [
    v?.play_addr_h264?.url_list,
    v?.play_addr?.url_list,
    v?.download_addr?.url_list,
    v?.bit_rate?.[0]?.play_addr?.url_list,
  ]) {
    if (list?.length) {
      const u = list[0];
      return u.startsWith("https") ? u : u.replace("http://", "https://");
    }
  }
  return null;
}

function saveFile(content, filename) {
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([content], { type: "text/plain" })),
    download: filename,
  });
  a.click();
}

async function run() {
  const ids = inputIds();
  if (!ids.length) { console.log("No valid IDs found. Exiting."); return; }

  console.log(`\n=== Processing ${ids.length} Video ID(s) ===\n`);

  const results = [];
  const failed  = [];

  for (let i = 0; i < ids.length; i++) {
    const awemeId = ids[i];
    console.log(`[${i + 1}/${ids.length}] ID: ${awemeId}`);

    try {
      const data    = await getVideoInfo(awemeId);
      const playUrl = extractBestUrl(data);
      if (!playUrl) throw new Error("API returned no video URL");

      console.log(`  OK: ${playUrl.slice(0, 80)}...`);
      results.push({ id: awemeId, url: playUrl });

    } catch (e) {
      console.warn(`  FAILED: ${e.message}`);
      failed.push(`# FAILED [${i + 1}]: ${awemeId} — ${e.message}`);
    }

    if (i < ids.length - 1) await sleep(800);
  }

  const output = [
    "=== IDs ===",
    ...results.map(r => r.id),
    "",
    "=== Download URLs ===",
    ...results.map(r => r.url),
    ...(failed.length ? ["", ...failed] : []),
  ].join("\n");

  saveFile(output, "download_links.txt");

  console.log(`\n=== Done: ${results.length}/${ids.length} succeeded ===`);
  console.log("Saved: download_links.txt");
}

run();
