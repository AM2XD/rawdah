# System Architecture & Design Specification: Rawdah Graveyard Registry

A high-performance, mobile-first web application designed for managing and publicly browsing a Muslim graveyard with Right-To-Left (RTL) plot alignment, admin edit safeguards, and self-hosted Firebase Firestore synchronization.

---

## 1. System Overview & Core Requirements

- **Total Plots**: Initialized with 200 plots (`plot-1` through `plot-200`), with an architecture designed for dynamic scalability beyond 200 without hardcoded limits.
- **RTL Orientation**: Layout direction is Right-To-Left (`dir="rtl"`), placing Plot #1 at the top-right corner.
- **5-Column Consistency**: Displays strictly 5 plots per row across all screen sizes (mobile phones, tablets, and desktop displays).
- **Public & Admin Roles**:
  - **Public Visitors**: Unrestricted read-only access to view plot statuses, deceased names, and search records.
  - **Administrators**: Protected write permissions behind Firebase Authentication and a secondary "Enable Edit Mode" safety switch.
- **Dual-Layer Persistence**: Live Firebase Firestore integration with a zero-latency fallback to `localStorage`.

---

## 2. Technical Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 (TypeScript) | Modern functional component model, strict typing, high performance. |
| **Bundler & Tooling** | Vite 8 + `@tailwindcss/vite` | Instant HMR, minimal bundle overhead, production optimizations. |
| **Styling Engine** | Tailwind CSS v4 | Class-first utility tokens, zero CSS runtime, custom color theme variables. |
| **Icons & Motifs** | Lucide React + Inline SVG | Scalable vector graphics; custom mathematical 8-fold Islamic star rosette SVG. |
| **Database & Auth** | Firebase SDK v12 (Firestore + Auth) | Real-time snapshots (`onSnapshot`), serverless scaling, granular security rules. |
| **Local Cache** | LocalStorage API + Custom Events | Resilient offline capability and instant testing without cloud dependencies. |

---

## 3. UI/UX & Islamic Design System

### 3.1 Color Palette & Token Hierarchy

The visual identity follows the **60-30-10 color allocation rule** with a dignified Islamic palette:

- **60% Dominant Neutral Canvas**: `#FDFBF7` (Soft Off-White / Warm Cream). Avoids harsh stark white, creating a serene parchment ambiance.
- **30% Structural Surfaces**:
  - Deep Emerald Green (`#0F3D2E` / `#164E3A`): Used on the top navigation bar, occupied plot headers, and primary hero banner.
  - Surface White (`#FFFFFF`): Card backgrounds and modal containers with subtle hairline borders (`rgba(212, 175, 55, 0.25)`).
- **10% High-Intent Accent**:
  - Warm Metallic Gold (`#D4AF37` / `#B8972E`): Reserved strictly for key accents, active states, star rosettes, and plot number badges.

### 3.2 Visual Contrast & Card States

| Plot State | Visual Treatment | Interactive Affordance |
| :--- | :--- | :--- |
| **Occupied** | Deep emerald background (`#0F3D2E`), gold border (`#D4AF37`), gold Islamic star rosette icon, bold deceased name. | Tap opens full detail drawer in read-only mode with edit toggle. |
| **Vacant** | Warm cream background (`#FAF7EE`), dashed gold border (`#D4AF37`/40), green plus icon (`+`). | Tap opens quick modal to enter deceased name and passport ID. |

### 3.3 Strict 5-Column Responsive Layout Math

To maintain a continuous 5-plot row sequence (`grid-cols-5`) across all viewports:
- **Mobile Viewports (320px–480px)**:
  - Cards adapt into compact plot tiles (`min-h-[66px]`).
  - Content prioritizes: Plot Number (`#1`), status icon (Star vs Plus), and truncated deceased first name.
  - Touch targets preserve the minimum ergonomic 44px hitbox.
- **Desktop Viewports (768px+)**:
  - Cards expand vertically to show full deceased names, passport IDs, and action buttons.
  - A view toggle allows desktop users to switch between "Detailed Cards" and "Map Tiles".

### 3.4 Zero-Pill & Editorial Anti-Slop Standards

- Metadata (plot count, status, dates) uses clean, unboxed typography separated by typographic dots (`·`), avoiding bloated candy badges.
- No decorative pulsing dots, artificial scores, or comment-style headers.
- Centered Islamic Basmala calligraphy (`بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ`) set in traditional serif typography.

---

## 4. Component Hierarchy & Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                                App.tsx                                 │
│  - State Orchestration (plots, search, filter, auth, modals, toast)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌──────────────┐            ┌──────────────┐            ┌────────────────┐
│  Header.tsx  │            │SearchBar.tsx │            │  PlotGrid.tsx  │
│ - Brand Logo │            │- Text input  │            │ - 5-Col Grid   │
│ - Stats      │            │- Filter tabs │            │ - dir="rtl"    │
│ - Search btn │            │- Quick jump  │            │ - Infinite Scrl│
│ - Admin btn  │            └──────────────┘            └───────┬────────┘
│ - DB Settings│                                                │
└──────────────┘                                                ▼
                                                        ┌────────────────┐
                                                        │  PlotCard.tsx  │
                                                        │- Mobile icon   │
                                                        │- Desktop card  │
                                                        │- Star rosette  │
                                                        └────────────────┘
```

### Dialogs & Drawers:
- **`AddPlotModal.tsx`**: Quick entry for vacant plots (Name, CNP, ADEVERENȚA number, Burial Date). Requires Admin authentication.
- **`PlotDetailDrawer.tsx`**: Protected viewer for occupied plots. Two-step safety mechanism requiring Admin login + toggling "Enable Edit Mode".
- **`AdminAuthModal.tsx`**: Supports live Firebase Authentication (email/password) and a zero-config "Demo Admin" mode.
- **`FirebaseSetupModal.tsx`**: Project credentials configuration, security rules copy utility, and one-click database publish tool.

---

## 5. Data Model & Architecture

### 5.1 Plot Document Schema (`PlotRecord`)

```typescript
export interface PlotRecord {
  id: string;          // Format: "plot-1" to "plot-200"
  plotNumber: number;  // Integer 1 to 200
  status: 'vacant' | 'occupied';
  fullName?: string;   // Deceased full legal name
  cnp?: string;        // Cod Numeric Personal (CNP)
  adeverinta?: string | number; // Official burial ADEVERENȚA document number
  burialDate?: string; // ISO date string (YYYY-MM-DD)
  notes?: string;      // Optional grave notes or next-of-kin details
  updatedAt?: string;  // ISO timestamp of last modification
  updatedBy?: string;  // Admin email or identifier
}
```

### 5.2 Persistence & Fallback Lifecycle

```
[Application Init]
       │
       ▼
Check Firebase Config & Permissions
       ├── Available & Authorized ──► Attach Firestore onSnapshot Listener
       │                                     │
       │                                     ▼
       │                              Real-time updates to UI & local cache
       │
       └── Not configured / Denied ──► Read local storage ('rawdah_local_plots_v2')
                                             │
                                             ▼
                                      Listen to window storage events
```

---

## 6. Security Architecture & Access Control

1. **Strict Admin Separation (Live Firebase vs. Local Demo Mode)**:
   - **Verified Firebase Staff Admin**:
     - Authenticated directly through Firebase Authentication (`signInWithEmailAndPassword`).
     - Authorized to push batch records (`seedAll200PlotsToFirestore`), record new burials, and vacate plots directly to Cloud Firestore.
   - **Local Demo Admin (Sandboxed)**:
     - Designed solely for evaluating UI components and testing layout interactions without Firebase credentials.
     - **Completely isolated**: Edits mutate only the client's `localStorage` and memory.
     - **Database Write Guard**: All live Firestore write requests and the "Publish to Database" action are strictly blocked for Demo Admin (`isDemoAdmin === true` or missing `auth.currentUser`).

2. **Firestore Rules Enforcement**:
   - `read`: Permitted publicly without credentials (`allow read: if true;`).
   - `create, update`: Restricted strictly to authenticated sessions (`allow create, update: if request.auth != null;`).
   - `delete`: Restricted to authenticated admins (`allow delete: if request.auth != null;`).

3. **Frontend Overwrite Protection**:
   - Occupied cards open in read-only mode by default.
   - Text inputs remain disabled until an explicit "Enable Edit Mode" toggle is engaged.
   - Vacating an occupied plot triggers a secondary confirmation dialog to prevent accidental deletion.

---

## 7. Deployment & Hosting Options

For step-by-step instructions on publishing this application at zero cost, see:
- [`docs/FREE_DEPLOYMENT_GUIDE.md`](./FREE_DEPLOYMENT_GUIDE.md) — Detailed walkthroughs for Vercel, Firebase Hosting, Netlify, GitHub Pages, and AI Studio's built-in live link.

