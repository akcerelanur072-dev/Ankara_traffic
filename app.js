// GMT458 Web GIS - Frontend
console.log("App.js yüklendi");

// Global değişkenler
let map = null;
let markersLayer = null;
let currentUser = null;
let authToken = null;
const API_BASE = 'http://localhost:3000/api';

// Sayfa yüklenince
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM hazır, başlatılıyor...");
    
    initMap();
    setupEvents();
    checkSavedLogin();
    
    // 2 saniye sonra olayları yükle
    setTimeout(loadIncidents, 2000);
});

// Haritayı başlat
function initMap() {
    console.log("Harita başlatılıyor...");
    
    try {
        map = L.map('map').setView([39.9334, 32.8597], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
        
        markersLayer = L.layerGroup().addTo(map);
        
        // DEBUG: Test marker ekle
        L.marker([39.9334, 32.8597])
            .addTo(markersLayer)
            .bindPopup("<b>Test Marker</b><br>Harita çalışıyor!")
            .openPopup();
        
        // Haritaya tıklayınca olay ekle
        map.on('click', function(e) {
            console.log("Haritaya tıklandı:", e.latlng);
            if (currentUser) {
                addNewIncident(e.latlng);
            } else {
                alert("Önce giriş yapmalısınız!");
            }
        });
        
        console.log("Harita başarıyla başlatıldı");
        
    } catch (error) {
        console.error("Harita hatası:", error);
        alert("Harita yüklenemedi: " + error.message);
    }
}

// Event'leri kur
function setupEvents() {
    console.log("Event'ler kuruluyor...");
    
    document.getElementById('btnLogin').addEventListener('click', handleLogin);
    document.getElementById('btnSignup').addEventListener('click', handleSignup);
    document.getElementById('btnLogout').addEventListener('click', handleLogout);
    document.getElementById('btnRefresh').addEventListener('click', loadIncidents);
    
    // Arama kutusuna Enter basınca
    document.getElementById('query').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') loadIncidents();
    });
    
    console.log("Event'ler kuruldu");
}

// Kayıtlı login kontrolü
function checkSavedLogin() {
    const savedToken = localStorage.getItem('gmt458_token');
    const savedUser = localStorage.getItem('gmt458_user');
    
    if (savedToken && savedUser) {
        try {
            authToken = savedToken;
            currentUser = JSON.parse(savedUser);
            updateUI();
            console.log("Oturum geri yüklendi:", currentUser.username);
        } catch (e) {
            console.error("Kayıtlı oturum hatası:", e);
            localStorage.clear();
        }
    }
}

// Giriş yap
async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        alert("Kullanıcı adı ve şifre girin!");
        return;
    }
    
    console.log("Login deneniyor:", username);
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                emailOrUsername: username,
                password: password
            })
        });
        
        console.log("Login response:", response.status);
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            
            // LocalStorage'e kaydet
            localStorage.setItem('gmt458_token', authToken);
            localStorage.setItem('gmt458_user', JSON.stringify(currentUser));
            
            updateUI();
            loadIncidents();
            alert(`Hoş geldiniz ${currentUser.username}!`);
            
        } else {
            alert("Giriş başarısız: " + (data.error || "Bilinmeyen hata"));
        }
        
    } catch (error) {
        console.error("Login hatası:", error);
        alert("Sunucu hatası: " + error.message);
    }
}

// Kayıt ol
async function handleSignup() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        alert("Kullanıcı adı ve şifre girin!");
        return;
    }
    
    const email = prompt("E-posta adresiniz:");
    if (!email) return;
    
    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                role: 'user'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
            document.getElementById('password').value = '';
        } else {
            alert("Kayıt başarısız: " + (data.error || "Bilinmeyen hata"));
        }
        
    } catch (error) {
        console.error("Signup hatası:", error);
        alert("Sunucu hatası!");
    }
}

// Çıkış yap
function handleLogout() {
    authToken = null;
    currentUser = null;
    
    localStorage.removeItem('gmt458_token');
    localStorage.removeItem('gmt458_user');
    
    updateUI();
    markersLayer.clearLayers();
    
    alert("Çıkış yapıldı!");
    console.log("Kullanıcı çıkış yaptı");
}

// UI'yi güncelle
function updateUI() {
    const statusEl = document.getElementById('status');
    
    if (currentUser) {
        statusEl.textContent = `${currentUser.username} (${currentUser.role})`;
        statusEl.style.color = "#28a745";
        
        // Butonları göster/gizle
        document.getElementById('btnLogin').style.display = 'none';
        document.getElementById('btnSignup').style.display = 'none';
        document.getElementById('btnLogout').style.display = 'inline-block';
        
    } else {
        statusEl.textContent = "Giriş yapılmadı";
        statusEl.style.color = "#dc3545";
        
        document.getElementById('btnLogin').style.display = 'inline-block';
        document.getElementById('btnSignup').style.display = 'inline-block';
        document.getElementById('btnLogout').style.display = 'none';
    }
}

// Olayları yükle
async function loadIncidents() {
    console.log("Olaylar yükleniyor...");
    
    if (!markersLayer) {
        console.error("Markers layer hazır değil!");
        return;
    }
    
    // Clear existing markers
    markersLayer.clearLayers();
    
    const category = document.getElementById('layerSelect').value;
    const searchQuery = document.getElementById('query').value.trim();
    
    // Build URL with query parameters
    let url = `${API_BASE}/incidents`;
    const params = new URLSearchParams();
    
    if (category !== 'all') {
        params.append('category', category);
    }
    
    if (searchQuery) {
        params.append('search', searchQuery);
    }
    
    // Add bounding box if map is ready
    if (map) {
        const bounds = map.getBounds();
        const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
        params.append('bbox', bbox);
    }
    
    if (params.toString()) {
        url += '?' + params.toString();
    }
    
    console.log("Fetch URL:", url);
    
    try {
        const response = await fetch(url);
        console.log("Response status:", response.status);
        
        if (response.ok) {
            const incidents = await response.json();
            console.log(`Gelen olay sayısı: ${incidents.length}`);
            displayIncidents(incidents);
            
        } else {
            console.error("API error:", response.status, await response.text());
        }
        
    } catch (error) {
        console.error("Olay yükleme hatası:", error);
    }
}

// Olayları haritada göster
function displayIncidents(incidents) {
    if (!incidents || !Array.isArray(incidents)) {
        console.log("Geçersiz olay verisi");
        return;
    }
    
    if (incidents.length === 0) {
        console.log("Gösterilecek olay yok");
        return;
    }
    
    incidents.forEach((incident, index) => {
        if (!incident.location || !incident.location.coordinates) {
            console.error(`Olay ${index + 1} location eksik:`, incident);
            return;
        }
        
        // MongoDB: [longitude, latitude]
        // Leaflet: [latitude, longitude]
        const [lng, lat] = incident.location.coordinates;
        
        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
            console.error(`Olay ${index + 1} geçersiz koordinat:`, incident);
            return;
        }
        
        // Create marker
        const marker = L.marker([lat, lng], {
            icon: getIconForCategory(incident.category)
        }).addTo(markersLayer);
        
        // Create popup content
        const popupContent = `
            <div style="min-width: 200px;">
                <strong style="color: #2c3e50;">${incident.title || 'Başlıksız'}</strong><br>
                <small style="color: #666;">Kategori: ${incident.category || 'diğer'}</small>
                ${incident.description ? `<hr style="margin: 5px 0;"><p>${incident.description}</p>` : ''}
                ${incident.createdBy?.username ? `<small style="color: #888;">Ekleyen: ${incident.createdBy.username}</small>` : ''}
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // Log for debugging
        if (index < 3) { // İlk 3 olayı logla
            console.log(`Marker ${index + 1}: "${incident.title}" @ [${lat}, ${lng}]`);
        }
    });
    
    console.log(`${incidents.length} marker haritaya eklendi`);
}

// Kategoriye göre icon oluştur
function getIconForCategory(category) {
    let color = '#3388ff'; // default blue
    
    switch(category) {
        case 'traffic': color = '#ff6600'; break; // orange
        case 'security': color = '#dc3545'; break; // red
        case 'maintenance': color = '#28a745'; break; // green
        case 'other': color = '#6c757d'; break; // gray
    }
    
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -8]
    });
}

// Yeni olay ekle
async function addNewIncident(latlng) {
    console.log("Yeni olay ekleniyor:", latlng);
    
    if (!authToken) {
        alert("Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.");
        return;
    }
    
    const title = prompt("Olay başlığı:");
    if (!title) return;
    
    const description = prompt("Açıklama (isteğe bağlı):", "");
    const category = prompt("Kategori (traffic, security, maintenance, other):", "other");
    
    try {
        const response = await fetch(`${API_BASE}/incidents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: title,
                description: description,
                category: category,
                lng: latlng.lng,
                lat: latlng.lat
            })
        });
        
        console.log("POST response:", response.status);
        
        if (response.ok) {
            const newIncident = await response.json();
            console.log("Yeni olay eklendi:", newIncident);
            
            // Immediately add marker for visual feedback
            if (newIncident.location?.coordinates) {
                const [lng, lat] = newIncident.location.coordinates;
                const marker = L.marker([lat, lng], {
                    icon: getIconForCategory(category)
                }).addTo(markersLayer);
                
                marker.bindPopup(`<b>${title}</b><br>Yeni eklendi!`).openPopup();
            }
            
            alert("Olay başarıyla eklendi!");
            
            // Reload all incidents after 2 seconds
            setTimeout(loadIncidents, 2000);
            
        } else {
            const error = await response.json();
            console.error("API error:", error);
            alert("Olay eklenemedi: " + (error.error || "Bilinmeyen hata"));
        }
        
    } catch (error) {
        console.error("Olay ekleme hatası:", error);
        alert("Sunucu hatası: " + error.message);
    }
}

// Debug fonksiyonu
window.debugInfo = function() {
    console.log("=== DEBUG INFO ===");
    console.log("Map:", map ? "Hazır" : "Yok");
    console.log("User:", currentUser);
    console.log("Token:", authToken ? "Var (" + authToken.substring(0, 20) + "...)" : "Yok");
    console.log("Markers:", markersLayer ? markersLayer.getLayers().length + " adet" : "Yok");
    
    // Test API
    fetch(`${API_BASE}/health`)
        .then(r => r.json())
        .then(data => console.log("Health check:", data))
        .catch(err => console.error("Health error:", err));
    
    fetch(`${API_BASE}/incidents`)
        .then(r => {
            console.log("Incidents status:", r.status, r.statusText);
            return r.json();
        })
        .then(data => {
            console.log("Total incidents:", Array.isArray(data) ? data.length : "Invalid data");
            if (Array.isArray(data)) {
                data.slice(0, 5).forEach((inc, i) => {
                    console.log(`  ${i+1}. ${inc.title || 'No title'} - ${inc.category || 'No category'}`);
                    if (inc.location?.coordinates) {
                        console.log(`     Coords: [${inc.location.coordinates[1]}, ${inc.location.coordinates[0]}]`);
                    }
                });
            }
        })
        .catch(err => console.error("Incidents error:", err));
};