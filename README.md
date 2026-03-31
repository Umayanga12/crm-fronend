# CRM Frontend

A modern, high-performance CRM dashboard built with React and Vite. This frontend provides an intuitive user interface for managing organizations, teams, companies, and contacts, fully integrated with the CRM Backend.

## 🚀 Tech Stack

- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives)
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router](https://reactrouter.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## ✨ Key Features

- **Responsive Dashboard**: Real-time overview of CRM activities and metrics.
- **Organization Management**: Unified interface for managing organization settings and subscriptions.
- **Team Collaboration**: Role management and team member invitations.
- **CRM Entities**: Full CRUD operations for Companies and Contacts with advanced search and filtering.
- **Activity Log**: Interactive audit trail of all system actions.
- **Pricing & Plans**: Interface for viewing and upgrading subscription tiers.
- **Premium UI**: Smooth animations via [Framer Motion](https://www.framer.com/motion/) and elegant data visualization with [Recharts](https://recharts.org/).

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Stable)
- [pnpm](https://pnpm.io/) installed

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd crm-frontend
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file:
   ```bash
   echo "VITE_API_URL=http://localhost:8000" > .env
   ```

4. **Start Development Server**:
   ```bash
   pnpm dev
   ```

## 🏗️ Project Structure

- `src/pages/`: Main view components (Dashboard, Companies, etc.).
- `src/components/`: Reusable UI components and layout elements.
- `src/services/`: API client and interaction logic.
- `src/store/`: Global state management with Zustand.
- `src/hooks/`: Custom React hooks for shared logic.
- `src/lib/`: Utility functions and third-party configurations.

## 🧪 Testing

Run unit and integration tests with Vitest:

```bash
pnpm test
```

For end-to-end testing with Playwright:

```bash
npx playwright test
```

## 📜 License

This project is licensed under the MIT License.
