function bytesStartWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((value, index) => bytes[offset + index] === value);
}

export function matchesFileSignature(bytes: Uint8Array, mimeType: string) {
  switch (mimeType) {
    case "image/png":
      return bytesStartWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/jpeg":
      return bytesStartWith(bytes, [0xff, 0xd8, 0xff]);
    case "image/webp":
      return bytesStartWith(bytes, [0x52, 0x49, 0x46, 0x46]) && bytesStartWith(bytes, [0x57, 0x45, 0x42, 0x50], 8);
    case "image/avif":
      return bytesStartWith(bytes, [0x66, 0x74, 0x79, 0x70], 4) && ["avif", "avis"].includes(new TextDecoder().decode(bytes.slice(8, 12)));
    default:
      return false;
  }
}

export function safeFileName(name: string) {
  const normalized = name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return normalized || "asset";
}

export function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function blockedRemoteHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (normalized === "localhost" || normalized.endsWith(".localhost") || normalized.endsWith(".local") || normalized.includes(":")) return true;
  const octets = normalized.split(".").map(Number);
  if (octets.length !== 4 || octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) return false;
  const [a, b] = octets;
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168);
}

// Remote catalogue media is fetched by the Worker before editorial review. Keep
// this list explicit so a new outbound destination requires a reviewed change.
const approvedRemoteImageHostnames = new Set([
  "1password.com",
  "antinote.io",
  "anybox.app",
  "appahead.studio",
  "assets.microsaasexamples.com",
  "balance.software",
  "betterdisplay.pro",
  "blip.net",
  "bloomapp.club",
  "cdn.jim-nielsen.com",
  "cdn.mos.cms.futurecdn.net",
  "cdn.prod.website-files.com",
  "cdn.sanity.io",
  "cdn.theunarchiver.com",
  "cdn.tryalcove.com",
  "compresto.app",
  "culturedcode.com",
  "daisydiskapp.com",
  "displaybuddy.app",
  "drive.usercontent.google.com",
  "expenses.cash",
  "files.raycast.com",
  "flexibits.com",
  "folivora.ai",
  "framerusercontent.com",
  "getcoldturkey.com",
  "getdrafts.com",
  "getdroppy.app",
  "handbrake.fr",
  "highlyopinionated.co",
  "i.imgur.com",
  "iina.io",
  "image.social",
  "image.thum.io",
  "images.ctfassets.net",
  "images.squarespace-cdn.com",
  "img.panaitiu.com",
  "img.utdstc.com",
  "imgproxy.flathub.org",
  "impresskit.net",
  "is1-ssl.mzstatic.com",
  "itsalin.com",
  "lifehacker.com",
  "lookaway.com",
  "lowtechguys.com",
  "lunar.fyi",
  "macautomationtips.com",
  "macify.app",
  "magnet.crowdcafe.com",
  "mimestream.com",
  "mole.fit",
  "mymind.com",
  "obsidian.md",
  "orionbrowser.com",
  "p16-seeyou-sg.ibyteimg.com",
  "pasteapp.io",
  "pbs.twimg.com",
  "ph-files.imgix.net",
  "pimosa.app",
  "play-lh.googleusercontent.com",
  "presentifyapp.com",
  "proxyman.com",
  "pub-00cbe4c645bf4b178da5fd991a0aa92e.r2.dev",
  "qspace.awehunt.com",
  "rectangleapp.com",
  "s3-new.macosicons.com",
  "s4.wallspace.app",
  "shottr.cc",
  "sindresorhus.com",
  "spokenly.app",
  "store.setapp.com",
  "superwhisper.com",
  "t0.gstatic.com",
  "t1.gstatic.com",
  "t2.gstatic.com",
  "t3.gstatic.com",
  "tryalcove.com",
  "www.alfredapp.com",
  "www.chronoid.app",
  "www.diabrowser.com",
  "www.macsparky.com",
  "www.raycast.com",
  "www.seense.com",
  "www.sketch.com",
  "www.stayinsession.com",
  "www.todayonmac.com",
  "www.voiceos.com",
]);

export function parseRemoteImageUrl(value: string) {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase();
    if (
      url.protocol !== "https:"
      || !hostname
      || url.username
      || url.password
      || blockedRemoteHostname(hostname)
      || !approvedRemoteImageHostnames.has(hostname)
    ) return null;
    return url;
  } catch {
    return null;
  }
}
