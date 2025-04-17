sdocument.addEventListener('DOMContentLoaded', async () => {
    // Authentication Check
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // DOM Elements
    const container = document.getElementById('jobs-container');
    const usernameSpan = document.getElementById('username');
    const favoritesCountSpan = document.getElementById('favoritesCount');
    
    // State Management
    let jobs = [];
    let currentView = 'all';
    const API_URL = "https://api.sheety.co/2254e6bed5057ec509ac2fe596178955/internshipJobsData/internshipJobsDataCsv";

    // Initialize UI
    usernameSpan.textContent = currentUser.username;
    updateFavoritesCount(currentUser.favorites.length);

    try {
        // Fetch Data
        showLoading();
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        jobs = data.internshipJobsDataCsv || [];
        
        if (jobs.length === 0) {
            throw new Error('No job listings found');
        }

        // Initial Setup
        populateLocations(jobs);
        setupEventListeners();
        updateView(currentView);

    } catch (error) {
        showError(`Failed to load jobs: ${error.message}`);
        console.error('Data Load Error:', error);
    }

    function updateView(viewType) {
        currentView = viewType;
        const filteredJobs = filterJobs();
        populateJobs(filteredJobs);
        updateActiveViewButton();
    }

    function filterJobs() {
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const location = document.getElementById('locationFilter').value;
        const jobType = document.getElementById('jobTypeFilter').value;

        return jobs.filter(job => {
            const matchesSearch = job.jobTitle.toLowerCase().includes(searchTerm) || 
                               job.companyName.toLowerCase().includes(searchTerm);
            const matchesLocation = location ? job.location === location : true;
            const matchesJobType = jobType ? job.jobType === jobType : true;
            const isFavorite = currentUser.favorites.some(f => f.id === job.id);
            
            return matchesSearch && matchesLocation && matchesJobType && 
                   (currentView === 'all' || isFavorite);
        });
    }

    function populateJobs(jobsArray) {
        container.innerHTML = jobsArray.map(job => `
            <div class="job-card" role="listitem">
                <h3>${sanitizeHTML(job.jobTitle)}</h3>
                <p><strong>${sanitizeHTML(job.companyName)}</strong></p>
                <p>📍 ${sanitizeHTML(job.location)}</p>
                <p>💰 ${sanitizeHTML(job.salary)}</p>
                <p>⏳ ${sanitizeHTML(job.duration)}</p>
                <button class="favorite-btn" data-id="${job.id}" 
                        aria-label="${currentUser.favorites.some(f => f.id === job.id) ? 'Remove from favorites' : 'Add to favorites'}">
                    ${currentUser.favorites.some(f => f.id === job.id) ? '❤️' : '☆'}
                </button>
            </div>
        `).join('');

        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', () => toggleFavorite(btn.dataset.id));
        });
    }

    function toggleFavorite(jobId) {
        const job = jobs.find(j => j.id == jobId);
        const favoriteIndex = currentUser.favorites.findIndex(f => f.id == jobId);

        if (favoriteIndex === -1) {
            currentUser.favorites.push(job);
        } else {
            currentUser.favorites.splice(favoriteIndex, 1);
        }

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateFavoritesCount(currentUser.favorites.length);
        updateView(currentView);
    }

    function updateFavoritesCount(count) {
        favoritesCountSpan.textContent = count;
    }

    function populateLocations(jobsArray) {
        const locationSelect = document.getElementById('locationFilter');
        const locations = [...new Set(jobsArray
            .filter(job => job.location)
            .map(job => job.location)
        )];
        
        locationSelect.innerHTML = `
            <option value="">All Locations</option>
            ${locations.map(loc => `
                <option value="${sanitizeHTML(loc)}">${sanitizeHTML(loc)}</option>
            `).join('')}
        `;
    }

    function setupEventListeners() {
        // Debounced Search
        let searchTimeout;
        document.getElementById('search').addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => updateView(currentView), 300);
        });

        // Filter Controls
        document.getElementById('locationFilter').addEventListener('change', () => updateView(currentView));
        document.getElementById('jobTypeFilter').addEventListener('change', () => updateView(currentView));
        
        // View Toggles
        document.getElementById('viewAll').addEventListener('click', () => {
            currentView = 'all';
            updateView(currentView);
        });
        
        document.getElementById('viewFavorites').addEventListener('click', () => {
            currentView = 'favorites';
            updateView(currentView);
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    function updateActiveViewButton() {
        document.querySelectorAll('.view-toggle button').forEach(btn => {
            btn.classList.toggle('view-active', btn.id === `view${currentView.charAt(0).toUpperCase() + currentView.slice(1)}`);
            btn.setAttribute('aria-pressed', btn.classList.contains('view-active'));
        });
    }

    function sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    function showLoading() {
        container.innerHTML = '<div class="loading" role="status">Loading opportunities...</div>';
    }

    function showError(message) {
        container.innerHTML = `
            <div class="error" role="alert">
                ⚠️ ${sanitizeHTML(mesage)}
            </div>
        `;
    }
});