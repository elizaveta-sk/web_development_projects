# Jammming

A React app that lets a Spotify user search for music, assemble a playlist, and save it to their own Spotify account.

## What it does

- Provides a **Connect Spotify** button for secure sign-in.
- Searches Spotify's music catalogue by artist, song, album, or keyword.
- Lets the user add and remove tracks while building a playlist.
- Creates the finished public playlist in the signed-in user's Spotify account.

The app uses Spotify's secure Authorization Code with PKCE sign-in flow. It never asks the user to enter their Spotify password into this app: Spotify handles that on its own sign-in page, then returns the user to Jammming after permission is granted.

## Live site

[View the live deployment on Netlify](https://ubiquitous-cobbler-69da27.netlify.app)

## Run locally

```bash
npm install
npm start
```

## Spotify configuration

The app uses Spotify's Authorization Code with PKCE flow. In Spotify Developer Dashboard, register both exact redirect URLs:

```text
https://ubiquitous-cobbler-69da27.netlify.app
http://127.0.0.1:3000
```
