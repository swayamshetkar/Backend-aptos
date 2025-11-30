// API Configuration
const API_BASE_URL = 'http://localhost:4000';

// State Management
let currentPage = 'home';
let walletAddress = null;
let authToken = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadHomePage();
    setupEventListeners();
});

// Page Navigation
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageName).classList.add('active');
    currentPage = pageName;

    // Load page-specific content
    switch(pageName) {
        case 'home':
            loadHomePage();
            break;
        case 'consumer':
            loadConsumerPage();
            break;
        case 'creator':
            loadCreatorPage();
            break;
        case 'advertiser':
            loadAdvertiserPage();
            break;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Upload Form
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleVideoUpload);
    }

    // Campaign Form
    const campaignForm = document.getElementById('campaignForm');
    if (campaignForm) {
        campaignForm.addEventListener('submit', handleCampaignCreate);
    }

    // Connect Wallet Button
    const connectWalletBtn = document.getElementById('connectWallet');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    }
}

// Home Page Functions
async function loadHomePage() {
    try {
        // Load platform stats
        const statsResponse = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
        const statsData = await statsResponse.json();

        if (statsData.success) {
            document.getElementById('totalVideos').textContent = statsData.stats.totalVideos;
            document.getElementById('totalCreators').textContent = statsData.stats.totalCreators;

            // Display recent videos
            displayVideos(statsData.stats.recentVideos, 'homeVideoGrid', false);
        }
    } catch (error) {
        console.error('Error loading home page:', error);
    }
}

// Consumer Page Functions
async function loadConsumerPage() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/video/list`);
        const data = await response.json();

        if (data.success) {
            displayVideos(data.videos, 'consumerVideoGrid', true);
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        document.getElementById('consumerVideoGrid').innerHTML = 
            '<p style="text-align:center;color:var(--danger-color);">Failed to load videos. Please try again.</p>';
    }
}

// Creator Page Functions
async function loadCreatorPage() {
    if (!walletAddress) {
        document.getElementById('myVideosGrid').innerHTML = 
            '<p style="text-align:center;color:var(--warning-color);">Please connect your wallet to view your dashboard.</p>';
        return;
    }

    loadCreatorDashboard();
}

async function loadCreatorDashboard() {
    if (!walletAddress) {
        alert('Please connect your wallet first');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/creator/${walletAddress}`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('myVideosCount').textContent = data.stats.totalVideos;
            document.getElementById('myBalance').textContent = data.stats.balanceFormatted;

            displayVideos(data.videos, 'myVideosGrid', false);
        }
    } catch (error) {
        console.error('Error loading creator dashboard:', error);
    }
}

// Advertiser Page Functions
async function loadAdvertiserPage() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/video/list`);
        const data = await response.json();

        if (data.success) {
            displayVideoList(data.videos, 'advertiserVideoList');
        }
    } catch (error) {
        console.error('Error loading advertiser page:', error);
    }
}

// Display Functions
function displayVideos(videos, containerId, enableClick = true) {
    const container = document.getElementById(containerId);
    
    if (!videos || videos.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--gray);">No videos available yet.</p>';
        return;
    }

    container.innerHTML = videos.map(video => `
        <div class="video-card" ${enableClick ? `onclick="openVideoModal(${video.id})"` : ''}>
            <div class="video-thumbnail">🎬</div>
            <div class="video-details">
                <h3>${escapeHtml(video.title)}</h3>
                <p>${escapeHtml(video.description)}</p>
                <div class="video-meta">
                    <span>ID: ${video.id}</span>
                    <span>${formatDate(video.created_at)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function displayVideoList(videos, containerId) {
    const container = document.getElementById(containerId);
    
    if (!videos || videos.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--gray);">No videos available.</p>';
        return;
    }

    container.innerHTML = videos.map(video => `
        <div class="video-list-item">
            <div class="video-list-item-info">
                <h4>${escapeHtml(video.title)}</h4>
                <p>${escapeHtml(video.description.substring(0, 100))}...</p>
            </div>
            <div class="video-id-badge">ID: ${video.id}</div>
        </div>
    `).join('');
}

// Video Modal Functions
async function openVideoModal(videoId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/video/${videoId}`);
        const data = await response.json();

        if (data.success) {
            const video = data.video;
            
            document.getElementById('modalVideoTitle').textContent = video.title;
            document.getElementById('modalVideoDescription').textContent = video.description;
            document.getElementById('modalCreator').textContent = video.creator.substring(0, 10) + '...';
            document.getElementById('modalDate').textContent = formatDate(video.created_at);
            
            const videoPlayer = document.getElementById('videoPlayer');
            videoPlayer.src = video.url;
            
            document.getElementById('videoModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading video:', error);
        alert('Failed to load video');
    }
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    modal.classList.remove('active');
    
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.pause();
    videoPlayer.src = '';
}

// Upload Video Handler
async function handleVideoUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById('videoFile');
    const title = document.getElementById('videoTitle').value;
    const description = document.getElementById('videoDescription').value;

    if (!fileInput.files[0]) {
        showStatus('uploadStatus', 'Please select a video file', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('title', title);
    formData.append('description', description);

    // Show progress
    document.getElementById('uploadProgress').style.display = 'block';
    showStatus('uploadStatus', 'Uploading video...', 'info');

    try {
        const response = await fetch(`${API_BASE_URL}/api/video/upload-video`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showStatus('uploadStatus', 'Video uploaded successfully!', 'success');
            document.getElementById('uploadForm').reset();
            
            // Refresh creator dashboard
            setTimeout(() => {
                loadCreatorDashboard();
                document.getElementById('uploadProgress').style.display = 'none';
            }, 2000);
        } else {
            showStatus('uploadStatus', 'Upload failed: ' + (data.error || 'Unknown error'), 'error');
            document.getElementById('uploadProgress').style.display = 'none';
        }
    } catch (error) {
        console.error('Upload error:', error);
        showStatus('uploadStatus', 'Upload failed: ' + error.message, 'error');
        document.getElementById('uploadProgress').style.display = 'none';
    }
}

// Create Campaign Handler
async function handleCampaignCreate(e) {
    e.preventDefault();

    if (!authToken) {
        alert('Please login first to create campaigns');
        // In a real app, show login modal here
        return;
    }

    const videoId = parseInt(document.getElementById('campaignVideoId').value);
    const budget = parseInt(document.getElementById('campaignBudget').value);
    const reward = parseInt(document.getElementById('campaignReward').value);

    showStatus('campaignStatus', 'Creating campaign...', 'info');

    try {
        const response = await fetch(`${API_BASE_URL}/api/campaign/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                video_id: videoId,
                budget: budget,
                reward_per_second: reward
            })
        });

        const data = await response.json();

        if (data.success) {
            showStatus('campaignStatus', 'Campaign created successfully! TX: ' + data.tx.hash.substring(0, 20) + '...', 'success');
            document.getElementById('campaignForm').reset();
        } else {
            showStatus('campaignStatus', 'Failed to create campaign: ' + (data.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Campaign creation error:', error);
        showStatus('campaignStatus', 'Error: ' + error.message, 'error');
    }
}

// Connect Wallet (Simulated)
async function connectWallet() {
    // In a real app, integrate with Petra Wallet or other Aptos wallet
    // For demo purposes, we'll simulate a wallet connection
    
    try {
        // Simulate wallet connection
        walletAddress = '0x725e2ce1a9869698c840684828def3c663776877380c3020c8bbc51fae019f27';
        
        // Login to get auth token
        const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'attester1',
                password: 'password123'
            })
        });

        const loginData = await loginResponse.json();
        if (loginData.token) {
            authToken = loginData.token;
        }

        document.getElementById('connectWallet').textContent = 
            walletAddress.substring(0, 6) + '...' + walletAddress.substring(walletAddress.length - 4);
        document.getElementById('connectWallet').style.background = 'var(--success-color)';

        alert('Wallet connected successfully!');
        
        // Reload current page to show wallet-specific content
        showPage(currentPage);
    } catch (error) {
        console.error('Wallet connection error:', error);
        alert('Failed to connect wallet');
    }
}

// Utility Functions
function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `status-message ${type}`;
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('videoModal');
    if (event.target === modal) {
        closeVideoModal();
    }
}
