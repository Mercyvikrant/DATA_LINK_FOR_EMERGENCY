# 🛰️ DATA LINK FOR EMERGENCY

## 🚨 Overview

**DATA LINK FOR EMERGENCY** is a tactical data communication system designed to enable **secure, real-time communication and coordination** among field units and command centers during emergencies or military operations.  

It provides a **robust communication link** for transmitting critical information (like emergency alerts, tactical updates, and unit statuses) using web-based interfaces powered by **Node.js**, **Express**, **Socket.IO**, and **MongoDB**.

The system ensures fast, authenticated, and reliable message exchange even under challenging conditions, serving as a **prototype for modern tactical data link systems**.

---

## 🌍 Real-Life Applications

This project can be adapted for:

- 🧑‍🚒 **Disaster management:** Rapid communication between rescue teams and central command during natural disasters.
- 🪖 **Military coordination:** Secure tactical data link for ground, air, or naval forces.
- 🚑 **Emergency response systems:** Linking hospitals, ambulances, and control rooms.
- 🛰️ **Field operations:** Live communication for NGOs, defense operations, and crisis management systems.
- 🏙️ **Smart city safety networks:** Integrating sensor alerts, surveillance feeds, and emergency services.

---

## 🧱 System Architecture

```
Frontend (React or HTML interface)
        ⬇️
Backend (Node.js + Express)
        ⬇️
Socket.IO (Real-time Communication)
        ⬇️
MongoDB (Data Storage)
```

### Key Components
- **Frontend:** Displays active units, message threads, and emergency alerts.
- **Backend:** Handles REST APIs, user authentication, and Socket.IO real-time data channels.
- **Database:** MongoDB stores user profiles, units, messages, and emergency events.
- **Middleware:** Authentication layer for JWT-based user verification.

---

## ⚙️ Features

✅ Secure authentication with JWT  
✅ Real-time communication via Socket.IO  
✅ Unit and user management (Admins, Units, Field Users)  
✅ Emergency alerts broadcasting  
✅ Message logging and tracking  
✅ Scalable Node.js + Express server  
✅ MongoDB for persistent data storage  

---

## 🗂️ Folder Structure

```
tactical-datalink-system/
│
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection setup
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── models/
│   │   ├── Emergency.js        # Schema for emergency events
│   │   ├── Message.js          # Schema for message transmission
│   │   ├── Unit.js             # Schema for tactical units
│   │   └── User.js             # Schema for registered users
│   ├── routes/
│   │   └── (API files)         # Define REST API endpoints
│   ├── server.js               # Main backend server file
│   └── package.json            # Backend dependencies
│
└── README.md (you are here)
```

---

## 🧩 Core Backend Logic

### **server.js**
- Initializes **Express** server and connects to MongoDB.
- Sets up **Socket.IO** for real-time bidirectional communication.
- Handles incoming messages and broadcasts them to connected clients.

### **db.js**
- Connects to MongoDB using Mongoose.
- Exports the database connection instance.

### **auth.js**
- Middleware that verifies JSON Web Tokens (JWT).
- Ensures that only authorized users can access certain routes.

### **Models**
- **User.js** – Stores user credentials and role (admin/unit/operator).  
- **Unit.js** – Represents a tactical unit with location and status.  
- **Message.js** – Stores messages sent between units or to command center.  
- **Emergency.js** – Records emergency incidents and broadcasts.

---

## 💻 Installation & Setup

### **1️⃣ Clone the repository**
```bash
git clone https://github.com/Mercyvikrant/DATA_LINK_FOR_EMERGENCY.git
cd DATA_LINK_FOR_EMERGENCY/tactical-datalink-system/backend
```

### **2️⃣ Install dependencies**
```bash
npm install
```

### **3️⃣ Setup environment variables**
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### **4️⃣ Run the server**
```bash
node server.js
```
or (for development)
```bash
nodemon server.js
```

---

## 🔗 API Overview

| Method | Endpoint | Description |
|---------|-----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate user & get JWT |
| `GET`  | `/api/units` | Get all tactical units |
| `POST` | `/api/message` | Send a new message |
| `GET`  | `/api/emergency` | Fetch emergency events |

---

## ⚡ Real-Time Communication Flow

1. **User A** sends a message via frontend.  
2. Backend emits the message via **Socket.IO**.  
3. **All connected users** instantly receive the update without refreshing.  
4. Message is logged in **MongoDB** for history.

---

## 🛡️ Security Features

- Encrypted JWT-based authentication  
- Controlled access to APIs  
- Database input validation  
- Centralized error handling  
- Can be extended to HTTPS + military-grade encryption  

---

## 🚀 Future Enhancements

🔹 Integrate GPS tracking for field units  
🔹 Add offline-first message caching  
🔹 End-to-end encryption for sensitive data  
🔹 AI-based emergency prioritization  
🔹 WebRTC for live video communication  

---

## 📚 Technologies Used

| Category | Tools |
|-----------|--------|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **Real-Time** | Socket.IO |
| **Security** | JWT Authentication |
| **Version Control** | Git & GitHub |

---

## 🤝 Contributing

Contributions are welcome!  
If you’d like to add new features, improve UI, or refactor code:
1. Fork the repo  
2. Create a feature branch  
3. Commit your changes  
4. Open a Pull Request  

---

## 🧾 License

This project is licensed under the **MIT License**.  
Feel free to use, modify, and distribute with attribution.

---

## ✍️ Author

**Developed by:** [Mercyvikrant](https://github.com/Mercyvikrant)  
📧 *Contact for collaboration, suggestions, or research opportunities.*

---

## 🌟 Acknowledgements

Special thanks to mentors, open-source libraries, and frameworks that made this project possible.
