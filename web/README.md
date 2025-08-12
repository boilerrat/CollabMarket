This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Fee Gating (On-chain)

Server-side verifies payments to the `PostingFee` contract by reading `FeePaid` events via viem.

Environment variables required:

```
CHAIN_RPC_URL=...           # RPC URL for the target chain
CHAIN_ID=84532              # e.g., Base Sepolia
POSTING_FEE_CONTRACT=0x...  # deployed PostingFee address
USDC_CONTRACT=0x...         # USDC token used by the contract
DATABASE_URL=...
```

Endpoints requiring payment when fees are enabled:
- `POST /api/profile?payment_tx=0x...` (action: "profile")
- `POST /api/projects?payment_tx=0x...` (action: "project")

Helper endpoint:
- `GET /api/fees` returns `{ enabled, price, contract, token, chainId }` for the UI to display price and prompt for tx hash.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
