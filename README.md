# 📦 Efficient Inventory Management System For Small Businesses

A **full-stack web application** that helps businesses efficiently **manage products, stock, and orders**, visualize category insights, and maintain real-time inventory updates.

---

## 📘 **Project Overview**

This project provides an easy-to-use interface for small and medium businesses to:

- Add, update, and delete products.
- Track stock quantities and product categories.
- Manage customer orders.
- Visualize inventory data with charts and summaries.
- Prevent duplicate SKUs for clean, consistent records.

Built using:
- **Backend:** Django REST Framework (DRF), SQLite, JWT authentication
- **Frontend:** React.js, React-Router, Recharts (for data visualization), Axios, and Styled Components

---

## ⚙️ **Tech Stack**

| Layer | Technology |
|--------|-------------|
| Backend | Django, Django REST Framework |
| Database | SQLite (default) / PostgreSQL |
| Authentication | JWT (`djangorestframework-simplejwt`) |
| Frontend | React, Recharts, Axios, React Router, Styled Components |
| Dev Tools | VS Code, Git, GitHub |

---

## 🗂️ **Project Structure**

```
Inventory-Management-System/
│
├── backend/                     # Django backend
│   ├── inventory_project/       # Main API app
│   ├── inventory/               # Core app for product & order management
│   ├── dbsqlite3                
│   └── manage.py                # Backend dependencies
│
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── services/            # Axios API service files
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Dashboard, Products, Orders, Login, Register
│   │   ├── utils/               # errorHandler
│   │   |── App.jsx
|   |   |-- styles/              #Global Styles
│   └── package.json
│
└── README.md
```

---

## 🧑‍💻 **Setup Instructions**

### 🐍 Backend Setup (Django)

1. **Creating the project:**
   ```bash
   mkdir Inventory-Management-System
   cd Inventory-Management-System/backend
   ```

2. **Create & activate a virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate       # On Windows
   source venv/bin/activate    # On macOS/Linux
   ```

3. **Install dependencies:**
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt cors-headers 
   ```

4. **Apply migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create a superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

   Server runs at 👉 `http://127.0.0.1:8000/`

---

### ⚛️ Frontend Setup (React)

1. **Navigate to the frontend folder:**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install axios react-router styled-components recharts
   ```

3. **Start the React development server:**
   ```bash
   npm run dev
   ```

   App runs at 👉 `http://localhost:5173/`

---

## 🔐 **Authentication Flow**

This project uses **JWT Authentication** for secure login and protected routes.

| Endpoint | Method | Description |
|-----------|--------|-------------|
| `/api/register/` | POST | Register a new user |
| `/api/login/` | POST | Obtain JWT access + refresh tokens |
| `/api/token/refresh/` | POST | Refresh access token |

Example:
```json
POST /api/register/
{
  "username": "user",
  "email": "user@example.com",
  "password": "user@123"
}
```

---

## 📊 **API Endpoints**

| Endpoint | Method | Description |
|-----------|--------|-------------|
| `/api/products/` | GET | List all products |
| `/api/products/` | POST | Add a new product |
| `/api/products/<id>/` | PUT | Update product details |
| `/api/products/<id>/` | DELETE | Delete a product |
| `/api/orders/` | GET | View all orders |
| `/api/orders/` | POST | Create a new order |
| `/api/orders/<id>/` | PUT | Update a new order |
| `/api/orders/<id>/` | DELETE | Delete a new order |
|`/api/categories/` | GET | View all category |
| `/api/categories/` | POST | Create a new category |
| `/api/categories/<id>/` | DELETE | Delete a new category |
|`/api/inventory/` | GET | View all inventory |
| `/api/dashboard/` | GET | Fetch summary counts and chart data |

---

## 🧠 **Features**

✅ Product & Category Management  
✅ Real-time Inventory Tracking  
✅ Prevent Duplicate SKUs  
✅ Order Management Module  
✅ JWT Authentication  
✅ Interactive Charts & Reports  
✅ Responsive React UI  

---

## 🧩 **Testing**

Run backend tests:
```bash
python manage.py test
```

Tests include:
- Product creation and SKU validation
- Order creation and stock updates
- Authentication & permissions

---

## 🧱 **Best Practices Implemented**

- Custom **Exception Handling**  
- **Modular Django app structure**  
- **JWT Authentication** for security  
- **Optimized queries** for performance  
- **Frontend state management** with React hooks  
- **Form validation** and error feedback (e.g., SKU duplicate warning)   

---

## 📸 **Visual Overview**

- **Dashboard:** Overview of product counts and sales trends  
- **Products Page:** Add, edit, or remove products  
- **Orders Page:** Manage customer orders in real-time  
- **Reports/Charts:** Visualize product categories and sales performance  
