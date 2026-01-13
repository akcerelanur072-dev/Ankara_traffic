# Ankara_traffic
Real-time traffic monitoring system with geospatial capabilities. Tech stack: Node.js, Express, MongoDB, Mongoose ODM, JWT authentication, Leaflet.js, Swagger API docs. Implements spatial queries, user role management, and responsive UI design.

<img width="1917" height="904" alt="image" src="https://github.com/user-attachments/assets/0f3ad0ea-ac08-4e43-8374-bc9b9485979f" />

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://ankaratraffic.netlify.app)
[![GitHub License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

A comprehensive real-time traffic monitoring and incident reporting Web GIS application for the city of Ankara. This full-stack application combines interactive mapping with user management to create a collaborative platform for urban traffic management.

## ✨ Features

### 🗺️ Interactive Mapping
- **Real-time incident visualization** on interactive Leaflet.js maps
- **Category-based filtering** (Accidents, Traffic, Roadworks, Emergencies)
- **Custom marker icons** with color coding for different incident types
- **Geolocation support** and map controls

### 👥 User Management
- **Multi-role system** (Guest, User, Admin)
- **JWT-based authentication** with secure sessions
- **Role-based permissions** and access control
- **User profiles** and activity tracking

### 🔧 CRUD Operations
- **Create**: Report new incidents via map clicks or forms
- **Read**: View incidents with detailed popups and filtering
- **Update**: Modify incident details and status
- **Delete**: Remove incidents with permission-based controls

### 🏗️ Technical Features
- **RESTful API** with Swagger documentation
- **Spatial database queries** using MongoDB geospatial indexing
- **Real-time updates** without page refresh
- **Responsive design** for mobile and desktop

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or MongoDB Atlas)
- Modern web browser

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/ankara-traffic-webgis.git
cd ankara-traffic-webgis

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the development server
npm run dev

# Open http://localhost:3000 in your browser

ankara-traffic-webgis/
├── src/
│   ├── models/              # MongoDB schemas
│   │   ├── User.js         # User model with auth
│   │   └── Incident.js     # Incident model with geospatial data
│   ├── middleware/         # Express middleware
│   │   └── auth.js        # JWT authentication
│   ├── routes/            # API routes
│   │   ├── auth.js       # Authentication endpoints
│   │   └── incidents.js  # Incident CRUD operations
│   └── public/           # Frontend files
│       ├── index.html    # Main application
│       ├── app.js        # Client-side logic
│       └── assets/       # Images, styles, etc.
├── server.js             # Express server configuration
├── package.json          # Dependencies and scripts
├── swagger.js           # API documentation setup
├── .env.example         # Environment template
└── README.md           # This file
