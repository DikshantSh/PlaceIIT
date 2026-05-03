# 🎓 PlaceIIT

> **The definitive placement insights and ledger dashboard for IIT Kharagpur.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)

PlaceIIT is a high-performance, client-side placement dashboard that transforms messy ERP data into actionable insights. It provides IIT Kharagpur students with an intuitive interface to search, filter, compare, and bookmark placement opportunities without the friction of the standard ERP portal.

---

## 🚀 Features

- **Blazing Fast Search & Filtering:** Instantly filter 600+ roles by CTC, CGPA, bond duration, and role tags (Super Dream, Dream, Core) using client-side indexing.
- **Side-by-Side Comparison (The Ledger):** Add roles to a comparison matrix that automatically highlights the best CTC, lowest CGPA requirements, and most favorable bond terms.
- **Advanced Analytics:** Visual breakdowns of CTC distributions, top-paying companies, and role tags using interactive Chart.js graphs.
- **Smart Data Normalization:** A robust Node.js pipeline (`transform.js`) that automatically cleans garbled Unicode, Windows-1252 artifacts, and unprintable characters from ERP data dumps.
- **Zero-Backend Architecture:** Entirely Static Site Generated (SSG). Data is bundled at build time, ensuring zero latency and free hosting on Vercel/Netlify.
- **Persisted Bookmarks:** Save roles to your browser's local storage to build a personalized shortlisting queue.

---

## 🛠️ Tech Stack

- **Framework:** React 18 + Vite (Chosen for lightning-fast HMR and optimized static builds)
- **Routing:** React Router v6
- **Styling:** Vanilla CSS with custom CSS variables (Glassmorphism / Dark Mode aesthetic)
- **Charts:** Chart.js + react-chartjs-2
- **Data Pipeline:** Node.js (fs, path)

---

## 📂 Project Structure

```text
/placeiit
├── public/                 # Static assets (favicon, etc.)
├── scripts/
│   └── transform.js        # Node.js ETL pipeline (Raw ERP JSON → Clean roles.json)
├── src/
│   ├── components/         # Reusable UI (RoleCard, Navbar, CompareBar)
│   ├── context/            # Global state management (AppContext.jsx)
│   ├── data/               # Generated roles.json lives here
│   ├── pages/              # Route components (Home, Browse, Compare, Analytics, Detail)
│   ├── App.jsx             # Router and Layout configuration
│   ├── index.css           # Global design system, tokens, and utility classes
│   └── main.jsx            # React mounting point
├── .gitignore
├── package.json
└── README.md
```

### Why this structure?
- **Separation of Concerns:** The ETL pipeline (`scripts/`) is strictly separated from the frontend (`src/`).
- **Context API:** Since the dataset is static and global, `AppContext` provides a lightweight, dependency-free alternative to Redux for managing bookmarks and filters.
- **CSS Variables:** Using a global `index.css` with CSS variables (`--bg-primary`, `--accent-primary`) ensures effortless theming without the bundle bloat of heavy UI libraries.

---

## 📊 Data Schema

The application relies on `company_details.json` extracted from the ERP portal. The `scripts/transform.js` pipeline converts it into the following normalized `roles.json` schema:

```typescript
type Role = {
  id: string;               // Slugified company + designation
  company: string;          // Cleaned company name
  designation: string;      // Cleaned job title
  ctcINR: number;           // Normalized to INR for sorting/filtering
  ctcRaw: string;           // Original string (e.g., "135,000 USD")
  jobDescription: string;   // Sanitized text (control characters removed)
  skills: string[];         // Array parsed from comma-separated string
  cgpaRequired: number | null; 
  hasBond: boolean;
  roleTag: 'super-dream' | 'dream' | 'core' | 'standard';
}
```

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/placeiit.git
   cd placeiit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate the clean dataset:**
   Since real placement data is private, a dummy dataset is provided. Copy the sample file to the root directory to generate the required `roles.json`:
   ```bash
   cp sample_company_details.json company_details.json
   npm run data:sync
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

---

## 📸 Screenshots

*(Add your screenshots here)*

- **Home Dashboard:** `![Home](./docs/home.png)`
- **Browse & Filters:** `![Browse](./docs/browse.png)`
- **Comparison Ledger:** `![Compare](./docs/compare.png)`
- **Analytics View:** `![Analytics](./docs/analytics.png)`

---

## 🔮 Future Improvements

- [ ] **Real-time syncing:** Add Firebase/Supabase to sync bookmarks across devices.
- [ ] **Fuzzy Search:** Integrate Fuse.js for typo-tolerant searching.
- [ ] **URL State:** Sync active filters to URL query parameters so users can share specific search results.
- [ ] **Interview Experiences:** Add a tab to link roles to past interview experiences/questions.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes following conventional commits (`git commit -m 'feat: Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
