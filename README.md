# Rawdah Graveyard Registry (روضة)

A mobile-first, responsive Right-To-Left (RTL) Islamic cemetery management application and public plot directory. Built with React 19, TypeScript, Tailwind CSS, and Google Firebase Firestore.

---

## Key Features

- **Strict Right-To-Left (RTL) Cemetery Grid**: Layout starts with Plot #1 at the top-right position (`dir="rtl"`), maintaining traditional Islamic cemetery layout standards.
- **Consistent 5-Column Grid**: Displays 5 plots per row across all devices, adapting into compact icon tiles on smartphones and expanding into detailed cards on desktop displays.
- **Dignified Islamic Design System**: Deep Emerald Green (`#0F3D2E`), Warm Gold (`#D4AF37`), and Soft Cream (`#FDFBF7`) palette with custom 8-fold Islamic geometric star rosettes.
- **Protected Editing Workflow**: Public visitors enjoy read-only access. Recording a burial or editing records requires authenticated Administrator access and toggling an "Enable Edit Mode" safety switch.
- **Collapsible Search**: Real-time filtering by Plot Number, Deceased Name, or Passport/ID without occupying permanent screen space.
- **Dual-Mode Persistence**: Real-time synchronization with Google Firebase Firestore, with a seamless zero-config local storage fallback.

---

## Documentation

Full architectural and technical guides are available in the `/docs` directory:

- [**System Architecture & Design Specification**](docs/ARCHITECTURE_AND_DESIGN.md): Detailed breakdown of component hierarchy, RTL grid mathematics, Islamic design tokens, and state flow.
- [**Database Setup & Operations Guide**](docs/DATABASE_SETUP_GUIDE.md): Complete instructions for configuring Cloud Firestore, deploying security rules, creating admin credentials, and batch-publishing plots.

---

## Quickstart & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The app runs at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```

---

## License
Apache-2.0
