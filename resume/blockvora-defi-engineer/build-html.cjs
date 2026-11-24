// Builds the ATS-plain HTML from the .md (single source of truth). Run before export-pdf.cjs.
const fs = require("fs");
const path = require("path");

const base = path.resolve(__dirname, "Abhinil_Agarwal_Senior_Solidity_DeFi_Engineer");
const css = fs
  .readFileSync(path.resolve(__dirname, "../ethereum-institutional-fde/Abhinil_Agarwal_Forward_Deployed_Engineer.html"), "utf8")
  .match(/<style>[\s\S]*?<\/style>/)[0];
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const lines = fs.readFileSync(base + ".md", "utf8").split("\n");
const out = [];
let inList = false;
const close = () => inList && (out.push("</ul>"), (inList = false));

lines.forEach((raw, i) => {
  const l = raw.trim();
  if (!l) return close();
  if (l.startsWith("# ")) return out.push(`<h1>${esc(l.slice(2))}</h1>`);
  if (i === 1) return out.push(`<p class="role">${esc(l)}</p><p class="contact">`);
  if (i >= 2 && i <= 5) return out.push(esc(l) + (i < 5 ? "<br />" : "</p>"));
  if (l.startsWith("## ")) return close(), out.push(`<h2>${esc(l.slice(3))}</h2>`);
  if (l.startsWith("### ")) return close(), out.push(`<div class="job-head">${esc(l.slice(4))}</div>`);
  if (l.startsWith("- ")) {
    if (!inList) out.push("<ul>"), (inList = true);
    return out.push(`<li>${esc(l.slice(2))}</li>`);
  }
  const m = l.match(/^([A-Za-z -]{3,30}): (.*)$/); // "Smart contracts: ..." skill rows
  if (m) return out.push(`<p><b>${esc(m[1])}:</b> ${esc(m[2])}</p>`);
  out.push(`<p${l.length < 120 ? ' class="job-sub"' : ""}>${esc(l)}</p>`); // short = date/location line
});
close();

fs.writeFileSync(
  base + ".html",
  `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<title>Abhinil Agarwal - Senior Smart Contract Engineer</title>\n${css}\n</head>\n<body>\n${out.join("\n")}\n</body>\n</html>\n`
);
console.log("wrote", base + ".html");
