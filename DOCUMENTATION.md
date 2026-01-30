# Hawkforce AI Documentation

## Overview
Hawkforce AI is a digital business card and relationship management platform. It enables professionals to create, manage, and share digital identities through customizable cards, while providing organizations with administrative oversight and AI-powered insights.

## Architecture

The application is built as a single-page application (SPA) using **React 19** and **TypeScript**, bundled with **Vite**.

### Project Structure
- `src/` (root)
  - `components/`: React UI components.
  - `services/`: Logic for data persistence and external API integrations.
  - `App.tsx`: Main application controller and routing.
  - `types.ts`: Centralized TypeScript definitions.
  - `metadata.json`: Application metadata.

### State Management
The app uses React's built-in `useState` and `useEffect` hooks for local state management. Authentication state and the current view are managed at the `App.tsx` level.

### Persistence Layer
Data is persisted in the browser's `localStorage` via the `StorageService`. This includes:
- User profiles and roles.
- Digital business cards.
- Contact lists and segments.
- Message templates.
- System audit logs.

---

## Feature Modules

### 1. Authentication
A simple role-based authentication system supports two roles:
- **ADMIN**: Accesses the Admin Console to manage users and system health.
- **USER**: Accesses the Personal Portal to manage their digital identity and contacts.

### 2. Admin Dashboard
The Admin Console provides:
- **User Management**: Creating new user profiles, issuing or revoking digital cards, and viewing detailed user activity.
- **Audit Logs**: A chronological record of system actions (e.g., logins, card issuances).
- **AI Insights**: Integration with Google Gemini to analyze logs for patterns or security anomalies.
- **Analytics**: Visualization of card distribution and weekly issuance trends using Recharts.

### 3. User Portal
The Personal Portal includes:
- **Digital Card Editor**: A comprehensive interface to customize card themes, colors, professional details, and social links.
- **Relationship Manager**: A CRM-like interface for managing professional connections, including notes and social profile links.
- **Campaign Center**: Tools for segmenting contacts and sending bulk, personalized WhatsApp messages using templates.
- **Analytics**: Personal performance metrics like profile views and contact save rates.
- **Onboarding Wizard**: A guided experience for first-time users to set up their primary digital card.

### 4. AI Integration
Hawkforce AI leverages the **Gemini 3 Flash** model (experimental) via the `@google/genai` SDK.
- **Log Analysis**: The `analyzeSystemLogs` service processes recent audit logs and generates a concise security and operational summary for administrators.

---

## Data Model

Key interfaces defined in `types.ts`:

- `User`: Core identity object including role, department, and card status.
- `DigitalCard`: Detailed configuration for a business card (theme, fields, analytics).
- `Contact`: Information about a connection made by a user.
- `ContactSegment`: Grouping mechanism for contacts.
- `MessageTemplate`: Pre-defined messages for WhatsApp outreach.
- `LogEntry`: System audit event record.

---

## Services

### Storage Service (`services/storage.ts`)
Encapsulates all `localStorage` interactions. It provides methods for CRUD operations on all major data types and handles initialization with mock data if the storage is empty.

### Gemini Service (`services/gemini.ts`)
Handles communication with the Google Generative AI API. It formats system logs into prompts and retrieves analytical summaries from the Gemini model.

---

## Development Guide

### Prerequisites
- Node.js (Latest LTS recommended)
- Gemini API Key

### Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env.local` file and set `GEMINI_API_KEY`.
4. Run `npm run dev` to start the development server.

### Adding New Features
1. **Define Types**: Update `types.ts` if adding new data structures.
2. **Update Storage**: Add necessary methods to `StorageService` for persistence.
3. **Build Component**: Create the new UI component in `components/`.
4. **Integrate**: Add the component to `UserPortal.tsx` or `AdminDashboard.tsx` and update the navigation logic.
