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

## ERD

```mermaid
erDiagram
    %% Better Auth 관련 테이블 정의
    user {
        TEXT id PK "User ID (UUID/Text)"
        TEXT name "User Name"
        TEXT email UK "Email (Unique)"
        BOOLEAN emailVerified "Email Verification Status"
        TEXT image "Profile Image URL"
        TIMESTAMP createdAt "Creation Timestamp"
        TIMESTAMP updatedAt "Update Timestamp"
    }

    session {
        TEXT id PK "Session ID"
        TIMESTAMP expiresAt "Expiration Timestamp"
        TEXT token UK "Session Token (Unique)"
        TIMESTAMP createdAt "Creation Timestamp"
        TIMESTAMP updatedAt "Update Timestamp"
        TEXT ipAddress "IP Address"
        TEXT userAgent "User Agent"
        TEXT userId FK "Foreign Key to user.id"
    }

    account {
        TEXT id PK "Account ID"
        TEXT accountId "Provider's Account ID"
        TEXT providerId "Provider ID ('email', 'google', etc.)"
        TEXT userId FK "Foreign Key to user.id"
        TEXT accessToken "OAuth Access Token"
        TEXT refreshToken "OAuth Refresh Token"
        TEXT idToken "OAuth ID Token"
        TIMESTAMP accessTokenExpiresAt "Access Token Expiry"
        TIMESTAMP refreshTokenExpiresAt "Refresh Token Expiry"
        TEXT scope "OAuth Scope"
        TEXT password "Password Hash (for 'email' provider)"
        TIMESTAMP createdAt "Creation Timestamp"
        TIMESTAMP updatedAt "Update Timestamp"
    }

    verification {
        TEXT id PK "Verification ID"
        TEXT identifier "Identifier (e.g., Email)"
        TEXT value "Verification Token/Code"
        TIMESTAMP expiresAt "Expiration Timestamp"
        TIMESTAMP createdAt "Creation Timestamp"
        TIMESTAMP updatedAt "Update Timestamp"
    }

    %% 용어 사전 애플리케이션 관련 테이블 정의
    glossary {
        TEXT id PK "Glossary ID (UUID)"
        TEXT userId FK "Foreign Key to user.id"
        TEXT name "Glossary Name"
        TEXT description "Glossary Description"
        BOOLEAN isPublic "Public Share Status"
        TIMESTAMP createdAt "Creation Timestamp"
        TIMESTAMP updatedAt "Update Timestamp"
    }

    term {
        TEXT id PK "Term ID (UUID)"
        TEXT glossaryId FK "Foreign Key to glossary.id"
        TEXT term "Term Name"
        TEXT definition "Term Definition"
        TIMESTAMP createdAt "Creation Timestamp"
        TIMESTAMP updatedAt "Update Timestamp"
    }

    %% 테이블 간의 관계 정의
    user ||--o{ session : has
    user ||--o{ account : has
    user ||--o{ glossary : owns
    glossary ||--o{ term : contains
```
