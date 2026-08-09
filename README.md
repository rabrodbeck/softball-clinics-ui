# Softball Clinics Event Management UI

A modern, responsive Single-Page Application (SPA) built with **React**, **TypeScript**, and **Vite** for managing youth softball clinic sessions, attendee rosters, and real-time player registrations.

This repository contains the frontend client for the **Origin Digital Software Engineering Take-Home Exercise**, designed to connect directly with the companion **.NET 8 Web API** backend (`softball-clinics-api`).

---

## Table of Contents
- [Tech Stack](#tech-stack)
- [Key Features & UI Architecture](#key-features--ui-architecture)
- [Project Layout](#project-layout)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Installation & Local Run](#installation--local-run)
  - [Build for Production](#build-for-production)
- [Backend Integration & Error Handling](#backend-integration--error-handling)

---

## Tech Stack

- **Framework**: React 19 / 18 SPA
- **Tooling & Bundler**: Vite
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Vanilla CSS with custom design tokens (high-contrast athletic theme, glassmorphism cards, responsive grid)
- **Icons**: Lucide React (featherweight SVG icons)
- **HTTP Client**: Native Fetch API with strongly-typed response handling and RFC 7807 ProblemDetails parsing

---

## Key Features & UI Architecture

I designed this frontend to provide an intuitive, high-performance user experience for both parents registering players and league administrators managing clinic sessions:

1. **Interactive Clinic Cards with Real-Time Capacity Meters:**
   - Visual progress bars that dynamically reflect capacity utilization (emerald for open spots, amber when 3 or fewer spots remain, and crimson when full).
   - Automatic division badging detecting age brackets (8U, 10U, 12U, 14U) from session titles.
   - Formatted dates and times for clear scheduling.

2. **Player Registration Modal:**
   - Streamlined registration form (`Player Full Name` + `Parent Email`).
   - Client-side validation paired with instant backend validation feedback.
   - Displays clear error alerts if an event is in the past, at capacity, or if the player is already registered.

3. **Roster Inspection & Unregistration:**
   - Dedicated modal showing the complete list of registered players per session along with registration timestamps.
   - Inline **Unregister** action with confirmation to release spots and immediately update capacity counts across the app.

4. **Session Administration (Create, Edit, Delete):**
   - Modal interface allowing admins to create new clinics or modify existing session details, dates, and player capacities.
   - Built-in safeguards preventing capacity reductions below existing registration numbers.

5. **Search, Filter Tabs, & Live Metrics:**
   - Real-time client-side search across clinic titles and drill descriptions.
   - One-click filter tabs to toggle between **All Clinics**, **Upcoming Sessions**, and **Past Archives**.
   - Overview metrics displaying Total Clinics, Available Open Spots, and Total Registered Players.

6. **Toast Notification System:**
   - Floating notifications providing immediate feedback for successful registrations, unregistrations, edits, and deletions with auto-dismiss timers.

---

## Project Layout

```text
softball-clinics-ui/
├── .env                              # Local environment variables
├── .env.example                      # Example environment configuration
├── index.html                        # Application HTML shell & Google Fonts (Inter)
├── package.json                      # Dependencies and npm scripts
├── tsconfig.json                     # TypeScript compiler configuration
├── vite.config.ts                    # Vite build configuration
└── src/
    ├── components/
    │   ├── ClinicCard.tsx            # Session card with dynamic progress meter
    │   ├── EventFormModal.tsx        # Admin Create/Edit clinic modal
    │   ├── RegistrationModal.tsx     # Player registration modal with error handling
    │   └── RosterModal.tsx           # Attendee roster modal with unregister action
    ├── services/
    │   └── apiService.ts             # Strongly-typed HTTP API client
    ├── types/
    │   └── event.ts                  # TypeScript domain & DTO interfaces
    ├── App.css                       # Component styling, animations, and modals
    ├── App.tsx                       # Main application shell & state coordinator
    ├── index.css                     # Global design system & theme variables
    └── main.tsx                      # React root entry point
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x, v20.x, or v22.x / v24.x)
- [npm](https://www.npmjs.com/) (v9.x or higher)

### Environment Configuration
The application reads the backend API URL from `.env`. A default `.env` file is included pointing to the companion .NET 8 backend:

```env
VITE_API_BASE_URL=http://localhost:5124/api
```

*(If your backend runs on a different port, update `VITE_API_BASE_URL` accordingly).*

### Installation & Local Run

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Open in Browser:**
   Navigate to `http://localhost:5173/` in your browser.

### Build for Production
To generate an optimized, type-checked production bundle:

```bash
npm run build
```

The compiled output will be generated in the `dist/` directory.

---

## Backend Integration & Error Handling

This application integrates with the **`softball-clinics-api`** backend.

- **CORS Support**: The backend is configured to accept requests from `http://localhost:5173`.
- **ProblemDetails Mapping**: If the backend returns a `400 Bad Request` or `404 Not Found` (such as double-registration or capacity limits), the `apiService` extracts the structured `detail` message from the RFC 7807 payload and displays it in a dismissible alert banner.
- **Connection Resilience**: If the backend API server is offline, a prominent banner appears with a **"Retry Connection"** button, allowing users to reconnect once the API starts.
