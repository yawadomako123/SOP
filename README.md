# Nienalabs Starter Kit

This is a [Next.js](https://nextjs.org) starter kit designed for developers who want to use **Better Auth + Better Auth UI + Prisma + Shadcn + TRPC**. This template saves you time on authentication setup and TRPC backend configuration  so you can focus on building your product without worrying about boilerplates.

## Getting Started

Follow these steps to get your project up and running:

### 1. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Postgres Database URL (e.g., Neon or Supabase)
DATABASE_URL=""

# Better Auth Secret
# Run command: npx @better-auth/cli@latest secret
# Or visit Better Auth docs to generate one
BETTER_AUTH_SECRET=""

# GitHub OAuth Credentials
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Google OAuth Credentials
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Database Setup

Run the following command to migrate your database schema(a client is created automatically):

```bash
npx prisma migrate dev
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Special Notes

- **Shadcn Components**: All shadcn components have been added for your convenience. Please feel free to remove those you do not need when your project is complete.
- **Protected Routes**: Update the `proxy.ts` file to configure additional protected routes for your application.
- **Legal Pages**: Update `app/terms/page.tsx` and `app/privacy/page.tsx` to fit your specific business needs and legal requirements.

## OAuth Setup Guide

### Google OAuth
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services** > **Credentials**.
3. Click **Create Credentials** -> **OAuth Client ID**.
4. Application type: **Web application**.
5. Add Authorized redirect URIs (e.g., `http://localhost:3000/api/auth/callback/google`).
6. Copy the **Client ID** and **Client Secret** to your `.env` file.

### GitHub OAuth
1. Go to your GitHub **Settings**.
2. Navigate to **Developer settings** > **OAuth Apps**.
3. Click **New OAuth App**.
4. Fill in the specific details. Authorization callback URL should be `http://localhost:3000/api/auth/callback/github`.
5. Register application and copy **Client ID** and **Client Secret** to your `.env` file.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [Better Auth UI Documentation](https://www.better-auth-ui.com)
- [Prisma ORM Documentation](https://prisma.io/docs)
- [TRPC Documentation](https://trpc.io/docs)