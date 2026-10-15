# EmpireNexs Management System 🚀
### Unified YouTube Automation ERP for 3 Branches

EmpireNexs is a centralized operations platform engineered specifically for YouTube Automation agencies operating multiple branches. It connects Google Sheets, Role-Based Access Control (RBAC), video production pipelines, and an intelligent AI Operations Assistant.

---

## 🏢 Branch Hierarchy & Leadership

| Branch | City | Head | Executive Role | Scope & Access |
| :--- | :--- | :--- | :--- | :--- |
| **Musafirkhana (HQ)** | Musafirkhana | **Waqas Gill** | **Founder & CEO** | **Super Admin (Master Access)**: Full visibility over all 3 branches, all channels, credentials, and financials. |
| **Team Bahawalpur** | Bahawalpur | **Saim Ch** | **Co-Founder & Branch Head** | **Branch Admin**: Manages Bahawalpur team, luxury/stoicism channels, and video pipelines. |
| **Team Rahim Yar Khan** | Rahim Yar Khan | **Zainab Athar** | **Co-Founder & Branch Head** | **Branch Admin**: Manages RYK team, true crime/history channels, and video pipelines. |

---

## 🔑 Core Features & Modules

### 1. Channels Vault (Live Google Sheet Schema)
Matches your exact channel tracking spreadsheet columns:
- **Name / Link**: Direct clickable YouTube channel link and handle.
- **Status**: `Active`, `Monetized`, `In Review`, `Warmup`, `Suspended`.
- **Email & Password**: Master account credentials with security toggle and role-based masking.
- **2 FA & Backup Codes**: Protected authentication seeds and recovery codes.
- **Managed By & Manager Mail**: Dedicated channel manager details.
- **Created Number**: Account creation / recovery phone number.
- **PUB ID**: AdSense Publisher ID for monetization tracking.
- **Owner**: Branch / Founder ownership tag.
- **Dedicated IP**: Static residential/datacenter proxy IP to prevent YouTube account flagging.

### 2. Niches & Content Production Hub (Single Sheet • Multi-Tabs)
- Reflects the structure where each Niche / Topic is a separate tab inside the same master sheet.
- **Video Production Workflow**:
  - `Idea` ➡️ `Scripting` (Google Doc) ➡️ `Voiceover` (Google Drive) ➡️ `Video Editing` (Cut Link) ➡️ `Thumbnail` (Canva/PSD) ➡️ `Review` ➡️ `Scheduled` ➡️ `Published`.
- Quick status updater, asset link clickers, and new video/tab creators.

### 3. Nexs AI Assistant (Custom Instructions & Sheets Lookup)
- **Role-aware intelligence**: Understands Roman Urdu and English.
- **Sheet Link Fetcher**: Ask *"Apex Tech channel ka link do"* or *"Luxury niche me pending videos batao"* and the AI searches the sheet and returns the exact link.
- **Security Guard**: Strictly protects sensitive credentials (passwords, 2FA) from non-executive team members.
- **Customizable System Prompt**: Instructions and company SOPs can be updated anytime in Settings.
- **Gemini AI Integration**: Direct support for Google Gemini API.

---

## 💻 Tech Stack

- **Frontend & App**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling & UI**: Tailwind CSS + Lucide Icons + Glassmorphism Dark Theme
- **State & RBAC**: React Context with branch-level filtering and role simulation
- **APIs**: Google Sheets API v4 connector + Google Gemini API

---

## 🏃 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
http://localhost:3000
```
