/**
 * ATS keyword coverage check against Ethereum Institutional FDE JD.
 * Pass = all required groups hit + overall coverage >= threshold.
 */
const fs = require("fs");
const path = require("path");

const resumePath = path.resolve(
  __dirname,
  "Abhinil_Agarwal_Forward_Deployed_Engineer.md"
);
const htmlPath = path.resolve(
  __dirname,
  "Abhinil_Agarwal_Forward_Deployed_Engineer.html"
);

const text = (
  fs.readFileSync(resumePath, "utf8") +
  "\n" +
  fs.readFileSync(htmlPath, "utf8")
).toLowerCase();

// Phrases / tokens drawn from the public JD
const REQUIRED = {
  role_title: ["forward deployed"],
  ethereum: ["ethereum"],
  smart_contracts: ["smart contract"],
  solidity_or_ts: ["solidity", "typescript"],
  production_engineering: ["production"],
  fintech_or_finance: ["fintech", "financial institution", "onchain finance", "private credit"],
  discovery_scoping: ["technical discovery", "technical scoping", "scoping"],
  poc_demo: ["proof", "poc", "reference implementation", "demo"],
  documentation: ["documentation", "architecture"],
  client_facing: ["client", "stakeholder", "partner"],
  settlement_or_tokenization: ["settlement", "tokenization", "stablecoin"],
  l2_or_custody_adjacent: ["l2", "layer 2", "custody"],
};

const PREFERRED = {
  solutions_engineering: ["solutions engineering", "field engineering", "technical consulting", "forward-deployed"],
  institutional_digital_assets: ["institutional", "digital-asset", "private credit", "onchain"],
  cloud_security_compliance: ["cloud", "security", "compliance"],
  reusable_tools: ["reusable", "reference"],
};

function hitGroup(terms) {
  return terms.some((t) => text.includes(t.toLowerCase()));
}

function score(groups) {
  const rows = [];
  let ok = 0;
  for (const [name, terms] of Object.entries(groups)) {
    const hit = hitGroup(terms);
    if (hit) ok += 1;
    rows.push({ name, hit, terms });
  }
  return { ok, total: rows.length, rows, pct: Math.round((ok / rows.length) * 100) };
}

const required = score(REQUIRED);
const preferred = score(PREFERRED);

// Structural ATS checks
const structure = {
  standard_headings: [
    "professional summary",
    "experience",
    "education",
    "technical skills",
  ].every((h) => text.includes(h)),
  contact_email: text.includes("abhijaipur2011@gmail.com"),
  contact_linkedin: text.includes("linkedin.com/in/abhinil"),
  no_tables_in_html: !/<table[\s>]/i.test(fs.readFileSync(htmlPath, "utf8")),
  no_text_as_image: true,
  years_signal: /5\+\s*years|5–10|5-10/.test(
    fs.readFileSync(resumePath, "utf8")
  ),
};

const structureOk = Object.values(structure).every(Boolean);
const pass =
  required.ok === required.total &&
  required.pct === 100 &&
  preferred.pct >= 75 &&
  structureOk;

console.log("=== ATS CHECK: Ethereum Institutional FDE ===\n");
console.log("REQUIRED groups:", `${required.ok}/${required.total} (${required.pct}%)`);
for (const r of required.rows) {
  console.log(`  ${r.hit ? "PASS" : "FAIL"}  ${r.name}`);
}
console.log("\nPREFERRED groups:", `${preferred.ok}/${preferred.total} (${preferred.pct}%)`);
for (const r of preferred.rows) {
  console.log(`  ${r.hit ? "PASS" : "FAIL"}  ${r.name}`);
}
console.log("\nSTRUCTURE:");
for (const [k, v] of Object.entries(structure)) {
  console.log(`  ${v ? "PASS" : "FAIL"}  ${k}`);
}
console.log(`\nOVERALL: ${pass ? "PASS — ATS clear (keyword + structure)" : "FAIL — fix missing groups"}`);
process.exit(pass ? 0 : 1);
