// routes/incidents.js
const express = require("express");
const router = express.Router();
const Incident = require("../models/Incident");

// GET /api/incidents - HERKESE AÇIK
router.get("/", async (req, res) => {
    try {
        console.log("GET /incidents çağrıldı");
        
        let query = {};
        
        // Kategori filtresi
        if (req.query.category && req.query.category !== 'all') {
            query.category = req.query.category;
        }
        
        // Arama
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        // Olayları getir
        const incidents = await Incident.find(query)
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 })
            .limit(100);
        
        console.log(`${incidents.length} olay bulundu`);
        res.json(incidents);
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/incidents - YENİ OLAY
router.post("/", async (req, res) => {
    try {
        console.log("POST /incidents");
        console.log("Body:", req.body);
        
        const { title, description, category, lng, lat } = req.body;
        
        // Basit validation
        if (!title || !lng || !lat) {
            return res.status(400).json({ error: "Title ve koordinatlar gerekiyor" });
        }
        
        // Auth kontrolü (basit)
        const authHeader = req.headers.authorization;
        let userId = null;
        
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.slice(7);
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                console.log("Invalid token, creating anonymous incident");
            }
        }
        
        // Olay oluştur
        const incident = new Incident({
            title: title.trim(),
            description: description ? description.trim() : "",
            category: category || "other",
            location: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            createdBy: userId || "anonymous"
        });
        
        const saved = await incident.save();
        console.log("Olay kaydedildi:", saved._id);
        
        res.status(201).json(saved);
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Basit auth middleware (jwt için)
const jwt = require("jsonwebtoken");

module.exports = router;