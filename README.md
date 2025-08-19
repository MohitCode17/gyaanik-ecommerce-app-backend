# 📚 Bookstore Backend  

This is the backend service for the **MERN Bookstore App**.  
It provides REST APIs for managing books, authentication, cart, and orders.  
Built with **Node.js, Express, MongoDB, and JWT**.  

---

## 🚀 Features  

- 🔐 User Authentication (Register/Login with JWT)  
- 📚 Book Management (CRUD operations)  
- 🛒 Cart Management  
- 📦 Order Placement  
- 🔑 Secure Password Hashing with **bcrypt**  
- ⚡ Middleware for authentication & error handling  

---

## 📂 Folder Structure  

/backend
├── config/         # DB connection & environment setup  
├── controllers/    # Logic for handling requests  
├── models/         # MongoDB schemas  
├── routes/         # API routes  
├── middlewares/    # Auth & error handling middleware  
├── utils/          # Helper functions  
├── server.js       # Entry point  
└── package.json    # Dependencies & scripts  

---

## ⚙️ Installation & Setup

# Clone the repository

```bash
git clone git@github.com:MohitCode17/gyaanik-ecommerce-app-backend.git
```

# Go to backend folder

```bash
cd backend
```

# Install dependencies

```bash
npm install
```

# Create .env file and add:

```bash
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
```

# Start development server

```bash
npm run dev
```

---

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (git checkout -b feature-xyz)
3. Commit changes (git commit -m "Added xyz feature")
4. Push to branch (git push origin feature-xyz)
5. Open a Pull Request
