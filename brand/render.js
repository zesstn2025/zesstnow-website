const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");

const BRAND = "/home/user/zesstnow-website/brand";
const PNG = path.join(BRAND, "png");
fs.mkdirSync(PNG, { recursive: true });

const jobs = [
  { svg: "zesst-now-mark.svg",           sizes: [1024, 512, 256, 128, 64] },
  { svg: "zesst-now-mark-mono.svg",      sizes: [1024, 512] },
  { svg: "zesst-now-mark-mono-tile.svg", sizes: [1024, 512] },
  { svg: "zesst-now-favicon.svg",        sizes: [180, 48, 32, 16] },
  { svg: "zesst-now-lockup.svg",         widths: [2048, 1024, 512] },
  { svg: "zesst-now-lockup-mono.svg",    widths: [2048, 1024] },
];

(async () => {
  const b = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox"],
  });

  for (const job of jobs) {
    const svg = fs.readFileSync(path.join(BRAND, job.svg), "utf8");
    const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    const [vw, vh] = [parseFloat(vb[1]), parseFloat(vb[2])];
    const base = job.svg.replace(/\.svg$/, "");

    const targets = job.sizes
      ? job.sizes.map((s) => ({ w: s, h: Math.round((s * vh) / vw), tag: s }))
      : job.widths.map((w) => ({ w, h: Math.round((w * vh) / vw), tag: w }));

    for (const t of targets) {
      const page = await b.newPage({
        viewport: { width: t.w, height: t.h },
        deviceScaleFactor: 1,
      });
      await page.setContent(
        `<html><body style="margin:0;background:transparent">
           <div style="width:${t.w}px;height:${t.h}px">${svg
             .replace(/width="[\d.]+"/, `width="${t.w}"`)
             .replace(/height="[\d.]+"/, `height="${t.h}"`)}</div>
         </body></html>`
      );
      await page.waitForTimeout(120);
      await page.screenshot({
        path: path.join(PNG, `${base}-${t.tag}.png`),
        omitBackground: true,
      });
      await page.close();
    }
    console.log(base, "->", targets.map((t) => t.tag).join(", "));
  }

  // contact sheet, so the whole system can be eyeballed at once
  const read = (f) => fs.readFileSync(path.join(BRAND, f), "utf8");
  const sheet = await b.newPage({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: 2 });
  await sheet.setContent(`<html><body style="margin:0;font-family:system-ui;background:#0B0E20;color:#E9EBFA">
    <div style="padding:44px">
      <div style="font-size:12px;letter-spacing:.2em;opacity:.5;margin-bottom:28px">ZESST NOW — LOGO SYSTEM</div>

      <div style="display:flex;gap:40px;align-items:center;margin-bottom:40px">
        <div style="width:150px">${read("zesst-now-mark.svg").replace(/width="\d+" height="\d+"/, 'width="150" height="150"')}</div>
        <div style="width:96px">${read("zesst-now-mark.svg").replace(/width="\d+" height="\d+"/, 'width="96" height="96"')}</div>
        <div style="width:56px">${read("zesst-now-mark.svg").replace(/width="\d+" height="\d+"/, 'width="56" height="56"')}</div>
        <div style="width:32px">${read("zesst-now-favicon.svg").replace(/width="\d+" height="\d+"/, 'width="32" height="32"')}</div>
        <div style="width:16px">${read("zesst-now-favicon.svg").replace(/width="\d+" height="\d+"/, 'width="16" height="16"')}</div>
        <div style="font-size:11px;opacity:.45;letter-spacing:.12em">150 · 96 · 56 · 32 · 16<br>(32 and below use the favicon cut)</div>
      </div>

      <div style="background:#05060F;padding:34px;border-radius:14px;margin-bottom:20px">
        <div style="width:560px">${read("zesst-now-lockup.svg").replace(/width="\d+" height="\d+"/, 'width="560" height="100"')}</div>
      </div>

      <div style="background:#fff;padding:34px;border-radius:14px;margin-bottom:20px">
        <div style="width:560px;color:#000">${read("zesst-now-lockup-mono.svg").replace(/width="\d+" height="\d+"/, 'width="560" height="100"')}</div>
      </div>

      <div style="display:flex;gap:20px">
        <div style="background:#fff;padding:26px;border-radius:14px"><div style="width:96px">${read("zesst-now-mark-mono.svg").replace(/width="\d+" height="\d+"/, 'width="96" height="96"')}</div></div>
        <div style="background:#fff;padding:26px;border-radius:14px"><div style="width:96px">${read("zesst-now-mark-mono-tile.svg").replace(/width="\d+" height="\d+"/, 'width="96" height="96"')}</div></div>
        <div style="padding:26px;font-size:11px;opacity:.45;letter-spacing:.1em;line-height:2">MONO CUTS — for the CA filing,<br>stamps and single-colour print</div>
      </div>
    </div>
  </body></html>`);
  await sheet.waitForTimeout(400);
  await sheet.screenshot({ path: __dirname + "/shots2/logo-sheet.png", fullPage: true });

  await b.close();
  console.log("\ncontact sheet written");
})();
