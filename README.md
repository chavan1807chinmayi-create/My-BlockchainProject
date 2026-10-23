# BlockCert 2.0

Decentralized academic certificates. Issuers register the **SHA-256 of each certificate PDF** in a Solidity contract on a local Hardhat chain; anyone can verify a certificate ID or upload a PDF without a wallet. No backend, no database, no external services.

Stack: React + TypeScript + Vite + Tailwind, Solidity 0.8.24 + Hardhat, Ethers v6, MetaMask, jsPDF, qrcode.

```
contracts/CertificateRegistry.sol    scripts/  deploy.js  setup.ps1  e2e.ts
test/CertificateRegistry.test.js     src/blockchain/  config + ethers integration (deployment.json is generated)
src/lib/  pdf.ts (templates, QR)  hash.ts  issue.ts  csv.ts        src/pages, src/components  UI
```

## Requirements
Node.js 20 or 22 LTS, MetaMask extension. The first compile downloads the Solidity compiler (internet needed once).

## Setup (Windows PowerShell)
```powershell
cd C:\path\to\blockcert
npm install

npm run setup      # opens a 2nd window running "npx hardhat node", compiles, deploys,
                   # and writes src\blockchain\deployment.json + CertificateRegistry.abi.json
# Manual equivalent (two terminals):
#   Terminal A:  npm run node
#   Terminal B:  npm run compile ; npm run deploy

npm run dev        # http://localhost:5173
```
Setup only writes the two generated files in `src\blockchain`; it never touches anything else.

## MetaMask (local development only)
1. Click **Connect wallet**. The app adds/switches to *Hardhat Local* for you. (Manual: RPC `http://127.0.0.1:8545`, chain ID `31337`, symbol ETH.)
2. Import the issuer account (MetaMask > Add account > Import account) with Hardhat account #0's key:
   `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

> **This key is public** (published in Hardhat's docs). Anyone can take funds sent to it on a real network. Use it only on the local chain. Never import a real wallet's key or send real funds to these accounts.

## Tests
```powershell
npm test      # 11 contract tests
npm run e2e   # needs node + deploy running; issue, verify, tamper, revoke through the app's own code
```
If `binaries.soliditylang.org` is blocked, set `$env:BLOCKCERT_OFFLINE_SOLC="1"` first to use the bundled `solc` npm package.

## Manual end-to-end checklist
1. **Issue**: Issuer tab shows *AUTHORIZED ISSUER*. Fill the form, *Issue on blockchain*, approve in MetaMask. Success appears only after "Confirmed on-chain in block N". Note ID and tx hash; download the PDF.
2. **Verify**: open `#/verify/<ID>` in a private window with no wallet: VALID, issuer, date, tx hash.
3. **Integrity**: upload the original PDF on the Verify page: byte-identical.
4. **Tamper**: flip one byte, then upload the copy: mismatch.
   `$b=[IO.File]::ReadAllBytes("c.pdf"); $b[$b.Length-20]=$b[$b.Length-20] -bxor 255; [IO.File]::WriteAllBytes("c-tampered.pdf",$b)`
5. **Revoke**: Issuer > Revoke, enter ID, approve, wait for confirmation.
6. **Verify revocation**: reload `#/verify/<ID>`: REVOKED, original hash and issuance tx still shown. History lists both events from contract logs.
7. **Bulk**: Issuer > Bulk CSV, download the sample, upload, issue; each row reports CONFIRMED or FAILED.

## Troubleshooting
- **Port 8545 busy**: `Get-NetTCPConnection -LocalPort 8545 | Select OwningProcess`, then `Stop-Process -Id <pid>`. Same for 5173 (strict port).
- **"No contract at 0x..." / wrong address**: Hardhat's chain is in memory, so a restart wipes it. Run `npm run deploy`, refresh.
- **Chain mismatch**: switch MetaMask to *Hardhat Local* (31337); the header shows "wrong network".
- **Nonce errors after a chain reset**: MetaMask > Settings > Advanced > *Clear activity tab data*.
- **Cannot reach blockchain**: keep the `hardhat node` window open.
- QR codes link to the current origin; to scan from a phone you would need `npm run dev -- --host` and a chain the phone can reach.

## Limitations
- Only hash, issuer and timestamps are on-chain. A QR code is a pointer; the contract is the authority.
- Hashing is byte-exact: re-saving or print-to-PDF changes the hash. Keep the downloaded file.
- The local chain resets on restart and certificates vanish with it; use a public testnet for persistence (not configured).
- Deployer is the only initial issuer. The contract has `addIssuer/removeIssuer`, but the UI has no screen for it.
- History/stats scan events from the deploy block; fine locally, an indexer would be needed at scale.
