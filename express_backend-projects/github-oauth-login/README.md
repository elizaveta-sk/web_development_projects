# GitHub OAuth Login

An Express and Passport demo showing how a website can let a visitor sign in with their GitHub account.

## What it demonstrates

- GitHub OAuth with Passport
- Express sessions
- Protected account pages
- EJS server-rendered views

## Run locally

Create a GitHub OAuth application, then add these values to a `.env` file:

```text
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

Register `http://localhost:3000/auth/github/callback` as the OAuth callback URL. Then run:

```bash
npm install
npm start
```
