document.addEventListener('DOMContentLoaded', () => {
    // Check Authentication
    checkAuth();

    // Initialize Sidebar Navigation
    initNavigation();

    // Initialize Dashboard Data
    initDashboard();

    // Handle Logout
    document.getElementById('logout-btn').addEventListener('click', logout);
});

function checkAuth() {
    const user = localStorage.getItem('crime_ai_user');
    if (!user && window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

function logout() {
    localStorage.removeItem('crime_ai_user');
    window.location.href = '/login';
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const targetId = link.id.replace('nav-', 'section-');
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                // Update nav state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Update section visibility
                sections.forEach(s => s.classList.remove('active'));
                targetSection.classList.add('active');

                // Special handling for maps when sections become visible
                if (targetId === 'section-dashboard') {
                    if (window.mainMap) window.mainMap.invalidateSize();
                } else if (targetId === 'section-map') {
                    initFullMap();
                } else if (targetId === 'section-predictions') {
                    initPredictionMap();
                }
            }
        });
    });

    // Handle profile click
    document.getElementById('sidebar-user-profile').addEventListener('click', () => {
        document.getElementById('nav-admin').click();
    });

    // Update display name
    const storedUser = localStorage.getItem('crime_ai_user');
    if (storedUser) {
        document.getElementById('display-username').innerText = storedUser;
        if (document.getElementById('admin-name-span')) {
            document.getElementById('admin-name-span').innerText = storedUser;
        }
    }
}

function initDashboard() {
    initMap();
    initCharts();
    fetchStats();
    initCrimeSubmission();
}

function initCrimeSubmission() {
    const form = document.getElementById('crime-entry-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const crimeData = {
            type: document.getElementById('entry-type').value,
            date: document.getElementById('entry-date').value.replace('T', ' ') + ':00',
            location: document.getElementById('entry-location-text').value,
            lat: parseFloat(document.getElementById('entry-lat').value),
            lng: parseFloat(document.getElementById('entry-lng').value),
            description: document.getElementById('entry-desc').value
        };

        try {
            const response = await fetch('/api/crimes/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(crimeData)
            });

            if (response.ok) {
                alert('Crime report submitted successfully!');
                form.reset();
                fetchStats(); // Refresh dashboard and tables
            } else {
                alert('Error submitting report.');
            }
        } catch (error) {
            console.error('Submission error:', error);
        }
    });
}

async function initMap() {
    // Default to India coordinates
    const map = L.map('map').setView([20.5937, 78.9629], 5);
    window.mainMap = map; // Store map instance globally if needed for invalidateSize

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    try {
        const response = await fetch('http://localhost:5000/api/hotspots');
        const data = await response.json();

        if (data.hotspots) {
            data.hotspots.forEach((spot, index) => {
                L.circle([spot.lat, spot.lng], {
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    fillOpacity: 0.4,
                    radius: 1200
                }).addTo(map).bindPopup(`<b>AI Identified Hotspot #${index + 1}</b><br>High risk of criminal activity predicted in this area.`);
            });
        }
    } catch (error) {
        console.error('Error loading hotspots:', error);
    }
}

function initCharts() {
    // Trend Chart for Trends Page
    const ctxTrendFull = document.getElementById('trendChartFull').getContext('2d');
    new Chart(ctxTrendFull, {
        type: 'line',
        data: {
            labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
            datasets: [{
                label: 'National Crime Statistics (India)',
                data: [420000, 450000, 410000, 480000, 520000, 490000],
                borderColor: '#3b82f6',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            },
            plugins: {
                legend: { labels: { color: '#94a3b8' } }
            }
        }
    });
}

async function fetchStats() {
    try {
        const response = await fetch('http://localhost:5000/api/crimes');
        const data = await response.json();

        if (data.crimes) {
            window.allCrimes = data.crimes;

            // Update Dashboard Stats to match PDF
            document.getElementById('crime-records-count').innerText = data.count.toLocaleString();
            document.getElementById('open-cases-count').innerText = data.crimes.filter(c => !c.arrested).length;
            document.getElementById('total-officers').innerText = "42"; // Mocked as per doc
            document.getElementById('hotspots-count').innerText = "14"; // Mocked as per doc

            renderRecordsTable(data.crimes);

            // Update charts
            const types = data.crimes.reduce((acc, crime) => {
                acc[crime.crime_type] = (acc[crime.crime_type] || 0) + 1;
                return acc;
            }, {});

            updateTypeChart(Object.keys(types), Object.values(types));

            // Setup filter listener
            document.getElementById('crime-filter').addEventListener('change', (e) => {
                const filterValue = e.target.value;
                const filtered = filterValue === 'ALL'
                    ? window.allCrimes
                    : window.allCrimes.filter(c => c.crime_type === filterValue);
                renderRecordsTable(filtered);
            });
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

function renderRecordsTable(crimes) {
    const tbody = document.getElementById('records-body');
    tbody.innerHTML = '';
    crimes.forEach(crime => {
        const row = `
            <tr>
                <td>${crime.crime_id}</td>
                <td>${crime.crime_type}</td>
                <td>${new Date(crime.occurrence_date).toLocaleDateString()}</td>
                <td>${crime.latitude.toFixed(4)}, ${crime.longitude.toFixed(4)}</td>
                <td><span class="badge badge-warning">Pending</span></td>
                <td><span class="badge ${crime.arrested ? 'badge-success' : 'badge-danger'}">${crime.arrested ? 'Yes' : 'No'}</span></td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function initFullMap() {
    if (window.fullMapInstance) {
        window.fullMapInstance.invalidateSize();
        return;
    }

    const map = L.map('full-map').setView([20.5937, 78.9629], 5);
    window.fullMapInstance = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    // Fetch and show markers
    fetch('http://localhost:5000/api/crimes')
        .then(res => res.json())
        .then(data => {
            if (data.crimes) {
                data.crimes.forEach(crime => {
                    L.circleMarker([crime.latitude, crime.longitude], {
                        radius: 8,
                        fillColor: "#3b82f6",
                        color: "#fff",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).addTo(map)
                        .bindPopup(`
                            <div style="font-family: 'Inter';">
                                <b style="color: #3b82f6;">${crime.crime_type}</b><br>
                                <small style="color: #64748b;">${new Date(crime.occurrence_date).toLocaleDateString()}</small><br>
                                <p style="margin-top: 5px; font-size: 0.8rem;">${crime.description}</p>
                            </div>
                        `);
                });
            }
        });
}

function initPredictionMap() {
    if (window.predMap) {
        window.predMap.invalidateSize();
        return;
    }

    const map = L.map('prediction-map').setView([20.5937, 78.9629], 5);
    window.predMap = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    fetch('http://localhost:5000/api/hotspots')
        .then(res => res.json())
        .then(data => {
            if (data.hotspots) {
                data.hotspots.forEach(spot => {
                    L.circle([spot.lat, spot.lng], {
                        color: '#ef4444',
                        fillColor: '#ef4444',
                        fillOpacity: 0.6,
                        radius: 2000
                    }).addTo(map).bindPopup("<b>High Risk Predictive Hotspot</b>");
                });
            }
        });
}

function updateTypeChart(labels, values) {
    const ctxType = document.getElementById('typeChart').getContext('2d');
    if (window.typeChartInstance) {
        window.typeChartInstance.destroy();
    }
    window.typeChartInstance = new Chart(ctxType, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8' }
                }
            }
        }
    });
}
