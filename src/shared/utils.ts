
import path from "path";
import fs from "fs";

// Convert a price string (e.g. "₹ 1,149", "1149") to paise (e.g. 114900)
export function extractPriceToPaise(text: string): number | null {
  if (!text) return null;

  // Grab the first number-like thing (with optional commas)
  const match = text.match(/[\d,]+(\.\d+)?/);
  if (!match) return null;

  const cleaned = match[0].replace(/,/g, '');
  const value = Number(cleaned);
  if (Number.isNaN(value)) return null;

  // assume rupees -> convert to paise
  return Math.round(value * 100);
}

// Basic heuristic to check if title is about sunflowers
export function looksLikeSunflower(title: string): boolean {
  if (!title) return false;
  return /sunflower/i.test(title) || /sunflowers/i.test(title);
}


export function saveOffersToMarkdown(allOffers:any, baseName = "offers") {
  if (!Array.isArray(allOffers)) {
    throw new Error("allOffers must be an array");
  }

  // Use current date-time for filename
  const now = new Date();

  const pad = (n:any) => String(n).padStart(2, "0");

  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  const ss = pad(now.getSeconds());

  // Example: offers-2025-11-19_19-16-39.md
  const fileName = `${baseName}-${yyyy}-${mm}-${dd}_${hh}-${min}-${ss}.md`;

  // Markdown content
  const generatedAt = now.toISOString();

  const mdContent =
    `# Sunflower Offers\n\n` +
    `Generated at: \`${generatedAt}\`\n\n` +
    `Total offers: **${allOffers.length}**\n\n` +
    `## Raw JSON\n\n` +
    "```json\n" +
    JSON.stringify(allOffers, null, 2) +
    "\n```";

  const filePath = path.join(__dirname, fileName);

  fs.writeFileSync(filePath, mdContent, "utf8");

  return filePath;
}