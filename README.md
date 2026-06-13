# 🛡️ ShieldCall AI SaaS Platform

ShieldCall AI is a production-ready, SaaS-grade cybersecurity and scam detection platform. It uses Speech Recognition, NLP Analysis, and Voice Telemetry to identify fraud, phishing attempts, authority impersonation, and AI deepfake clones in real time.

---

## 🏗️ Structure Overview

* `/client` - Next.js (App Router, Tailwind CSS, Framer Motion) frontend.
* `/server` - Node.js + Express.js + Socket.io backend.
* `docker-compose.yml` - Launches both containers concurrently.

---

## 🚀 Getting Started

ShieldCall AI is equipped with **dual-mode capability**. If you do not configure database URL or Gemini API keys, the platform automatically runs on local mock adapters (saving to client localStorage and calculating risk scores via backend NLP rule engines), making the application instantly ready for demonstration.

### Method 1: Docker Compose (Recommended)
Launch the entire monorepo in one command:
```bash
docker-compose up --build
```
* Frontend runs on: `http://localhost:3000`
* Backend runs on: `http://localhost:5000`

---

### Method 2: Local Execution

#### 1. Setup Backend Server
```bash
cd server
npm install
npm run dev
```
Server binds on `http://localhost:5000`.

#### 2. Setup Next.js Frontend
```bash
cd client
npm install
npm run dev
```
Client boots on `http://localhost:3000`. Open it in your browser.

---

## 🛠️ Features to Try

1. **Dashboard & Simulator:** Select a scam scenario (like OTP Fraud or AI Voice Clone) and click **"Test Link"**. Watch speech waveforms stream, real-time risk scores update, sentiment profiles change, and deepfake alarms trigger.
2. **SOS Panic Trigger:** Hit the SOS button, let the countdown elapse, and see GPS coordinates lock and alert SMS logs dispatch.
3. **Threat Intel Map:** Click regional hotspots on the SVG map to check local crime indexes, submit scam reports, and watch them cryptographically link to the visual blockchain ledger.
4. **Safety Academy:** Solve quizzes, earn XP, and unlock security achievement badges.
