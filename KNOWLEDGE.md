# Armada Pintar Bandung — Knowledge Document

## 1. System Overview

**Project:** Fleet Reminder Management System (Armada Pintar Bandung)

A modular, browser-based system for managing reminders, documents, maintenance, and costs for vehicle fleets. Supports notification delivery via Email (working) and Telegram (partial). UI is primarily in Bahasa Indonesia.

---

## 2. Architecture & Code Structure

- **Frontend:** React (TypeScript), Vite, Tailwind CSS, shadcn-ui
- **Persistence:** LocalStorage (type-safe, centralized)
- **Notifications:** EmailJS (integrated), Telegram Bot (partial)
- **No backend/database yet** (all data is browser-local)

### Directory Structure
- `src/pages/` — Main dashboard (Index), NotFound
- `src/components/` — Feature modules (Vehicle, Document, Maintenance, Cost, Reminder, etc.)
- `src/components/ui/` — Reusable UI primitives (button, card, table, sidebar, etc.)
- `src/services/` — LocalStorageService (all data CRUD)
- `src/hooks/` — Custom hooks (responsive, toast, etc.)
- `src/lib/` — Utilities

---

## 3. Application Logic

- **Feature Modules:**
  - Each business domain (vehicles, documents, maintenance, costs, reminders) is a separate React component.
  - Business logic (CRUD, filtering, validation) is handled within each module.
  - Shared logic for reminders (scheduling, sending, templating) is in `ReminderService.tsx`.
- **Dashboard:**
  - Aggregates and displays key metrics (active vehicles, service due, expiring documents, costs).
  - Quick actions and alerts for fast access.
- **Reminders:**
  - Configurable for service, document, insurance, or custom needs.
  - Supports multi-channel (email, telegram), recurring, and templated messages.
  - Email notifications use EmailJS; Telegram is partially implemented.

---

## 4. State Management

- **Local State:**
  - Managed with `useState` in each feature component (forms, modals, filters, etc.).
- **Global/Shared State:**
  - No global business state (no Redux, no React Context for data).
  - Some UI state (sidebar, form, etc.) uses React Context in `ui/` components.
- **Async State:**
  - React Query is set up but not actively used (all data is local).

---

## 5. Storage System

- **LocalStorageService:**
  - Centralized, type-safe service for all data persistence.
  - Handles vehicles, documents, maintenance, costs, reminders, settings, and logs.
  - Provides CRUD, import/export, and sample data initialization.
  - Data is stored as JSON under well-named keys (e.g., `fleet_vehicles`).
- **Data Flow:**
  - Feature components call service methods to load, save, update, and delete data.
  - After mutation, components reload data from storage to update UI.

---

## 6. UI/UX Design

- **Component Library:**
  - shadcn-ui for modern, consistent look and feel.
  - Responsive, mobile-friendly layouts and adaptive grids.
- **Navigation:**
  - Sidebar navigation (collapsible, keyboard shortcut, context-driven).
- **Forms & Feedback:**
  - All forms provide validation and user feedback via toast notifications.
  - Error and success states are clearly communicated.
- **Language:**
  - Dashboard and most user-facing text are in Bahasa Indonesia.
- **Accessibility & Usability:**
  - Semantic HTML, ARIA-friendly components, keyboard navigation, visual cues.

---

## 7. Current Limitations & Opportunities

- **No backend/database:** All data is browser-local; no multi-user or server sync.
- **Telegram & Scheduling:** Telegram integration and automated scheduling are not fully implemented.
- **Analytics/Reporting:** Not yet implemented.
- **Advanced notifications:** (attachments, push, etc.) not yet implemented.
- **UI language:** Some deeper UI layers or error messages may still be in English.

---

## 8. Next Steps for MVP

- Complete Telegram integration and automated scheduling.
- Ensure all UI is fully in Bahasa Indonesia.
- Consider backend/database for multi-user and data integrity.
- Expand analytics, reporting, and advanced notification options.

---

**This document should be updated as the system evolves.** 