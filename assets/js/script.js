document.addEventListener('DOMContentLoaded', async () => {
    // Authentication Check
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // DOM Elements
    const container = document.getElementById('jobs-container');
    const usernameSpan = document.getElementById('username');
    const API_URL = "https://api.sheety.co/2254e6bed5057ec509ac2fe596178955/internshipJobsData/internshipJobsDataCsv";

 // State
    let jobs = [];
    let currentView = 'all';

    // Initialize
    usernameSpan.textContent = currentUser.username;
    
    try {
        showLoading();
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const data = await response.json();
        jobs = data.internshipJobsDataCsv;
        
        populateLocations();
        setupEventListeners();
        updateView();
        hideLoading();
    } catch (error) {
        hideLoading();
        container.innerHTML = `<div class="error">⚠️ ${error.message}</div>`;
    }

    function updateView() {
        const filtered = filterJobs();
        container.innerHTML = filtered.map(job => `
            <div class="job-card">
                <h3>${job.jobTitle}</h3>
                <p><strong>${job.companyName}</strong></p>
                <p>📍 ${job.location}</p>
                <p>💰 ${job.salary}</p>
                <p>⏳ ${job.duration}</p>
                <button class="favorite-btn ${currentUser.favorites.some(f => f.id == job.id) ? 'favorited' : ''}" 
                        data-id="${job.id}">
                    ${currentUser.favorites.some(f => f.id == job.id) ? '❤️' : '☆'}
                </button>
            </div>
        `).join('');

        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', toggleFavorite);
        });
    }

    function toggleFavorite(e) {
        const jobId = e.target.dataset.id;
        const job = jobs.find(j => j.id == jobId);
        const index = currentUser.favorites.findIndex(f => f.id == jobId);

        if (index === -1) {
            currentUser.favorites.push(job);
        } else {
            currentUser.favorites.splice(index, 1);
        }

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateView();
    }

    function filterJobs() {
        const search = document.getElementById('search').value.toLowerCase();
        const location = document.getElementById('locationFilter').value;
        //const jobType = document.getElementById('jobTypeFilter').value;

        return jobs.filter(job => {
            const matchesSearch = job.jobTitle.toLowerCase().includes(search) || 
                               job.companyName.toLowerCase().includes(search);
            const matchesLocation = location ? job.location === location : true;
            //const matchesType = jobType ? job.jobType === jobType : true;
            const isFavorite = currentUser.favorites.some(f => f.id == job.id);
            
            return matchesSearch && matchesLocation && //matchesType && 
                   (currentView === 'all' || isFavorite);
        });
    }

    function populateLocations() {
        const locations = [...new Set(jobs.map(job => job.location))];
        const select = document.getElementById('locationFilter');
        select.innerHTML = `
            <option value="">All Locations</option>
            ${locations.map(loc => `<option>${loc}</option>`).join('')}
        `;
    }

    function setupEventListeners() {
        document.getElementById('search').addEventListener('input', () => updateView());
        document.getElementById('locationFilter').addEventListener('change', () => updateView());
        //document.getElementById('jobTypeFilter').addEventListener('change', () => updateView());
        document.getElementById('logoutBtn').addEventListener('click', logout);
        document.getElementById('viewAll').addEventListener('click', () => {
            currentView = 'all';
            updateView();
        });
        document.getElementById('viewFavorites').addEventListener('click', () => {
            currentView = 'favorites';
            updateView();
        });
    }

    function logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    // Loading overlay toggle functions
    function showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        }
    }

    function hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }
});
