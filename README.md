# 🏢 Mini ERP & CRM Operations Portal

A complete, production-quality Full Stack MERN application designed for managing CRM, inventory, and ERP operations for mid-sized businesses. Built as a Full Stack Developer Case Study.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based secure login with bcrypt password hashing
- Role-Based Access Control (RBAC) — **ADMIN**, **SALES**, **WAREHOUSE**, **ACCOUNTS**
- Protected API routes and frontend route guards

### 👥 Customer CRM
- Full CRUD for customers (Create, Read, Update, Delete)
- Customer types: Wholesale, Retail, Distributor
- Status tracking: Lead → Active → Inactive
- Follow-up management with notes and dates

### 📦 Product & Inventory Management
- Product catalog with SKU, category, pricing
- Real-time stock tracking with low-stock alerts
- Stock IN/OUT operations with full audit trail (StockMovement records)
- Stock can never go negative — validated server-side

### 📄 Sales Challans (Orders)
- Create draft sales orders linking customers to products
- Product snapshot preservation (price/SKU at time of order)
- Challan confirmation with MongoDB transactions
- Automatic stock deduction on confirmation
- Insufficient stock? Entire operation is aborted safely

### 📊 Dashboard
- Real-time business metrics from MongoDB
- Total customers, products, stock levels, low-stock alerts
- Recent customers, challans, and stock movements
- All stats are dynamic — no hardcoded data

### 🤖 AI Business Assistant (Google Gemini)
- Integrated AI chatbot powered by Google Gemini API
- Uses real MongoDB data as context (RAG approach)
- Ask questions like:
  - *"Which products are low in stock?"*
  - *"Show me recent challans"*
  - *"Give me today's business summary"*
- AI never invents data — responses are grounded in actual database records

---

## 🛠 Technology Stack

| Layer      | Technologies |
|------------|-------------|
| **Frontend** | React.js, Vite, Tailwind CSS v4, React Router, Axios, React Hook Form, Lucide Icons |
| **Backend**  | Node.js, Express.js, JWT, bcrypt, REST APIs |
| **Database** | MongoDB, Mongoose |
| **AI**       | Google Gemini API (`gemini-3.5-flash`) |
| **DevOps**   | Docker, Docker Compose, Nginx |

---

## 📁 Project Structure

```
mini-erp-crm/
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React Context (AuthContext)
│   │   ├── layouts/            # MainLayout with Sidebar/Navbar
│   │   ├── pages/              # All page components
│   │   └── utils/              # Axios API configuration
│   ├── .env
│   ├── Dockerfile
│   └── nginx.conf
│
├── server/                     # Node.js Backend (Express)
│   ├── config/                 # Database connection (db.js)
│   ├── controllers/            # Route handlers
│   ├── middleware/              # Auth & role middleware
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routes
│   ├── seed/                   # Database seeding script
│   ├── services/               # AI service (Gemini)
│   ├── .env
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (Local or Atlas)
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/mayank4574/mini-erp-crm.git
cd mini-erp-crm
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mini-erp-crm?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
AI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash
```

Seed the database:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```

Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

### 4. Open the Application
Navigate to **http://localhost:5173**

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@minierp.com | password123 |
| **Sales** | sales@minierp.com | password123 |
| **Warehouse** | warehouse@minierp.com | password123 |
| **Accounts** | accounts@minierp.com | password123 |

> These accounts are created when you run `npm run seed`.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Get all customers (paginated) |
| GET | `/api/customers/:id` | Get single customer |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (paginated) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory/movements` | Get stock movements |
| POST | `/api/inventory/stock-in` | Stock IN operation |
| POST | `/api/inventory/stock-out` | Stock OUT operation |

### Sales Challans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/challans` | Get all challans |
| GET | `/api/challans/:id` | Get single challan |
| POST | `/api/challans` | Create draft challan |
| PUT | `/api/challans/:id` | Update/Confirm challan |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |

### AI Assistant
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI assistant |

---

## 🐳 Docker Deployment

```bash
docker-compose up -d --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:5000 |
| MongoDB | mongodb://mongo:27017 |

---

## 🧪 Testing

### Manual Test Flow
1. Login as Admin
2. Create a new customer → Verify it appears in customer list
3. Create a new product (SKU: TEST-001) → Verify in product list
4. Do Stock IN for the product → Verify stock increases
5. Create a Sales Challan → Save as Draft
6. Confirm the Challan → Verify stock decreases
7. Ask AI: *"How much stock does TEST-001 have?"* → Verify AI uses real data
8. Refresh browser → All data persists (MongoDB is source of truth)

---

## 📝 Environment Variables

### Server (`server/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLIENT_URL` | Frontend URL for CORS |
| `AI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Gemini model name (e.g., gemini-3.5-flash) |

### Client (`client/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## 👨‍💻 Author

**Mayank Yadav**

---

## 📄 License

This project is licensed under the ISC License.
