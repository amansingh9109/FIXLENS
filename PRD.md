# FixLens — Project Requirements Document

**Product Name:** FixLens  
**Product Type:** Multimodal AI Troubleshooting & Repair Assistant  
**Primary AI:** Gemma 4  
**Primary Interface:** Responsive Web Application  
**Project Type:** Open-Source AI / Hackathon Project  
**Document Version:** 1.0  
**Status:** MVP Requirements

---

# 1. Product Overview

FixLens is an AI-powered visual troubleshooting assistant that helps users investigate problems with physical objects.

A user can upload a photo of an object and explain the problem in normal language.

For example:

> “My bicycle chain keeps falling when I change gears.”

FixLens analyzes both the image and text using Gemma 4.

Instead of immediately guessing a solution, FixLens follows an investigation process:

**SEE → INVESTIGATE → REASON → GUIDE → VERIFY**

The system:

1. understands the uploaded image,
2. identifies the object or component,
3. records visible observations,
4. generates possible causes,
5. checks for safety risks,
6. asks for additional evidence when necessary,
7. creates troubleshooting steps,
8. guides the user through those steps,
9. asks for final evidence,
10. compares before and after evidence,
11. generates a repair summary.

The main goal is not to create another AI chatbot.

FixLens should behave like a **visual troubleshooting investigator**.

---

# 2. Problem Statement

People regularly encounter problems with:

- bicycles,
- computers,
- furniture,
- appliances,
- electronics,
- mechanical equipment,
- household objects.

However, most users do not know the technical terminology required to search for solutions.

For example, a user may know:

> “My bicycle chain keeps falling.”

But they may not know:

> “The rear derailleur indexing may be incorrect.”

Searching the internet becomes difficult when the user does not know what the component or problem is called.

Existing AI systems can analyze images, but many simply follow:

```text id="yt9tca"
IMAGE
  ↓
AI
  ↓
ANSWER
```

This creates several problems.

The AI may not have enough evidence.

It may misunderstand the image.

It may present a possible cause as a fact.

It may recommend unsafe actions.

It usually does not verify whether the suggested action actually improved the problem.

FixLens solves these problems through an evidence-based troubleshooting workflow.

---

# 3. Product Vision

The long-term vision of FixLens is:

> **Make troubleshooting as easy as showing someone what went wrong.**

Users should not need technical knowledge before asking for help.

Instead of searching:

> “Shimano rear derailleur indexing adjustment”

a user should simply be able to say:

> “My cycle chain keeps falling.”

FixLens should understand the context and guide the investigation.

---

# 4. Product Tagline

> **Show the problem. Find the cause. Fix it. Verify it.**

Alternative technical description:

> **Visual troubleshooting powered by multimodal AI.**

---

# 5. Primary Goal

The primary goal of FixLens is to create a multimodal AI system capable of performing an interactive troubleshooting investigation.

The core workflow must be:

```text id="o5d17j"
IMAGE
   +
DESCRIPTION
   ↓
VISUAL ANALYSIS
   ↓
OBSERVATIONS
   ↓
POSSIBLE CAUSES
   ↓
SAFETY CHECK
   ↓
MORE EVIDENCE?
   ↓
YES ─────────────── NO
 ↓                   ↓
REQUEST IMAGE     TROUBLESHOOT
 ↓                   ↓
NEW EVIDENCE      USER ACTION
 └──────────┬────────┘
            ↓
      FINAL EVIDENCE
            ↓
        VERIFICATION
            ↓
       FINAL REPORT
```

---

# 6. MVP Scope

The MVP must demonstrate one complete troubleshooting journey.

The system must support:

- image upload,
- text problem description,
- multimodal Gemma analysis,
- object identification,
- visual observations,
- possible causes,
- confidence information,
- safety classification,
- additional evidence requests,
- evidence timeline,
- troubleshooting steps,
- step completion,
- final image upload,
- before/after comparison,
- repair verification,
- final repair summary.

---

# 7. MVP Supported Categories

The first version should focus on a limited number of categories.

## Primary Category

### Bicycle Troubleshooting

This should be the strongest and most thoroughly tested category.

Example problems:

- chain falling,
- loose chain,
- derailleur alignment,
- visible brake problems,
- loose components,
- tire-related visible problems.

---

## Secondary Categories

### Computers

Examples:

- disconnected cables,
- visible hardware problems,
- error screens,
- loose components.

### Furniture

Examples:

- loose joints,
- missing screws,
- visible cracks,
- misalignment.

### Small Appliances

Only safe visual inspection should be supported.

Potential electrical hazards must cause the safety system to limit or stop DIY guidance.

---

# 8. Out of Scope for MVP

The following should NOT be built during the initial MVP:

- native Android application,
- native iOS application,
- real-time video analysis,
- audio-based mechanical diagnosis,
- marketplace,
- technician booking,
- payments,
- social network,
- repair parts marketplace,
- advanced IoT integration,
- hundreds of repair categories,
- fully autonomous repair instructions,
- complicated multi-agent framework.

These features can be considered later.

---

# 9. Target Users

## Primary User

A normal person experiencing a problem with a physical object.

The user:

- may not know technical terminology,
- may not understand repair manuals,
- may not know which component is faulty,
- can take photographs,
- can describe the problem in simple language.

---

# 10. Main User Story

> As a user, I want to upload a picture of something that is not working correctly and describe the problem in normal language so that FixLens can investigate the issue and guide me through safe troubleshooting.

---

# 11. Secondary User Stories

### Upload Evidence

> As a user, I want to upload an image so FixLens can visually inspect the object.

### Describe Problem

> As a user, I want to describe the problem using normal language without needing technical terminology.

### Understand Observations

> As a user, I want to know what FixLens can actually observe in my image.

### Understand Possible Causes

> As a user, I want to see possible explanations without them being presented as guaranteed facts.

### Additional Evidence

> As a user, I want FixLens to tell me exactly what additional photo it needs.

### Safety

> As a user, I want FixLens to warn me when troubleshooting may be unsafe.

### Repair Guidance

> As a user, I want simple step-by-step troubleshooting instructions.

### Verification

> As a user, I want to upload a final photo so FixLens can compare the visible condition before and after my actions.

### History

> As a user, I want to see the evidence collected during my troubleshooting session.

---

# 12. Complete User Journey

## Step 1 — Open FixLens

The user opens the website.

The landing page displays:

**What are you trying to fix?**

The user sees:

- image upload,
- camera option where supported,
- description field,
- Start Investigation button.

---

# 13. Step 2 — Upload Initial Evidence

The user uploads an image.

Supported formats:

- JPEG,
- JPG,
- PNG,
- WebP.

Recommended maximum size:

**10 MB per image.**

The frontend must validate the file before uploading.

Invalid file types should be rejected.

---

# 14. Step 3 — Problem Description

The user enters a description.

Example:

> “My bicycle chain keeps falling when I change gears.”

Recommended minimum:

10 characters.

Recommended maximum:

2,000 characters.

---

# 15. Step 4 — Create Repair Session

When the user clicks:

**Start Investigation**

the backend creates a repair session.

Example:

```text id="83f0i2"
Session ID:

FL-2026-00124
```

The session stores:

- creation date,
- user description,
- uploaded evidence,
- current investigation state,
- AI observations,
- hypotheses,
- safety status,
- troubleshooting steps,
- verification result.

---

# 16. Step 5 — Gemma Analysis

The backend sends the following context to Gemma:

- image,
- user description,
- previous evidence if available,
- system instructions,
- safety rules.

Gemma should return structured data.

---

# 17. Object Identification

FixLens should attempt to identify:

- object,
- category,
- component if visible,
- confidence.

Example:

```text id="rlgt0v"
Object:

Bicycle

Component:

Rear drivetrain

Confidence:

94%
```

---

# 18. Observations

Observations must describe only what appears visible from the supplied evidence.

Example:

> “The chain appears to have more slack than expected.”

Avoid:

> “Your derailleur is broken.”

unless sufficient evidence supports such a statement.

Each observation should contain:

```text id="xjjz9q"
Description

Confidence

Evidence Reference
```

---

# 19. Hypotheses

A hypothesis represents a possible explanation.

Example:

```text id="vh0cnf"
Possible Cause

Derailleur adjustment issue

Confidence

68%
```

Hypotheses must clearly be displayed as:

**Possible Causes**

and not:

**Confirmed Problems**

unless a reliable confirmation mechanism exists.

---

# 20. Confidence System

Confidence should use a value from:

```text id="bcupse"
0.00 → 1.00
```

Frontend representation:

```text id="2d1i2h"
0.94

↓

94%
```

Suggested categories:

```text id="ipxizd"
90–100% → High

70–89% → Medium

Below 70% → Low
```

Confidence should be used carefully and should not be presented as a calibrated probability unless the system has actually been calibrated.

---

# 21. Safety Classification

Every investigation must receive a safety classification before repair guidance.

Safety states:

```text id="70k4hr"
LOW

MEDIUM

HIGH

UNKNOWN
```

---

# 22. Low Risk

Examples:

- simple bicycle adjustment,
- furniture,
- loose screw,
- non-powered mechanical components.

The system can normally continue troubleshooting.

UI:

```text id="8hv9i3"
🟢 LOW RISK

Guided troubleshooting available.
```

---

# 23. Medium Risk

Examples:

- computer internals,
- electronic components,
- certain appliances.

UI:

```text id="5v6u0w"
🟡 CAUTION

Additional safety precautions
are required.
```

Instructions should be limited appropriately.

---

# 24. High Risk

Examples:

- exposed mains electricity,
- gas-related equipment,
- fire damage,
- swollen/damaged batteries,
- severe structural damage.

FixLens should stop DIY repair instructions.

Example:

```text id="8tr7t4"
🔴 HIGH-RISK CONDITION

FixLens cannot safely guide this repair.

Stop troubleshooting and contact
a qualified professional.
```

---

# 25. Unknown Risk

When FixLens cannot determine safety from the available evidence:

```text id="7q5qzx"
⚪ SAFETY UNKNOWN

More information is required before
troubleshooting can continue.
```

---

# 26. Evidence Request System

If the AI does not have enough information, it should request more evidence instead of guessing.

Example:

```text id="79b67i"
Additional Evidence Required

Please upload a close-up image
of the rear derailleur.

Recommended angle:

Side view

Make sure these are visible:

• chain
• derailleur
• cassette
```

---

# 27. Evidence Request Data

Each request should contain:

```text id="r5njmx"
Evidence Type

Instruction

Reason

Recommended Angle

Required Components

Priority
```

Example:

```json id="rf1w4u"
{
  "type": "image",
  "instruction": "Take a close-up photo of the rear derailleur.",
  "reason": "The current image does not clearly show derailleur alignment.",
  "recommended_angle": "side",
  "required_components": [
    "chain",
    "derailleur",
    "cassette"
  ],
  "priority": "high"
}
```

---

# 28. Evidence Timeline

FixLens must maintain an investigation timeline.

Example:

```text id="0jz8j3"
Problem Reported
      ↓
Initial Image
      ↓
Initial Analysis
      ↓
Additional Evidence Requested
      ↓
New Image Uploaded
      ↓
Investigation Updated
      ↓
Troubleshooting Started
      ↓
Action Completed
      ↓
Final Evidence
      ↓
Verification
```

Every important event should contain:

- ID,
- timestamp,
- type,
- description,
- associated evidence.

---

# 29. Troubleshooting Planner

When sufficient evidence exists and safety allows it, FixLens creates troubleshooting steps.

Instructions should be:

- simple,
- short,
- safe,
- sequential,
- understandable,
- reversible where possible.

FixLens should prefer the **least risky useful check first**.

---

# 30. Troubleshooting Step Format

Each step should contain:

```text id="85qbt4"
Step Number

Title

Instruction

Reason

Safety Warning

Expected Result

Status
```

Example:

```text id="s6x3we"
STEP 1

Inspect Chain Position

Check whether the chain is correctly
sitting on the cassette.

Why?

This helps determine whether the problem
comes from chain positioning.

[ Mark Completed ]
```

---

# 31. Step Status

Possible values:

```text id="57d60c"
PENDING

IN_PROGRESS

COMPLETED

SKIPPED

BLOCKED
```

---

# 32. User Feedback After Step

After completing a step, the user should be able to provide:

```text id="b29dms"
✓ Completed

Didn't work

Problem improved

Problem became worse

I can't perform this step
```

This information becomes additional evidence.

---

# 33. Verification System

After troubleshooting, FixLens should ask the user for final evidence.

Example:

> “Upload a new image showing the repaired area.”

The verifier receives:

```text id="fqdb3r"
Initial Evidence
+
Final Evidence
+
Original Observations
+
Repair Actions
```

---

# 34. Verification Results

Allowed results:

```text id="d14d1e"
LIKELY_RESOLVED

IMPROVED

UNCHANGED

WORSE

UNCERTAIN
```

---

# 35. Verification Example

```text id="xq8i0j"
REPAIR VERIFICATION

Before

⚠ Chain appeared loose
⚠ Alignment appeared unusual


After

✓ Chain position appears improved
✓ Alignment appears improved


RESULT

LIKELY IMPROVED

Confidence

84%
```

The system must avoid guaranteeing that a device is safe or fully repaired based only on images.

---

# 36. Final Repair Report

After verification, FixLens generates a final report.

Report fields:

```text id="yzj20c"
Session ID

Object

Original Problem

Initial Observations

Possible Causes

Evidence Collected

Actions Performed

Verification Result

Remaining Concerns

Safety Notes

Date
```

---

# 37. Main Application Pages

The MVP should contain the following pages.

### Landing Page

Route:

```text id="rbvqbm"
/ 
```

Purpose:

Explain FixLens and start troubleshooting.

---

### New Investigation

```text id="a7owbr"
/investigate
```

Contains:

- image upload,
- description,
- Start Investigation.

---

### Investigation Workspace

```text id="75c45d"
/session/[id]
```

This is the main application screen.

Contains:

- uploaded image,
- detected object,
- observations,
- possible causes,
- safety status,
- evidence requests,
- timeline,
- troubleshooting steps.

---

### Verification

```text id="h9e8xf"
/session/[id]/verify
```

Contains:

- before image,
- final image upload,
- comparison,
- verification result.

---

### Report

```text id="73v6pp"
/session/[id]/report
```

Displays the final repair report.

---

# 38. Frontend Requirements

Frontend stack:

```text id="o8woyl"
Next.js
TypeScript
Tailwind CSS
shadcn/ui
```

Requirements:

- responsive design,
- mobile friendly,
- desktop friendly,
- accessible buttons,
- clear typography,
- image previews,
- loading indicators,
- clear AI processing states,
- error messages,
- empty states,
- retry support.

---

# 39. UI Design Direction

FixLens should feel:

- modern,
- technical,
- clean,
- trustworthy,
- minimal,
- easy for non-technical users.

Avoid making the interface look like a generic chatbot.

The main interface should look like an **investigation workspace**.

---

# 40. Important UI Components

Create reusable components such as:

```text id="3tf0ap"
ImageUploader

ProblemDescription

AnalysisCard

ObservationCard

HypothesisCard

ConfidenceIndicator

SafetyBadge

EvidenceRequestCard

EvidenceTimeline

RepairStep

VerificationComparison

RepairReport

LoadingAnalysis

ErrorState
```

---

# 41. Backend Requirements

Backend stack:

```text id="v4b3o1"
Python
FastAPI
Pydantic
SQLAlchemy
```

Backend responsibilities:

- API handling,
- validation,
- session management,
- image metadata management,
- Gemma integration,
- AI orchestration,
- safety rules,
- database operations,
- RAG retrieval,
- verification,
- error handling,
- logging.

---

# 42. API Architecture

API base:

```text id="p65vgv"
/api/v1
```

---

# 43. Create Session

```text id="2wyq0g"
POST /api/v1/sessions
```

Request:

```json id="8q8hd4"
{
  "description": "My bicycle chain keeps falling."
}
```

Response:

```json id="kklrvu"
{
  "session_id": "uuid",
  "status": "created"
}
```

---

# 44. Upload Evidence

```text id="4pabsh"
POST /api/v1/sessions/{session_id}/evidence
```

Input:

```text id="nywkmd"
multipart/form-data
```

Fields:

```text id="uz0l84"
file

description

evidence_type
```

---

# 45. Analyze Session

```text id="zzb6dp"
POST /api/v1/sessions/{session_id}/analyze
```

The backend:

1. loads session,
2. loads evidence,
3. performs safety checks,
4. sends relevant context to Gemma,
5. validates structured response,
6. stores analysis,
7. returns results.

---

# 46. Get Session

```text id="jrg4hn"
GET /api/v1/sessions/{session_id}
```

Returns the complete current investigation.

---

# 47. Complete Action

```text id="t9pkj6"
POST /api/v1/sessions/{session_id}/actions/{action_id}/complete
```

Stores user feedback and updates the investigation.

---

# 48. Verify Session

```text id="hnzw8p"
POST /api/v1/sessions/{session_id}/verify
```

Runs before/after comparison.

---

# 49. Generate Report

```text id="m0y29f"
GET /api/v1/sessions/{session_id}/report
```

Returns the final investigation summary.

---

# 50. Database

Recommended:

**PostgreSQL**

Use:

**SQLAlchemy ORM**

Database migrations:

**Alembic**

---

# 51. Core Database Tables

The MVP should contain approximately these tables:

```text id="2duz27"
users

repair_sessions

evidence

analyses

observations

hypotheses

evidence_requests

repair_steps

step_feedback

verification_results

safety_assessments
```

Authentication can be optional during the earliest prototype.

---

# 52. Repair Sessions Table

Important fields:

```text id="1op3ex"
id

user_id

description

object_category

status

risk_level

created_at

updated_at
```

---

# 53. Evidence Table

Fields:

```text id="oy6e8e"
id

session_id

type

file_url

description

stage

created_at
```

Possible stages:

```text id="ptc1cd"
INITIAL

INVESTIGATION

REPAIR

VERIFICATION
```

---

# 54. Observations Table

Fields:

```text id="x85f0g"
id

session_id

evidence_id

description

confidence

created_at
```

---

# 55. Hypotheses Table

Fields:

```text id="4idn6p"
id

session_id

cause

confidence

status

created_at
```

Status:

```text id="12pvy1"
POSSIBLE

SUPPORTED

WEAKENED

REJECTED
```

---

# 56. AI Architecture

The AI system should logically contain:

```text id="a6stbm"
AI ORCHESTRATOR

      │

      ├── Investigator
      │
      ├── Safety Engine
      │
      ├── Retrieval
      │
      ├── Repair Planner
      │
      └── Verifier
```

These do not need to be separate model instances.

For the MVP, multiple responsibilities may share Gemma calls where doing so reduces latency and complexity.

---

# 57. Investigator Responsibilities

The Investigator analyzes:

```text id="k1dtv9"
Images

User Description

Previous Evidence

Previous Observations
```

It produces:

```text id="tvk73o"
Object

Component

Observations

Hypotheses

Missing Evidence

Next Recommended State
```

---

# 58. Safety Engine Responsibilities

The safety system evaluates:

- detected object,
- problem description,
- visual observations,
- proposed repair action.

It returns:

```text id="kt94y1"
risk_level

reason

allowed_actions

blocked_actions

warning
```

Safety must use both model reasoning and deterministic application rules for clearly dangerous categories.

---

# 59. Planner Responsibilities

The Repair Planner determines:

> What is the safest useful thing the user should check next?

It should avoid providing many complicated actions simultaneously.

Preferred:

```text id="ptk23y"
STEP 1
↓
USER RESPONSE
↓
STEP 2
```

instead of:

```text id="fg8m6v"
20 repair steps at once
```

---

# 60. Verifier Responsibilities

The verifier compares:

```text id="x2ltx3"
BEFORE EVIDENCE

AFTER EVIDENCE

ORIGINAL OBSERVATIONS

ACTIONS PERFORMED
```

and produces:

```text id="3umc7q"
result

visible_changes

remaining_concerns

confidence

next_recommendation
```

---

# 61. Structured AI Response

All important Gemma responses must use structured JSON.

Example:

```json id="ayxtkj"
{
  "object": {
    "name": "bicycle",
    "component": "rear drivetrain",
    "confidence": 0.94
  },

  "observations": [
    {
      "description": "Chain appears loose",
      "confidence": 0.82
    }
  ],

  "hypotheses": [
    {
      "cause": "Derailleur adjustment issue",
      "confidence": 0.68
    }
  ],

  "safety": {
    "level": "low",
    "reason": "No obvious high-risk condition is visible."
  },

  "evidence_required": [
    {
      "type": "image",
      "instruction": "Upload a side-view image of the rear derailleur.",
      "reason": "Current evidence does not clearly show derailleur alignment."
    }
  ],

  "next_action": "collect_evidence"
}
```

---

# 62. Pydantic Validation

Every AI response must be validated using Pydantic.

Example models:

```text id="5a2brm"
ObjectDetection

Observation

Hypothesis

SafetyAssessment

EvidenceRequest

RepairStep

VerificationResult

InvestigationResponse
```

If Gemma returns invalid data:

```text id="ijy2zy"
Gemma
 ↓
Invalid JSON
 ↓
Validation failure
 ↓
Controlled retry / repair
 ↓
Validation
```

Do not directly expose malformed AI output to users.

---

# 63. RAG Requirements

RAG should be implemented after the core multimodal workflow works.

Recommended technologies:

```text id="hwnmbu"
Sentence Transformers

Qdrant
```

Pipeline:

```text id="1fj3ru"
Documents
   ↓
Text extraction
   ↓
Chunking
   ↓
Embeddings
   ↓
Qdrant
```

Query:

```text id="dnwtd9"
User Problem
   ↓
Query Embedding
   ↓
Qdrant Search
   ↓
Relevant Documents
   ↓
Gemma Context
```

---

# 64. Knowledge Sources

Only use documentation that the project has permission to process and redistribute/use appropriately.

Potential sources include:

- open repair documentation,
- openly licensed maintenance guides,
- project-created troubleshooting documentation,
- permitted manufacturer documentation.

The system should preserve source metadata so retrieved information can later be attributed.

---

# 65. Image Storage

Images should not be stored directly in PostgreSQL.

Use object storage.

Possible solutions:

```text id="6o0kvl"
Cloudinary

Amazon S3

S3-compatible storage
```

Database stores only metadata and storage references.

---

# 66. Image Processing

Before AI processing:

```text id="wlf9uv"
Validate MIME type
      ↓
Validate file size
      ↓
Decode image safely
      ↓
Check dimensions
      ↓
Correct orientation if necessary
      ↓
Resize/compress if required
      ↓
Send approved representation to AI
```

The backend must not trust file extensions alone.

---

# 67. Error Handling

The application must handle:

### Invalid image

> “We couldn't process this image. Try another photo.”

### Image too large

> “Image must be smaller than 10 MB.”

### AI failure

> “FixLens couldn't complete the analysis. Please retry.”

### Poor image quality

> “The image isn't clear enough. Please take another photo with better lighting.”

### Unknown object

> “FixLens couldn't confidently identify this object.”

### Network failure

Allow retry without losing the entire repair session.

---

# 68. Loading States

AI operations can take time.

Show clear states such as:

```text id="6sv39i"
Uploading image...

Inspecting image...

Analyzing evidence...

Checking safety...

Preparing next step...

Comparing before and after...
```

Avoid leaving users with a blank loading spinner and no explanation.

---

# 69. Security Requirements

At minimum:

- validate uploads,
- limit file sizes,
- validate MIME types,
- sanitize text input,
- keep API keys server-side,
- never expose Gemini credentials to the browser,
- use environment variables,
- configure CORS correctly,
- add API rate limits,
- avoid logging secrets,
- validate identifiers,
- use parameterized ORM queries,
- secure object-storage access where appropriate.

---

# 70. Environment Variables

Example:

```text id="zqgcfj"
GEMINI_API_KEY=

DATABASE_URL=

QDRANT_URL=

QDRANT_API_KEY=

STORAGE_URL=

STORAGE_KEY=

STORAGE_SECRET=

APP_ENV=

FRONTEND_URL=
```

Create:

```text id="4bbrav"
.env.example
```

Never commit real secrets.

---

# 71. Privacy Requirements

Images may contain personal information or private surroundings.

The application should clearly explain:

- why images are collected,
- how they are processed,
- whether they are stored,
- how long they are retained,
- how users can remove stored sessions when accounts/history are implemented.

Avoid collecting unnecessary information.

---

# 72. Logging

Backend logs should include:

```text id="u97jfr"
request_id

timestamp

route

status

processing_time

AI operation

AI latency

error category
```

Do NOT log:

```text id="75lt86"
API keys

passwords

authentication tokens

full sensitive user content unnecessarily
```

---

# 73. Testing Requirements

Testing should include:

### Unit Tests

Test:

- schemas,
- validators,
- safety rules,
- helper functions,
- confidence formatting.

### API Tests

Test:

```text id="vhkhn2"
Create Session

Upload Evidence

Analyze

Complete Step

Verify

Generate Report
```

### AI Evaluation

Create a small evaluation dataset.

Example:

```text id="7r7n7y"
tests/evaluation/

bicycle/
    case_001/
    case_002/

computer/
    case_001/

furniture/
    case_001/
```

Each case can contain:

- image,
- problem description,
- expected object category,
- important observations,
- expected risk range,
- desired evidence request.

---

# 74. AI Evaluation Metrics

Measure:

### Object Recognition

Did FixLens identify the correct general object/component?

### Observation Grounding

Are observations actually supported by the image?

### Hallucination Rate

Did the model claim things that were not visible or otherwise supported?

### Evidence Request Quality

Did it ask for useful additional evidence?

### Safety Accuracy

Did high-risk examples trigger appropriate warnings?

### Troubleshooting Quality

Were steps understandable and relevant?

### Verification Quality

Did the before/after conclusion match the available evidence?

---

# 75. Performance Requirements

Suggested MVP targets:

Normal API request:

**< 1 second excluding AI/storage processing**

AI investigation:

Target approximately:

**< 10 seconds when practical**

Image upload:

Show immediate upload progress.

The UI should remain responsive while AI processing occurs.

---

# 76. Accessibility

The frontend should:

- support keyboard navigation,
- use semantic HTML,
- include image alt text where appropriate,
- use readable font sizes,
- maintain sufficient contrast,
- provide visible focus states,
- avoid communicating risk using color alone.

For example:

Do not show only:

🔴

Also show:

**HIGH RISK**

---

# 77. Responsive Design

Primary screen sizes:

### Mobile

```text id="q8blpf"
360px+
```

### Tablet

```text id="8ou5kg"
768px+
```

### Desktop

```text id="yl6aln"
1024px+
```

Photo upload should be especially easy on mobile because users may take photos directly from their phones.

---

# 78. Repository Structure

Recommended structure:

```text id="v1knlw"
fixlens/
│
├── apps/
│   ├── web/
│   └── api/
│
├── ai/
│   ├── agents/
│   ├── prompts/
│   ├── schemas/
│   └── evaluation/
│
├── rag/
│   ├── ingestion/
│   ├── embeddings/
│   ├── retrieval/
│   └── datasets/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── evaluation/
│
├── docs/
│   ├── architecture.md
│   ├── safety.md
│   ├── api.md
│   └── contributing.md
│
├── scripts/
│
├── docker/
│
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── .env.example
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
└── LICENSE
```

---

# 79. Git Strategy

Recommended branches:

```text id="jv7ch8"
main

develop

feature/frontend

feature/backend

feature/gemma

feature/safety

feature/verification

feature/rag
```

Pull requests should be used before merging important features into the main branch.

---

# 80. CI/CD

GitHub Actions should eventually run:

```text id="z5mznv"
Install dependencies
        ↓
Lint
        ↓
Type check
        ↓
Unit tests
        ↓
Backend tests
        ↓
Build frontend
```

Only deploy after required checks pass.

---

# 81. Docker

Provide containers for:

```text id="hdd74u"
Frontend

Backend

PostgreSQL

Qdrant
```

Development should eventually support:

```text id="0av4he"
docker compose up
```

for starting the required local services.

---

# 82. Deployment Architecture

Recommended architecture:

```text id="ufxbuv"
              INTERNET

                  │

                  ▼

          Next.js Frontend
              Vercel

                  │

                  ▼

            FastAPI API

                  │

        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼

     Gemma    PostgreSQL   Qdrant

                  │

                  ▼

             Image Storage
```

---

# 83. Open-Source Requirements

Because FixLens is intended as an open-source project, the repository should contain:

```text id="u8apdi"
README.md

LICENSE

CONTRIBUTING.md

CODE_OF_CONDUCT.md

SECURITY.md

.env.example
```

Choose the license based on the project's desired contribution and redistribution model.

For many hackathon/open-source projects, Apache-2.0 is worth considering.

---

# 84. README Requirements

README should contain:

1. FixLens logo/name.
2. Tagline.
3. Problem.
4. Solution.
5. Demo.
6. Screenshots.
7. Features.
8. Architecture.
9. Gemma usage.
10. Technology stack.
11. Installation.
12. Environment variables.
13. Running locally.
14. API overview.
15. Safety approach.
16. Evaluation.
17. Roadmap.
18. Contributing.
19. License.

---

# 85. MVP Acceptance Criteria

The MVP is considered successful when a user can complete this flow:

```text id="g3mkt9"
OPEN FIXLENS

      ↓

UPLOAD BICYCLE IMAGE

      ↓

ENTER

"My bicycle chain keeps falling"

      ↓

START INVESTIGATION

      ↓

GEMMA IDENTIFIES BICYCLE

      ↓

VISIBLE OBSERVATIONS DISPLAYED

      ↓

POSSIBLE CAUSES DISPLAYED

      ↓

SAFETY LEVEL DISPLAYED

      ↓

FIXLENS REQUESTS
ADDITIONAL IMAGE

      ↓

USER UPLOADS IMAGE

      ↓

INVESTIGATION UPDATES

      ↓

FIXLENS PROVIDES
TROUBLESHOOTING STEP

      ↓

USER COMPLETES STEP

      ↓

USER UPLOADS
FINAL IMAGE

      ↓

FIXLENS COMPARES
BEFORE + AFTER

      ↓

VERIFICATION RESULT

      ↓

FINAL REPAIR REPORT
```

If this entire flow works reliably, the core MVP is complete.

---

# 86. Development Priority

Use the following priority system.

## P0 — Must Have

- frontend,
- FastAPI,
- image upload,
- problem description,
- Gemma multimodal integration,
- structured responses,
- observations,
- hypotheses,
- safety classification,
- evidence request,
- troubleshooting,
- verification.

## P1 — Important

- PostgreSQL,
- evidence timeline,
- repair reports,
- error handling,
- automated testing,
- Docker,
- improved safety rules.

## P2 — Nice to Have

- authentication,
- RAG,
- multilingual interface,
- history dashboard,
- PDF reports,
- advanced analytics.

## P3 — Future

- native mobile app,
- video,
- audio,
- AR repair instructions,
- technician marketplace,
- IoT integration.

---

# 87. Recommended Build Order

Do not build every subsystem simultaneously.

Build in this order:

```text id="rz3nz1"
1. Repository
      ↓
2. Next.js
      ↓
3. FastAPI
      ↓
4. Image Upload
      ↓
5. Gemma Integration
      ↓
6. Structured Output
      ↓
7. Investigation UI
      ↓
8. Safety Engine
      ↓
9. Evidence Requests
      ↓
10. Session State
      ↓
11. Troubleshooting Planner
      ↓
12. Verification
      ↓
13. Database
      ↓
14. Tests
      ↓
15. RAG
      ↓
16. Docker
      ↓
17. Deployment
      ↓
18. Hackathon Polish
```

---

# 88. First Technical Milestone

Before authentication, dashboards, RAG or advanced deployment, the development team must make this work:

```text id="umtr1r"
IMAGE
+
TEXT

 ↓

GEMMA 4

 ↓

STRUCTURED JSON

 ↓

OBJECT

OBSERVATIONS

HYPOTHESES

SAFETY

EVIDENCE REQUEST
```

This proves that the central FixLens concept works.

---

# 89. Second Technical Milestone

Implement:

```text id="5y6nwi"
INITIAL IMAGE
      ↓
ANALYSIS
      ↓
REQUEST NEW IMAGE
      ↓
NEW IMAGE
      ↓
UPDATED ANALYSIS
```

This proves the investigation loop.

---

# 90. Third Technical Milestone

Implement:

```text id="8q91bh"
BEFORE IMAGE
      +
AFTER IMAGE
      ↓
GEMMA
      ↓
VISIBLE CHANGE ANALYSIS
      ↓
VERIFICATION RESULT
```

This proves the verification concept.

---

# 91. Hackathon Success Criteria

The project should demonstrate that Gemma is not simply being used to generate text.

The demo should clearly show Gemma performing:

```text id="0hdq65"
VISUAL UNDERSTANDING

        +

TEXT UNDERSTANDING

        +

EVIDENCE REASONING

        +

FOLLOW-UP REQUESTS

        +

TROUBLESHOOTING PLANNING

        +

VISUAL VERIFICATION
```

This makes multimodal AI fundamental to the product.

---

# 92. Main Product Differentiator

The key difference between FixLens and a normal AI assistant is:

### Normal AI

```text id="n62hnc"
Image
 ↓
Answer
```

### FixLens

```text id="7w5htx"
Image
 ↓
Observe
 ↓
Create Hypotheses
 ↓
Check Safety
 ↓
Request Evidence
 ↓
Analyze New Evidence
 ↓
Plan
 ↓
Guide
 ↓
Collect Final Evidence
 ↓
Verify
```

The product should preserve this distinction throughout development.

---

# 93. Product Principles

Every FixLens feature should follow five principles.

### 1. Evidence Before Confidence

Do not make strong claims when evidence is insufficient.

### 2. Observation Before Conclusion

Separate visible observations from possible causes.

### 3. Safety Before Repair

Evaluate risk before providing instructions.

### 4. Small Steps Before Complex Instructions

Give users understandable troubleshooting steps.

### 5. Verify Before Declaring Success

Use additional evidence to determine whether visible conditions improved.

---

# 94. Final Product Definition

FixLens is not simply:

**an AI repair chatbot.**

It is:

> **A multimodal AI visual troubleshooting system that collects evidence, reasons about possible causes, evaluates safety, guides users through troubleshooting and verifies visible results.**

The complete FixLens philosophy is:

# SEE → INVESTIGATE → REASON → GUIDE → VERIFY

And the product promise is:

# Show the problem. Find the cause. Fix it. Verify it.