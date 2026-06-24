# 🇲🇺 SafeGuard MU — AI-Powered Drug Safety Platform for Mauritius

> An intelligent video analysis platform that helps identify substance-related risk behaviours, generate structured safety reports, and connect individuals with local support resources — built specifically for the Mauritian context.

---

## Overview

SafeGuard MU is a web-based application that leverages Google Gemini 2.5 Pro's native multimodal capabilities to analyse user-submitted videos for signs of substance use, self-harm, psychological distress, and unsafe behaviour. The platform generates immediate AI-powered risk assessments while maintaining a human validation layer where trained administrators review and verify every report.

The system is designed with **privacy at its core** — no video is ever stored. Files are processed in-memory, uploaded transiently to the Gemini File API, and deleted immediately after analysis. Only the generated report is retained.

---

## Key Features

### 🎥 Video Analysis Pipeline
- Browser-based video upload (MP4, MOV, WEBM — up to 100MB / 10 minutes)
- Native multimodal processing via Gemini 2.5 Pro (no frame extraction needed)
- Simultaneous visual and audio analysis — body language, speech, environment, tone
- Multilingual support: English, French, Mauritian Kreol

### 🧠 AI Risk Assessment
- Scene understanding and behavioural pattern recognition
- Sentiment analysis — emotional tone, distress signals, urgency classification
- Risk scoring (0–100) with categorical classification: `LOW` / `MEDIUM` / `HIGH` / `CRITICAL`
- Structured JSON report with actionable recommendations
- Local resource references (NDEA helpline 148, Caritas Mauritius, etc.)

### 🔒 Privacy-First Architecture
- Videos held in-memory only — never written to disk on the application server
- Transient upload to Gemini File API — deleted immediately after analysis response
- Only the generated report is persisted to the database
- Full audit trail maintained without any video retention

### 👨‍💼 Human Validation Layer (Admin Dashboard)
- Real-time notifications for every new submission via Supabase Realtime
- Review queue sorted by risk severity — `CRITICAL` surfaces first
- Admin can **Approve** (AI response confirmed valid) or **Flag** (AI response incorrect)
- Flag workflow: reason selection, risk level override, free-text correction notes
- Flagged submissions feed into a continuous model improvement pipeline

---

## System Architecture

```
Browser Upload
      ↓
Next.js API Route (in-memory, no disk)
      ↓
Gemini File API (transient — seconds only)
      ↓
Gemini 2.5 Pro Analysis (vision + audio)
      ↓
Structured Risk Report (JSON)
      ↓
Delete from Gemini File API ← immediate
      ↓
┌─────────────────────────────────┐
│        Supabase Database        │
│  Report saved (no video)        │
│  Status: PENDING_REVIEW         │
└─────────────────────────────────┘
      ↓
Admin Dashboard (Supabase Realtime)
      ↓
   APPROVED ──────── FLAGGED
      ↓                  ↓
 No change        Admin correction
                  + flag reason saved
```

---

## Report Structure

Every AI-generated report follows this schema:

```json
{
  "scene_summary": "Individual appears disoriented in a dimly lit room...",
  "sentiment": {
    "tone": "distressed",
    "urgency_level": "high",
    "emotional_indicators": ["confusion", "agitation", "slurred speech"]
  },
  "risk_assessment": {
    "risk_level": "HIGH",
    "risk_score": 82,
    "identified_concerns": [
      "possible substance intoxication",
      "isolation",
      "unsafe environment"
    ],
    "contributing_factors": ["body language", "speech patterns", "environment"]
  },
  "recommendations": [
    "Contact emergency services if the individual becomes unresponsive",
    "Reach out to the NDEA Mauritius helpline: 148",
    "Do not leave the individual alone"
  ]
}
```

---

## Submission Lifecycle

| Status | Meaning |
|---|---|
| `PENDING_REVIEW` | AI report generated, awaiting admin review |
| `APPROVED` | Admin confirmed AI response is accurate |
| `FLAGGED` | Admin identified inaccuracy — correction applied |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript |
| Backend | Next.js API Routes, Node.js |
| AI Model | Google Gemini 2.5 Pro (multimodal) |
| File Handling | Gemini File API (transient) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (role-based: user / admin) |
| ORM | Prisma |
| Styling | Tailwind CSS |

---

## Database Schema (Core)

```sql
submissions (
  id                    UUID PRIMARY KEY,
  created_at            TIMESTAMP,
  video_duration        INTEGER,              -- seconds, no video stored

  -- AI Output
  ai_scene_summary      TEXT,
  ai_sentiment          JSONB,
  ai_risk_level         TEXT,                -- LOW | MEDIUM | HIGH | CRITICAL
  ai_risk_score         INTEGER,             -- 0-100
  ai_recommendations    JSONB,
  ai_raw_response       JSONB,               -- full response for audit

  -- Human Validation
  status                TEXT DEFAULT 'PENDING_REVIEW',
  reviewed_by           UUID REFERENCES users(id),
  reviewed_at           TIMESTAMP,
  admin_notes           TEXT,
  flag_reason           TEXT,
  corrected_risk_level  TEXT,

  -- Submitter
  submitted_by          UUID REFERENCES users(id)
)
```

---

## Privacy & Ethics

- **No video storage** — the platform is architecturally incapable of retaining submitted videos
- **Consent** — users must acknowledge consent before upload
- **Disclaimer** — AI risk assessment is a support tool, not a clinical diagnosis. It does not replace professional medical or psychological judgement
- **Local expertise** — human validation by trained Mauritian administrators ensures cultural and contextual accuracy
- **Data residency** — all report data stored within Supabase; Gemini File API data deleted immediately post-analysis

---

## Mauritius-Specific Context

- Primary support reference: **NDEA Mauritius — Helpline 148**
- Secondary resources: Caritas Mauritius, Ministry of Health addiction services
- Multilingual analysis covering English, French, and Mauritian Kreol
- Risk thresholds and recommendations calibrated for the local social and healthcare landscape

---

## Roadmap

- [x] Core video upload and analysis pipeline
- [x] Structured AI risk report generation
- [x] Immediate video deletion post-analysis
- [x] Admin dashboard with real-time review queue
- [x] Flag and correction workflow
- [ ] User notification on admin correction
- [ ] Analytics dashboard (flag rate, risk distribution, response times)
- [ ] Kreol language support via prompt optimisation
- [ ] Mobile-responsive upload experience
- [ ] Integration with NDEA case management system (future)
- [ ] Fine-tuning pipeline using flagged + corrected submissions (future)

---

## Disclaimer

SafeGuard MU is an AI-assisted decision support tool. All risk assessments generated by this platform are intended to aid human judgement — not replace it. In any situation involving immediate danger, contact emergency services or the NDEA helpline directly.

**NDEA Mauritius Helpline: 148**

---

*Built for Mauritius. Designed with care.*