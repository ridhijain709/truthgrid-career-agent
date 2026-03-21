# TruthGrid Career Agent UI

A Next.js 14+ application for the TruthGrid career assessment platform. This provides a comprehensive dashboard for Indian university students to view their AI-generated TruthID scores and career insights.

## Features

- **Student Dashboard**: View TruthID scores and skill breakdowns
- **AI Tutor**: Interactive chat for career guidance
- **Weekly Reports**: Class performance analytics
- **Assessment Submission**: Multi-step form for skill evaluation
- **Employer View**: Anonymized candidate profiles
- **Admin Analytics**: System-wide performance metrics

## TruthID Scoring System

Students receive a score from 0-10,000 based on five key dimensions:
- Priority Ability (30%)
- Technical Skills (20%)
- Execution Speed (20%)
- Learnability (15%)
- Soft Skills (15%)

## Signal Status

- **HEALTHY**: LGS > 70, no downtrend
- **WATCH**: LGS 50-70 or slight downtrend  
- **COLLAPSE**: LGS < 50 or major downtrend
- **RECOVERY**: Was in COLLAPSE, now improving

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Tech Stack

- Next.js 14+
- React 18
- TypeScript
- Tailwind CSS
- Recharts
- Lucide Icons

## Project Structure

```
src/
  app/              # Next.js App Router pages
  components/       # Reusable UI components
  context/          # React Context providers
  hooks/            # Custom React hooks
  lib/              # Utilities and configurations
  types/            # TypeScript type definitions
```