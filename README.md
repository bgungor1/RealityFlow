# RealityFlow — Real Estate Transaction & Commission System

RealityFlow is a robust, modular monolith application designed for real estate agencies to automate their transaction lifecycles and commission distributions.

## 🌐 Live Deployment
- **Frontend Application:** [https://reality-flow-six.vercel.app/](https://reality-flow-six.vercel.app/)
- **Backend API:** [https://realityflow.onrender.com/api](https://realityflow.onrender.com/api)
- **API Documentation (Swagger):** [https://realityflow.onrender.com/api/docs](https://realityflow.onrender.com/api/docs)

> [!IMPORTANT]
> **Note on Performance:** The backend is hosted on Render's free tier. If the service hasn't been used recently, the first request may take **30-50 seconds** to "wake up" (spin-down). Thank you for your patience.

## 🚀 Tech Stack

- **Backend:** NestJS, MongoDB (Mongoose), TypeScript
- **Frontend:** Nuxt 3, Pinia, Tailwind CSS
- **Testing:** Jest
- **Database:** MongoDB Atlas

## ✨ Key Features (Case Compliance)
- **Automated Lifecycle:** End-to-end tracking from `agreement` to `completed`.
- **Smart Commission Engine:** Automatic 50/50 split between agency and agents with specific role-based logic (Listing/Selling).
- **Financial Traceability:** Detailed breakdown for every completed transaction, explaining "who earned what and why".
- **Real-time Dashboard:** High-performance data aggregation using MongoDB `$facet`.
- **API Documentation:** Fully documented endpoints via Swagger/OpenAPI.

## 📂 Project Structure

```text
RealityFlow/
├── apps/
│   ├── backend/          # NestJS Application
│   └── frontend/         # Nuxt 3 Application
├── ai-rules.md           # Architectural & Business Rules
├── DESIGN.md             # Technical Architecture & Design Decisions
└── README.md             # Project Documentation
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- MongoDB Atlas cluster or a local MongoDB instance

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd RealityFlow
   ```

2. Install dependencies for both applications:
   ```bash
   # Install Backend dependencies
   cd apps/backend && npm install

   # Install Frontend dependencies
   cd ../frontend && npm install
   ```

### Configuration

Create a `.env` file in `apps/backend`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/realityflow
```

Create a `.env` file in `apps/frontend`:

```env
# Local Development: http://localhost:3000
# Production: https://realityflow.onrender.com
NUXT_PUBLIC_API_BASE=http://localhost:3000
```

### Running the Project

Open two terminal windows:

**Terminal 1: Backend**
```bash
cd apps/backend
npm run start:dev
```

**Terminal 2: Frontend**
```bash
cd apps/frontend
npm run dev
```

The application will be available at:
- **Frontend Application:** http://localhost:3001
- **Backend API:** http://localhost:3000/api
- **Swagger Documentation:** http://localhost:3000/api/docs

## 🧪 Testing

To run the backend unit tests (Commission logic and Stage transitions):

```bash
cd apps/backend
npm test
```

## 📄 License

MIT
