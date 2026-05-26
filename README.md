# VaultPay

A decentralized escrow payment dApp using virtual ERC20 tUSD on a local Hardhat network.

## Setup

```bash
npm install
npm run compile
npm run test
```

## Run locally (3 terminals)

| Terminal | Command | Purpose |
|----------|---------|---------|
| 1 | `npm run node` | Hardhat JSON-RPC (port 8545) |
| 2 | `npm run deploy:local` | Deploy MockTUSD + VaultPay |
| 3 | `cd frontend && npm install && npm run dev` | Vite dev server (port 5173) |

After deploy, contract addresses are auto-written to `frontend/src/config.ts`.

## MetaMask Setup

- Network: Custom RPC `http://127.0.0.1:8545`, Chain ID `31337`
- Import a test account private key from `npm run node` output

## Open the app

http://127.0.0.1:5173
