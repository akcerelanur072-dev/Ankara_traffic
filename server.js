require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const incidentRoutes = require("./routes/incidents");
const { swaggerUi, swaggerSpec } = require("./swagger");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);

// Swagger
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MongoDB URI eksik!");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB bağlandı");
    app.listen(PORT, () => {
      console.log(`✅ Server: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB hatası:", err.message);
    process.exit(1);
  });