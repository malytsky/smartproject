# Smart Project

A Pixi.js-powered web game built with Vite.

## Overview

Smart Project is a browser-based interactive game/application built with modern JavaScript tooling. It uses:

- [Pixi.js](https://pixijs.com/) for rendering
- [Vite](https://vite.dev/) for fast development and production builds
- [GSAP](https://gsap.com/) for animations
- `gh-pages` for deployment

## Features

- Fast local development with Vite
- Canvas-based rendering with Pixi.js
- Responsive layout support
- Production build output in `dist/`
- Easy deployment to GitHub Pages

## Requirements

- Node.js
- npm

## Installation

Clone the repository and install dependencies:
```
bash
npm install
```
## Development

Start the local development server:
```
bash
npm run dev
```
## Build

Create a production build:
```
bash
npm run build
```
## Preview the Production Build

Run a local preview of the built app:
```
bash
npm run preview
```
## Deployment

Publish the `dist` folder to GitHub Pages:
```
bash
npm run deploy
```
## Project Structure
```
text
src/        Application source code
public/     Static assets
dist/       Production build output
index.html  Main HTML entry point
```
## Notes

- The app is configured as a Vite project.
- Static assets can be placed in `public/assets/`.
- Build output is generated in `dist/`.