# 🌴 TropicalFit — Tropical Workout Tracker

A vibrant, dopamine-driven workout tracking PWA built for iPhone "Add to Home Screen."

## Features

- 🏋️ **Workout Tracking** — Log exercises, sets, weight, reps, RPE, notes, custom fields
- ⏱️ **Smart Timers** — Rest timers with Wake Lock + Programmatic Silent Audio for background support
- 🔥 **Streaks & XP** — Gamified leveling system to keep you motivated
- 🏆 **PR Detection** — Automatic personal record tracking with celebrations
- 📊 **Stats Dashboard** — Weekly charts, muscle heatmap, volume trends
- 🤖 **AI Coach** — Gemini 2.5 Flash powered evidence-based fitness advice
- 📎 **File Upload** — Upload old workout logs, AI parses them into your history
- 💬 **AI Chat** — Tap any stat to chat with AI about your progress
- 📦 **Export/Import** — JSON and CSV export, full data backup
- 📱 **PWA** — Works offline, installable on iPhone home screen

## Setup

1. Fork/clone this repo
2. Enable GitHub Pages (Settings → Pages → Source: main branch)
3. Visit `https://yourusername.github.io/workoutlog/`
4. On iPhone: Safari → Share → Add to Home Screen
5. Go to Settings → AI Setup → paste your free API key from [aistudio.google.com](https://aistudio.google.com)

## Tech Stack

- Vanilla HTML/CSS/JS (no frameworks)
- IndexedDB for local storage
- Gemini 2.5 Flash API for AI features
- Screen Wake Lock API + Programmatic Silent Audio for background timers
- Service Worker for offline support

## Data Privacy

All workout data is stored locally on your device. AI features require sending workout data to Google's Gemini API — only when you explicitly request analysis or chat.
