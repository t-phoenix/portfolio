// ATS keyword + structure check for EVM DeFi lending / Senior Solidity roles (Blockvora brief). Reads the exported PDF text.
const { execSync } = require("child_process");
const t = execSync("pdftotext Abhinil_Agarwal_Senior_Solidity_DeFi_Engineer.pdf -", { cwd: __dirname }).toString().toLowerCase();
const groups = {
  solidity: ["solidity"], evm: ["evm"], smart_contracts: ["smart contract"], defi: ["defi"],
  lending_loans: ["lending", "loan"], collateral: ["collateral"], yield: ["yield"],
  cross_chain: ["cross-chain", "multi-chain", "bridg"], nft_standards: ["erc-721", "erc-1155"],
  testing_security: ["foundry", "audit", "security"], frontend_web3: ["react", "wagmi", "ethers"],
  seniority: ["senior", "5+ years"],
  headings: ["professional summary", "experience", "education"], contact: ["abhijaipur2011@gmail.com", "linkedin.com/in/"],
};
let ok = true;
for (const [k, terms] of Object.entries(groups)) {
  const hit = k === "headings" || k === "contact" ? terms.every((x) => t.includes(x)) : terms.some((x) => t.includes(x));
  ok &&= hit; console.log(hit ? "PASS" : "FAIL", k);
}
console.log(ok ? "OVERALL: PASS" : "OVERALL: FAIL"); process.exit(ok ? 0 : 1);
