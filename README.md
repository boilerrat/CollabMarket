# CollabMarket Contracts Deployment

This repository includes a Hardhat project for deploying the `PostingFee` smart contract.

## Prerequisites

- Node.js LTS 18/20 recommended
- NPM or PNPM

## Configure Environment

Create `smart-contract/.env` using `smart-contract/env.example` as a template:

```
cp smart-contract/env.example smart-contract/.env
```

Fill in:
- `PRIVATE_KEY` (0x-prefixed)
- `BASE_RPC_URL` and/or `BASE_SEPOLIA_RPC_URL`
- `USDC_ADDRESS` for Base/Base Sepolia (must point to an existing USDC token)

Note: `.env` is ignored by git per root `.gitignore`.

## Install and Compile

```
cd smart-contract
npm install
npm run compile
```

## Run Tests

```
npm test
```

## Deploy

- Localhost (spins up MockUSDC automatically if not provided):
```
npm run deploy:local
```

- Base Sepolia testnet:
```
npm run deploy:base-sepolia
```

- Base mainnet:
```
npm run deploy:base
```

Deployment uses `smart-contract/scripts/deploy.js`. On Base networks, ensure `USDC_ADDRESS` is set.


