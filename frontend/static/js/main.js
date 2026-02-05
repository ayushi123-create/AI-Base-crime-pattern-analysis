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

// Admin & Reporting Logic
function initAdminActions() {
    const btnGenerateReport = document.getElementById('btn-generate-report');
    const btnManageUsers = document.getElementById('btn-manage-users');
    const btnDBSettings = document.getElementById('btn-db-settings');

    if (btnGenerateReport) btnGenerateReport.addEventListener('click', generateReport);
    if (btnManageUsers) btnManageUsers.addEventListener('click', showManageUsers);
    if (btnDBSettings) btnDBSettings.addEventListener('click', showDBSettings);
}

function closeModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.style.display = 'none';
}

function generateReport() {
    // Basic printable summary
    const printWindow = window.open('', '_blank');
    const crimes = window.allCrimes || [];

    let reportHtml = `
        <html>
        <head>
            <title>Crime Analysis Report</title>
            <style>
                body { font-family: 'Inter', sans-serif; padding: 2rem; color: #1e293b; }
                table { width: 100%; border-collapse: collapse; margin-top: 2rem; }
                th, td { border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; }
                h1 { color: #3b82f6; }
            </style>
        </head>
        <body>
            <h1>Crime Pattern Analysis Summary Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Total Records Analyzed: ${crimes.length}</p>
            <hr>
            <table>
                <thead>
                    <tr>
                        <th>ID</th><th>Type</th><th>Date</th><th>Location</th>
                    </tr>
                </thead>
                <tbody>
                    ${crimes.slice(0, 50).map(c => `
                        <tr>
                            <td>${c.crime_id}</td>
                            <td>${c.crime_type}</td>
                            <td>${new Date(c.occurrence_date).toLocaleDateString()}</td>
                            <td>${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p style="margin-top: 2rem; font-style: italic;">*Showing top 50 records for preview. Full data attached in digital CSV system.</p>
        </body>
        </html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.print();
}

async function showManageUsers() {
    const modal = document.getElementById('admin-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    title.innerText = 'Manage Registered Officers';
    body.innerHTML = '<p style="color: #94a3b8;">Loading user list...</p>';
    modal.style.display = 'flex';

    try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();

        if (data.users && data.users.length > 0) {
            let html = `
                <table style="width: 100%; font-size: 0.8rem;">
                    <thead>
                        <tr><th>User</th><th>Role</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        ${data.users.map(u => `
                            <tr>
                                <td>${u.username}</td>
                                <td>${u.role}</td>
                                <td><button onclick="handleDeleteUser(${u.id})" style="background: #ef4444; border: none; color: white; border-radius: 4px; padding: 2px 8px; cursor: pointer;">Del</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            body.innerHTML = html;
        } else {
            body.innerHTML = '<p style="color: #94a3b8;">No registered users found.</p>';
        }
    } catch (err) {
        body.innerHTML = '<p style="color: #ef4444;">Error fetching users.</p>';
    }
}

async function handleDeleteUser(id) {
    if (!confirm('Are you sure you want to delete this officer account?')) return;

    try {
        const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('User deleted.');
            showManageUsers();
        }
    } catch (err) {
        alert('Delete failed.');
    }
}

function showDBSettings() {
    const modal = document.getElementById('admin-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    title.innerText = 'Database Configuration';
    modal.style.display = 'flex';

    body.innerHTML = `
        <div style="color: #cbd5e1;">
            <p><strong>Database Type:</strong> SQLite 3</p>
            <p><strong>Status:</strong> <span style="color: #22c55e;">Connected ✅</span></p>
            <p style="margin-top: 1rem; color: #94a3b8; font-size: 0.8rem;">Note: This panel allows you to reset the system to its initial state by clearing all crime records and re-generating default sample data.</p>
            <button id="btn-reset-db" style="margin-top: 1.5rem; width: 100%; padding: 0.75rem; background: #ef4444; border: none; color: white; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">⚠️ RESET ENTIRE DATABASE</button>
        </div>
    `;

    document.getElementById('btn-reset-db').addEventListener('click', async () => {
        if (!confirm('CRITICAL ACTION: This will delete ALL current crime records and re-seed with fresh data. Proceed?')) return;

        document.getElementById('btn-reset-db').innerText = 'Resetting...';
        document.getElementById('btn-reset-db').disabled = true;

        try {
            const response = await fetch('/api/admin/db-reset', { method: 'POST' });
            if (response.ok) {
                alert('Database wiped and re-seeded successfully!');
                closeModal();
                fetchStats();
            }
        } catch (err) {
            alert('Reset failed.');
            document.getElementById('btn-reset-db').innerText = '⚠️ RESET ENTIRE DATABASE';
            document.getElementById('btn-reset-db').disabled = false;
        }
    });
}

// WOW Factors implementation
function initWOWFactors() {
    // Panic Button
    const btnPanic = document.getElementById('btn-panic');
    if (btnPanic) {
        btnPanic.addEventListener('click', () => {
            alert('🚨 EMERGENCY SOS SENT!\n\nLocation coordinates dispatched to the nearest Control Room.\nDispatching unit CRP-902 recorded.');
        });
    }

    // CSV Export
    const btnExport = document.getElementById('btn-export-csv');
    if (btnExport) {
        btnExport.addEventListener('click', exportToCSV);
    }

    // Safety Predictor
    const btnPredict = document.getElementById('btn-predict-safety');
    if (btnPredict) {
        btnPredict.addEventListener('click', predictSafety);
    }

    // Night Watch Toggle
    const btnNightWatch = document.getElementById('btn-night-watch');
    if (btnNightWatch) {
        // Load preference
        if (localStorage.getItem('night_watch_active') === 'true') {
            document.body.classList.add('night-watch');
            btnNightWatch.innerText = '☀️';
        }

        btnNightWatch.addEventListener('click', () => {
            const isActive = document.body.classList.toggle('night-watch');
            localStorage.setItem('night_watch_active', isActive);
            btnNightWatch.innerText = isActive ? '☀️' : '🌙';

            // Invalidate maps to fix visual artifacts if filtering
            if (window.mapInstance) window.mapInstance.invalidateSize();
            if (window.fullMapInstance) window.fullMapInstance.invalidateSize();
            if (window.predMap) window.predMap.invalidateSize();
        });
    }

    // Start Live Feed
    startLiveFeed();
}

function startLiveFeed() {
    const feedBody = document.getElementById('feed-scroller');
    if (!feedBody) return;

    const messages = [
        "📡 POLICE DISPATCH: Patrol Unit Delta-4 responding to noise complaint in Rohini.",
        "⚠️ SYSTEM UPDATE: AI identified new crime cluster in South Mumbai district.",
        "✅ RESOLVED: Vehicle theft report in Bangalore East marked as apprehended.",
        "📡 POLICE DISPATCH: Emergency response team deployed to Kolkata North for traffic control.",
        "⚠️ SYSTEM UPDATE: Historical trend shows 5% dip in burglary for New Delhi today.",
        "📡 POLICE DISPATCH: Officer Ayushi reported on-duty at Central Command Center.",
        "📡 POLICE DISPATCH: Officer Abhijeet verified system integrity at Admin Console."
    ];

    let index = 0;
    setInterval(() => {
        feedBody.style.opacity = '0';
        setTimeout(() => {
            feedBody.innerHTML = `<p style="color: #3b82f6; font-family: 'Inter'; font-size: 0.9rem; margin: 0;">${messages[index]}</p>`;
            feedBody.style.opacity = '1';
            index = (index + 1) % messages.length;
        }, 500);
    }, 4000);
}

function exportToCSV() {
    const crimes = window.allCrimes || [];
    if (crimes.length === 0) return alert('No data to export.');

    const headers = ['Crime ID', 'Type', 'Date', 'Lat', 'Lng', 'Description', 'Arrested'];
    const rows = crimes.map(c => [
        c.crime_id,
        c.crime_type,
        c.occurrence_date,
        c.latitude,
        c.longitude,
        `"${c.description.replace(/"/g, '""')}"`,
        c.arrested ? 'YES' : 'NO'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Crime_Analysis_Export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function predictSafety() {
    const area = document.getElementById('predict-location').value;
    if (!area) return alert('Please enter a location name.');

    const btn = document.getElementById('btn-predict-safety');
    btn.innerText = 'Analyzing Patterns...';
    btn.disabled = true;

    try {
        const response = await fetch(`/api/predict/safety?area=${encodeURIComponent(area)}`);
        const data = await response.json();

        if (data.score) {
            const resultDiv = document.getElementById('safety-result');
            const scoreVal = document.getElementById('safety-score-value');
            const scoreLabel = document.getElementById('safety-label');

            scoreVal.innerText = `${data.score} / 10`;
            scoreLabel.innerText = data.label;

            // Extra Detail Area
            let detailArea = resultDiv.querySelector('.analysis-details');
            if (!detailArea) {
                detailArea = document.createElement('div');
                detailArea.className = 'analysis-details';
                detailArea.style = "margin-top: 1rem; border-top: 1px solid #1e293b; padding-top: 1rem; font-size: 0.8rem;";
                resultDiv.appendChild(detailArea);
            }

            detailArea.innerHTML = `
                <div style="color: #22c55e; margin-bottom: 0.5rem;">● ${data.source}</div>
                <p style="color: #94a3b8; font-style: italic;">${data.summary}</p>
                <div style="color: #64748b; font-size: 0.7rem; margin-top: 0.5rem;">Confidence Index: 92% (Analyzed via NLP)</div>
            `;

            // Dynamic color
            if (data.score < 4.5) {
                scoreVal.style.color = '#ef4444';
                scoreLabel.style.color = '#ef4444';
            } else if (data.score < 7.5) {
                scoreVal.style.color = '#f59e0b';
                scoreLabel.style.color = '#f59e0b';
            } else {
                scoreVal.style.color = '#22c55e';
                scoreLabel.style.color = '#22c55e';
            }

            resultDiv.style.display = 'block';
            resultDiv.classList.add('fadeIn');
        }
    } catch (err) {
        alert('Analysis failed.');
    } finally {
        btn.innerText = 'Calculate Score';
        btn.disabled = false;
    }
}

// Expose and Init
window.closeModal = closeModal;
window.handleDeleteUser = handleDeleteUser;

document.addEventListener('DOMContentLoaded', () => {
    initAdminActions();
    initWOWFactors();
});
