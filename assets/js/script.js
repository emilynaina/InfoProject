document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    const container = document.getElementById('jobs-container');
    const usernameSpan = document.getElementById('username');
    const API_URL = "https://api.sheety.co/ed5b787d81ffb37813f8cfcf95dcb2f1/internshipJobsDataNew/internshipJobsDataCsv";

    let jobs = [];
    let currentView = 'all';

    usernameSpan.textContent = currentUser.username;

    try {
        showLoading();
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const data = await response.json();
        jobs = data.internshipJobsDataCsv;

        populateLocations();
        populateLocations();
populateJobTypesAndCategories();

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
            <div class="job-card-flip">
                <div class="job-card-inner">
                    <div class="job-card-front">
                        <h3 class="job-title">${job.jobTitle}</h3>
                        <p><strong>${job.companyName}</strong></p>
                        <p>📍 ${job.location}</p>
                        <p>💰 ${job.salary}</p>
                        <p>⏳ ${job.duration}</p>
                        <button class="favorite-btn ${currentUser.favorites?.some(f => f.id == job.id) ? 'favorited' : ''}" 
                                data-id="${job.id}">
                            ${currentUser.favorites?.some(f => f.id == job.id) ? '❤️' : '☆'}
                        </button>
                        <button class="detail-btn">Details</button>
                    </div>
                    <div class="job-card-back">
                        <h4>Details</h4>
                        <p>${job.description}</p>
                        <button class="back-btn">Show Less</button>
                    </div>
                </div>
            </div>
        `).join('');
       
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                toggleFavorite(e);
            });
        });

        document.querySelectorAll('.detail-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cardInner = btn.closest('.job-card-inner');
                cardInner.classList.add('flipped');
            });
        });

        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cardInner = btn.closest('.job-card-inner');
                cardInner.classList.remove('flipped');
            });
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
        const jobType = document.getElementById('jobTypeFilter').value;
        const category = document.getElementById('categoryFilter').value;
    
        return jobs.filter(job => {
            const matchesSearch = job.jobTitle.toLowerCase().includes(search) || 
                                  job.companyName.toLowerCase().includes(search);
            const matchesLocation = location ? job.location === location : true;
            const matchesType = jobType ? job.jobType === jobType : true;
            const matchesCategory = category ? job.jobCategory === category : true;
            const isFavorite = currentUser.favorites?.some(f => f.id == job.id);
    
            return matchesSearch && matchesLocation && matchesType && matchesCategory &&
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
    function populateJobTypesAndCategories() {
        const jobTypes = [...new Set(jobs.map(job => job.jobType))];
        const categories = [...new Set(jobs.map(job => job.jobCategory))];
    
        const jobTypeSelect = document.getElementById('jobTypeFilter');
        const categorySelect = document.getElementById('categoryFilter');
    
        jobTypeSelect.innerHTML = `<option value="">All Job Types</option>` +
            jobTypes.map(type => `<option value="${type}">${type}</option>`).join('');
    
        categorySelect.innerHTML = `<option value="">All Categories</option>` +
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }
    
    function setupEventListeners() {
        document.getElementById('search').addEventListener('input', () => updateView());
        document.getElementById('locationFilter').addEventListener('change', () => updateView());
        document.getElementById('jobTypeFilter').addEventListener('change', () => updateView());
        document.getElementById('categoryFilter').addEventListener('change', () => updateView());
        document.getElementById('logoutBtn').addEventListener('click', logout);
    
        document.getElementById('viewAll').addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    
        document.getElementById('viewFavorites').addEventListener('click', () => {
            currentView = 'favorites';
            updateView();
        });
    
        const viewFavBtn = document.getElementById('viewFavorites');
        if (viewFavBtn) viewFavBtn.textContent = "View Favorites";
    }
    

    function logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

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
