/**
 * Douyin Video Link Extractor
 * Extracts direct download links from a list of Douyin short URLs.
 *
 * Usage:
 * 1. Navigate to https://www.douyin.com (log in for best results)
 * 2. Open browser Console (F12 → Console tab)
 * 3. Paste this script and press Enter
 * 4. A prompt will appear — paste your links, one per line, then click OK
 * 5. Allow popups if the browser asks
 * 6. download_links.txt will be saved automatically when done
 */

const sleep = ms => new Promise(r => setTimeout(r, ms));

function inputUrls() {
  const raw = prompt(
    "Paste your Douyin video links below (one per line):\n(Click OK to start, Cancel to exit)",
    ""
  );
  if (!raw) return [];
  return raw
    .split(/[\n,\s]+/)
    .map(u => u.trim())
    .filter(u => u.startsWith("http"));
}

/**
 * Opens a tiny off-screen popup, waits for the short URL to redirect to
 * www.douyin.com/video/ID (same origin), reads the final URL, then closes the popup.
 */
async function resolveViaPopup(shortUrl, waitMs = 4000) {
  const win = window.open(
    shortUrl, "_blank",
    "width=1,height=1,left=-9999,top=-9999,toolbar=no,menubar=no,scrollbars=no"
  );

  if (!win) {
    console.warn("  Popup blocked! Go to browser Settings and allow popups from douyin.com, then try again.");
    return null;
  }

  await sleep(waitMs);

  let finalUrl = null;
  try {
    finalUrl = win.location.href;
  } catch (e) {
    // Still on cross-origin — wait a bit longer and retry
    await sleep(2000);
    try { finalUrl = win.location.href; } catch (e2) {}
  }

  try { win.close(); } catch (e) {}

  if (!finalUrl || finalUrl === "about:blank") return null;
  console.log(`  → ${finalUrl.slice(0, 80)}`);
  const m = finalUrl.match(/\/video\/(\d+)/);
  return m ? m[1] : null;
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
  const allUrls    = inputUrls();
  if (!allUrls.length) { console.log("No links entered. Exiting."); return; }

  const douyinUrls = allUrls.filter(u => u.includes("douyin.com"));
  const others     = allUrls.filter(u => !u.includes("douyin.com"));

  console.log(`\n=== Processing ${douyinUrls.length} Douyin link(s) ===`);
  if (others.length)
    console.log(`Skipping ${others.length} non-Douyin link(s): ${others.join(", ")}`);
  console.log("If the browser asks about popups → click ALLOW\n");

  const playUrls = [];
  const failed   = [];

  for (let i = 0; i < douyinUrls.length; i++) {
    const url = douyinUrls[i];
    console.log(`[${i + 1}/${douyinUrls.length}] ${url}`);

    try {
      // If already a full video URL, extract ID directly
      let awemeId = (url.match(/\/video\/(\d+)/) || [])[1] || null;

      // Otherwise resolve the short URL via popup redirect
      if (!awemeId) awemeId = await resolveViaPopup(url);
      if (!awemeId) throw new Error("Could not resolve video ID");

      console.log(`  aweme_id: ${awemeId}`);

      const data    = await getVideoInfo(awemeId);
      const playUrl = extractBestUrl(data);
      if (!playUrl) throw new Error("API returned no video URL");

      console.log(`  OK: ${playUrl.slice(0, 80)}...`);
      playUrls.push(playUrl);

    } catch (e) {
      console.warn(`  FAILED: ${e.message}`);
      failed.push(`# FAILED [${i + 1}]: ${url} — ${e.message}`);
    }

    if (i < douyinUrls.length - 1) await sleep(1000);
  }

  const output = [...playUrls, ...(failed.length ? ["", ...failed] : [])].join("\n");
  saveFile(output, "download_links.txt");

  console.log(`\n=== Done: ${playUrls.length}/${douyinUrls.length} succeeded ===`);
  console.log("Saved: download_links.txt");
}

run();
