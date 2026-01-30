<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1bWINjIVLdGdWHX4PQHKFKcXlG783FS2G

## Features

### 🏢 For Administrators
- **User Lifecycle Management**: Create, issue, and revoke digital identity assets.
- **AI-Powered Audit**: Automated analysis of system logs using Gemini 3 Flash.
- **Operational Analytics**: Real-time dashboards for issuance trends and asset status.

### 👤 For Users
- **Digital Identity Studio**: Fully customizable digital business cards with multiple themes.
- **Smart Contact Management**: CRM tools to track relationships and meeting notes.
- **Automated Outreach**: WhatsApp campaign manager with custom message templates.
- **Personal Analytics**: Track engagement, views, and contact saves.

## 📚 Documentation

For a detailed breakdown of the project architecture, data models, and development guide, see [DOCUMENTATION.md](DOCUMENTATION.md).

## Run Locally

**Prerequisites:**  Node.js (v18+)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Set the `GEMINI_API_KEY` in `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```
