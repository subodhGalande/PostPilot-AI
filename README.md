PostPilot AI

A modern, privacy-minded Next.js app for posting and user authentication with Prisma and JWT-based auth, including email verification and Google OAuth.

![version](https://img.shields.io/badge/version-0.1.0-blue)
![build](https://img.shields.io/badge/build-passing-brightgreen)

## What the project does

PostPilot AI is a starter web application built on Next.js (App Router) that provides a complete authentication system (signup, login, logout, email verification, password hashing, and Google OAuth), data access via Prisma, and a simple UI component library. It's intended as a fast developer-friendly base for building social or posting apps and learning secure auth patterns in a full-stack TypeScript project.

## Why this is useful

- Secure authentication flows (email verification, JWT using `jose`, refresh/revocation support)
- Database schema and migrations using Prisma
- Production-ready patterns: environment-based configuration, email verification with Nodemailer, and third-party OAuth
- Clean, reusable UI components and example pages to bootstrap features quickly

## Project layout (high level)

- `app/` — Next.js App Router pages and API routes (auth flows under `app/api/auth/`)
- `components/` — Reusable UI components and auth forms
- `lib/` — Prisma client, utils, and auth helpers
- `prisma/` — Prisma schema and migration history

## Getting started

Prerequisites:

- Node.js (>=18 recommended)
- pnpm, npm, or yarn

Install and run locally:

1. Install dependencies

```bash
npm install
# or pnpm install
```

2. Create `.env` and set required environment variables (example):

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
EMAIL_SMTP_HOST=...
EMAIL_SMTP_USER=...
EMAIL_SMTP_PASSWORD=...
SMTP_VERIFIED_SENDER_MAIL=verified@example.com
APP_URL=http://localhost:3000
```

3. Prepare the database

```bash
npx prisma migrate dev --name init
```

4. Start dev server

```bash
npm run dev
# open http://localhost:3000
```

### Example: Sign up (API)

Send a POST request to the signup endpoint to create a new account and trigger email verification:

```bash
curl -X POST "${APP_URL:-http://localhost:3000}/api/auth/signup" \
	-H "Content-Type: application/json" \
	-d '{"email":"user@example.com","name":"Example User","password":"s3cret"}'
```

## Useful scripts

- `npm run dev` — Run development server
- `npm run build` — Create a production build
- `npm start` — Start the production server
- `npm run lint` — Run the linter
- `npm run format` — Format code

## Authentication notes

- Passwords are hashed (argon2 / bcrypt present).
- JWTs are issued/verified using `jose` and stored where appropriate.
- Email verification routes exist at `app/api/auth/verify/route.ts` with resend support.
- Google OAuth integration implemented under `app/api/auth/google/`.

## Contributing & Support

If you'd like to contribute, please open issues or pull requests. Add a `CONTRIBUTING.md` to the repo to codify contribution guidelines — link one here when available: `CONTRIBUTING.md`.

For help or questions, open an issue or start a discussion in this repository.

## Maintainers

Maintained by the repository owner. If you plan to contribute, please open an issue to discuss larger changes.

---

If you'd like, I can also add a `CONTRIBUTING.md` and CI badge integration next.
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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
