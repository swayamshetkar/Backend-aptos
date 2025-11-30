// API Configuration
const API_BASE_URL = 'http://localhost:4000';

// State Management
let currentPage = 'home';
let walletAddress = null;
let authToken = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Show loading screen first
    showLoadingScreen();
});

// Loading Screen
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    // After 3.5 seconds, fade out loading screen
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        
        // After fade out animation, remove from DOM and initialize app
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadHomePage();
            setupEventListeners();
        }, 500);
    }, 3500);
}

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
let currentCampaign = null;
let currentVideoData = null;
let adStartTime = 0;

async function openVideoModal(videoId) {
    try {
        // Load video data
        const videoResponse = await fetch(`${API_BASE_URL}/api/video/${videoId}`);
        const videoData = await videoResponse.json();

        if (!videoData.success) {
            alert('Failed to load video');
            return;
        }

        currentVideoData = videoData.video;
        
        // Check for campaign/ad
        const campaignResponse = await fetch(`${API_BASE_URL}/api/campaign/${videoId}`);
        const campaignData = await campaignResponse.json();

        document.getElementById('modalVideoTitle').textContent = currentVideoData.title;
        document.getElementById('modalVideoDescription').textContent = currentVideoData.description;
        document.getElementById('modalCreator').textContent = currentVideoData.creator.substring(0, 10) + '...';
        document.getElementById('modalDate').textContent = formatDate(currentVideoData.created_at);

        if (campaignData.success && campaignData.hasCampaign) {
            // Has campaign - show ad first
            currentCampaign = campaignData.campaign;
            showAdPlayer();
        } else {
            // No campaign - show main video directly
            currentCampaign = null;
            showMainPlayer();
        }

        document.getElementById('videoModal').classList.add('active');
    } catch (error) {
        console.error('Error loading video:', error);
        alert('Failed to load video');
    }
}

function showAdPlayer() {
    document.getElementById('adPlayerContainer').style.display = 'block';
    document.getElementById('mainPlayerContainer').style.display = 'none';
    
    const adPlayer = document.getElementById('adPlayer');
    adPlayer.src = currentCampaign.ad_url;
    
    document.getElementById('adTitle').textContent = currentCampaign.ad_title;
    document.getElementById('adReward').textContent = currentCampaign.reward_per_second;
    
    adStartTime = Date.now();
    
    // Show skip button after 5 seconds
    setTimeout(() => {
        document.getElementById('adSkipBtn').style.display = 'inline-block';
    }, 5000);
    
    // When ad ends, show main video
    adPlayer.onended = () => {
        trackAdView();
        showMainPlayer();
    };
}

function showMainPlayer() {
    document.getElementById('adPlayerContainer').style.display = 'none';
    document.getElementById('mainPlayerContainer').style.display = 'block';
    
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.src = currentVideoData.url;
}

function skipAd() {
    trackAdView();
    showMainPlayer();
}

async function trackAdView() {
    if (!currentCampaign) return;
    
    const watchDuration = Math.floor((Date.now() - adStartTime) / 1000);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/campaign/track-view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                campaign_id: currentCampaign.id,
                video_id: currentVideoData.id,
                watch_duration: watchDuration
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show earnings
            document.getElementById('totalEarnings').textContent = data.reward_earned;
            document.getElementById('earningsDisplay').style.display = 'block';
        }
    } catch (error) {
        console.error('Error tracking ad view:', error);
    }
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    modal.classList.remove('active');
    
    // Stop and clear all players
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.pause();
    videoPlayer.src = '';
    
    const adPlayer = document.getElementById('adPlayer');
    adPlayer.pause();
    adPlayer.src = '';
    
    // Reset displays
    document.getElementById('adPlayerContainer').style.display = 'none';
    document.getElementById('mainPlayerContainer').style.display = 'none';
    document.getElementById('earningsDisplay').style.display = 'none';
    document.getElementById('adSkipBtn').style.display = 'none';
    
    // Reset state
    currentCampaign = null;
    currentVideoData = null;
    adStartTime = 0;
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
        return;
    }

    const adFileInput = document.getElementById('adFile');
    const videoId = parseInt(document.getElementById('campaignVideoId').value);
    const adTitle = document.getElementById('adTitle').value;
    const budget = parseInt(document.getElementById('campaignBudget').value);
    const reward = parseInt(document.getElementById('campaignReward').value);

    if (!adFileInput.files[0]) {
        showStatus('campaignStatus', 'Please select an advertisement video', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('adFile', adFileInput.files[0]);
    formData.append('video_id', videoId);
    formData.append('ad_title', adTitle);
    formData.append('budget', budget);
    formData.append('reward_per_second', reward);

    document.getElementById('campaignProgress').style.display = 'block';
    showStatus('campaignStatus', 'Uploading ad and creating campaign...', 'info');

    try {
        const response = await fetch(`${API_BASE_URL}/api/campaign/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showStatus('campaignStatus', `Campaign created! Ad uploaded to IPFS. TX: ${data.tx.hash.substring(0, 20)}...`, 'success');
            document.getElementById('campaignForm').reset();
            
            setTimeout(() => {
                document.getElementById('campaignProgress').style.display = 'none';
            }, 2000);
        } else {
            showStatus('campaignStatus', 'Failed to create campaign: ' + (data.error || 'Unknown error'), 'error');
            document.getElementById('campaignProgress').style.display = 'none';
        }
    } catch (error) {
        console.error('Campaign creation error:', error);
        showStatus('campaignStatus', 'Error: ' + error.message, 'error');
        document.getElementById('campaignProgress').style.display = 'none';
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
