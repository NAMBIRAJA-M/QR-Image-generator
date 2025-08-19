// Global variables
let currentQRData = null;
let qrHistory = [];

// DOM elements
const elements = {
    qrType: document.getElementById('qrType'),
    inputFields: document.getElementById('inputFields'),
    generateBtn: document.getElementById('generateBtn'),
    qrPreview: document.getElementById('qrPreview'),
    actionButtons: document.getElementById('actionButtons'),
    downloadBtn: document.getElementById('downloadBtn'),
    shareBtn: document.getElementById('shareBtn'),
    saveBtn: document.getElementById('saveBtn'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    navBtns: document.querySelectorAll('.nav-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    historyList: document.getElementById('historyList'),
    statsContent: document.getElementById('statsContent')
};

// Input field templates for different QR types
const inputTemplates = {
    url: `
        <div class="input-group url-input">
            <label for="urlInput">Website URL:</label>
            <input type="url" id="urlInput" placeholder="https://example.com" class="form-input" required>
        </div>
    `,
    text: `
        <div class="input-group text-input">
            <label for="textInput">Text Content:</label>
            <textarea id="textInput" placeholder="Enter any text content..." class="form-input" rows="4" required></textarea>
        </div>
    `,
    email: `
        <div class="input-group email-input">
            <label for="emailInput">Email Address:</label>
            <input type="email" id="emailInput" placeholder="user@example.com" class="form-input" required>
        </div>
    `,
    phone: `
        <div class="input-group phone-input">
            <label for="phoneInput">Phone Number:</label>
            <input type="tel" id="phoneInput" placeholder="+1234567890" class="form-input" required>
        </div>
    `,
    sms: `
        <div class="input-group sms-input">
            <label for="smsPhoneInput">Phone Number:</label>
            <input type="tel" id="smsPhoneInput" placeholder="+1234567890" class="form-input" required>
            <label for="smsMessageInput">Message:</label>
            <textarea id="smsMessageInput" placeholder="Enter your message..." class="form-input" rows="3" required></textarea>
        </div>
    `,
    wifi: `
        <div class="input-group wifi-input">
            <label for="wifiSSID">Network Name (SSID):</label>
            <input type="text" id="wifiSSID" placeholder="MyWiFi" class="form-input" required>
            <label for="wifiPassword">Password:</label>
            <input type="password" id="wifiPassword" placeholder="Enter WiFi password" class="form-input" required>
            <label for="wifiEncryption">Encryption Type:</label>
            <select id="wifiEncryption" class="form-select">
                <option value="WPA">WPA/WPA2/WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
            </select>
        </div>
    `,
    vcard: `
        <div class="input-group vcard-input">
            <label for="vcardName">Full Name:</label>
            <input type="text" id="vcardName" placeholder="John Doe" class="form-input" required>
            <label for="vcardPhone">Phone Number:</label>
            <input type="tel" id="vcardPhone" placeholder="+1234567890" class="form-input" required>
            <label for="vcardEmail">Email:</label>
            <input type="email" id="vcardEmail" placeholder="john@example.com" class="form-input" required>
            <label for="vcardCompany">Company:</label>
            <input type="text" id="vcardCompany" placeholder="Company Name" class="form-input">
        </div>
    `,
    geolocation: `
        <div class="input-group geo-input">
            <label for="geoLatitude">Latitude:</label>
            <input type="number" id="geoLatitude" placeholder="40.7128" step="any" class="form-input" required>
            <label for="geoLongitude">Longitude:</label>
            <input type="number" id="geoLongitude" placeholder="-74.0060" step="any" class="form-input" required>
            <button type="button" id="getCurrentLocation" class="action-btn" style="margin-top: 10px;">
                <i class="fas fa-location-arrow"></i> Use Current Location
            </button>
        </div>
    `
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadHistory();
    loadStats();
    
    // Set default QR type
    updateInputFields('url');
}

function setupEventListeners() {
    // QR type change
    elements.qrType.addEventListener('change', (e) => {
        updateInputFields(e.target.value);
    });

    // Generate button
    elements.generateBtn.addEventListener('click', generateQRCode);

    // Action buttons
    elements.downloadBtn.addEventListener('click', downloadQRCode);
    elements.shareBtn.addEventListener('click', shareQRCode);
    elements.saveBtn.addEventListener('click', saveToHistory);

    // Navigation tabs
    elements.navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });

    // Get current location button (will be added dynamically)
    document.addEventListener('click', (e) => {
        if (e.target.id === 'getCurrentLocation') {
            getCurrentLocation();
        }
    });
}

function updateInputFields(type) {
    const template = inputTemplates[type];
    if (template) {
        elements.inputFields.innerHTML = template;
        
        // Add event listener for location button if it exists
        const locationBtn = document.getElementById('getCurrentLocation');
        if (locationBtn) {
            locationBtn.addEventListener('click', getCurrentLocation);
        }
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        showToast('Getting your location...', 'info');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                document.getElementById('geoLatitude').value = lat.toFixed(6);
                document.getElementById('geoLongitude').value = lng.toFixed(6);
                
                showToast('Location obtained successfully!', 'success');
            },
            (error) => {
                showToast('Failed to get location: ' + error.message, 'error');
            }
        );
    } else {
        showToast('Geolocation is not supported by this browser.', 'error');
    }
}

async function generateQRCode() {
    const type = elements.qrType.value;
    const content = getContentForType(type);
    
    if (!content) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    showLoading(true);

    try {
        const options = {
            foregroundColor: document.getElementById('foregroundColor').value,
            backgroundColor: document.getElementById('backgroundColor').value,
            width: parseInt(document.getElementById('qrSize').value),
            errorCorrectionLevel: document.getElementById('errorCorrection').value
        };

        const response = await fetch('/api/generate-qr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type, content, options })
        });

        const data = await response.json();

        if (data.success) {
            currentQRData = data;
            displayQRCode(data.url);
            showToast('QR Code generated successfully!', 'success');
        } else {
            throw new Error(data.error || 'Failed to generate QR code');
        }
    } catch (error) {
        console.error('Error generating QR code:', error);
        showToast('Error generating QR code: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function getContentForType(type) {
    switch (type) {
        case 'url':
            return document.getElementById('urlInput')?.value;
        case 'text':
            return document.getElementById('textInput')?.value;
        case 'email':
            return document.getElementById('emailInput')?.value;
        case 'phone':
            return document.getElementById('phoneInput')?.value;
        case 'sms':
            const phone = document.getElementById('smsPhoneInput')?.value;
            const message = document.getElementById('smsMessageInput')?.value;
            return phone && message ? { phone, message } : null;
        case 'wifi':
            const ssid = document.getElementById('wifiSSID')?.value;
            const password = document.getElementById('wifiPassword')?.value;
            const encryption = document.getElementById('wifiEncryption')?.value;
            return ssid && password ? { ssid, password, encryption } : null;
        case 'vcard':
            const name = document.getElementById('vcardName')?.value;
            const vcardPhone = document.getElementById('vcardPhone')?.value;
            const email = document.getElementById('vcardEmail')?.value;
            const company = document.getElementById('vcardCompany')?.value;
            return name && vcardPhone && email ? { name, phone: vcardPhone, email, company } : null;
        case 'geolocation':
            const lat = document.getElementById('geoLatitude')?.value;
            const lng = document.getElementById('geoLongitude')?.value;
            return lat && lng ? { latitude: lat, longitude: lng } : null;
        default:
            return null;
    }
}

function displayQRCode(imageUrl) {
    elements.qrPreview.innerHTML = `<img src="${imageUrl}?t=${Date.now()}" alt="Generated QR Code">`;
    elements.actionButtons.style.display = 'grid';
}

function downloadQRCode() {
    if (!currentQRData) return;
    
    const link = document.createElement('a');
    link.href = currentQRData.url;
    link.download = `QR_${currentQRData.type}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('QR Code downloaded!', 'success');
}

function shareQRCode() {
    if (!currentQRData) return;
    
    if (navigator.share) {
        navigator.share({
            title: 'QR Code',
            text: 'Check out this QR code I generated!',
            url: window.location.origin + currentQRData.url
        }).catch(console.error);
    } else {
        // Fallback: copy to clipboard
        const url = window.location.origin + currentQRData.url;
        navigator.clipboard.writeText(url).then(() => {
            showToast('QR Code URL copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Failed to copy to clipboard', 'error');
        });
    }
}

async function saveToHistory() {
    if (!currentQRData) return;
    
    try {
        const response = await fetch('/api/save-to-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: currentQRData.filename,
                content: currentQRData.content,
                type: currentQRData.type,
                timestamp: new Date().toISOString()
            })
        });

        if (response.ok) {
            showToast('Saved to history!', 'success');
            loadHistory(); // Refresh history
        } else {
            throw new Error('Failed to save');
        }
    } catch (error) {
        showToast('Error saving to history', 'error');
    }
}

function switchTab(tabName) {
    // Update navigation buttons
    elements.navBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    // Load data for specific tabs
    if (tabName === 'history') {
        loadHistory();
    } else if (tabName === 'stats') {
        loadStats();
    }
}

async function loadHistory() {
    try {
        const response = await fetch('/api/history');
        const history = await response.json();
        
        if (history.length === 0) {
            elements.historyList.innerHTML = '<div class="loading">No QR codes in history yet.</div>';
            return;
        }

        const historyHTML = history.map(item => {
            // Format content for better display
            let displayContent = '';
            let contentDetails = '';
            
            if (typeof item.content === 'string') {
                displayContent = item.content.length > 40 ? item.content.substring(0, 40) + '...' : item.content;
                contentDetails = item.content;
            } else {
                // Handle object content (like WiFi, vCard, etc.)
                const contentObj = item.content;
                if (contentObj.ssid) {
                    displayContent = `WiFi: ${contentObj.ssid}`;
                    contentDetails = `Network: ${contentObj.ssid}, Encryption: ${contentObj.encryption || 'WPA'}`;
                } else if (contentObj.name) {
                    displayContent = `Contact: ${contentObj.name}`;
                    contentDetails = `Name: ${contentObj.name}, Phone: ${contentObj.phone}, Email: ${contentObj.email}`;
                } else if (contentObj.phone) {
                    displayContent = `SMS: ${contentObj.phone}`;
                    contentDetails = `Phone: ${contentObj.phone}, Message: ${contentObj.message}`;
                } else if (contentObj.latitude) {
                    displayContent = `Location: ${contentObj.latitude}, ${contentObj.longitude}`;
                    contentDetails = `Latitude: ${contentObj.latitude}, Longitude: ${contentObj.longitude}`;
                } else {
                    displayContent = JSON.stringify(contentObj).substring(0, 40) + '...';
                    contentDetails = JSON.stringify(contentObj, null, 2);
                }
            }

            // Format timestamp
            const date = new Date(item.timestamp);
            const formattedDate = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            const formattedTime = date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            return `
                <div class="history-item">
                    <img src="/images/${item.filename}" alt="QR Code" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI0YzRjRGNiIvPgo8cGF0aCBkPSJNMTYgMTZIMTZWMjBIMjBWMjBIMTZaIiBmaWxsPSIjOTRBM0I4Ii8+CjxwYXRoIGQ9Ik0yNCAxNkgyNFYyMEgyOFYyMEgyNFoiIGZpbGw9IiM5NEEzQjgiLz4KPHBhdGggZD0iTTMyIDE2SDMyVjIwSDM2VjIwSDMyWiIgZmlsbD0iIzk0QTNCOCIvPgo8cGF0aCBkPSJNMTYgMjRIMTZWMjhIMjBWMjhIMTZaIiBmaWxsPSIjOTRBM0I4Ii8+CjxwYXRoIGQ9Ik0yNCAyNEgyNFYyOEgyOFYyOEgyNFoiIGZpbGw9IiM5NEEzQjgiLz4KPHBhdGggZD0iTTMyIDI0SDMyVjI4SDM2VjI4SDMyWiIgZmlsbD0iIzk0QTNCOCIvPgo8cGF0aCBkPSJNMTYgMzJIMTZWMzZIMjBWMzZIMTZaIiBmaWxsPSIjOTRBM0I4Ii8+CjxwYXRoIGQ9Ik0yNCAzMkgyNFYzNkgyOFYzNkgyNFoiIGZpbGw9IiM5NEEzQjgiLz4KPHBhdGggZD0iTTMyIDMySDMyVjM2SDM2VjM2SDMyWiIgZmlsbD0iIzk0QTNCOCIvPgo8L3N2Zz4K'">
                    <div class="history-item-info">
                        <h4>${item.type.toUpperCase()} QR Code</h4>
                        <p class="content-preview">${displayContent}</p>
                      
                        <div class="history-meta">
                            <small class="timestamp">📅 ${formattedDate} at ${formattedTime}</small>
                            <small class="filename">📄 ${item.filename}</small>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        elements.historyList.innerHTML = historyHTML;
    } catch (error) {
        console.error('Error loading history:', error);
        elements.historyList.innerHTML = '<div class="loading">Error loading history.</div>';
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        const statsHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${stats.totalGenerated}</h3>
                    <p>Total QR Codes Generated</p>
                </div>
                <div class="stat-card">
                    <h3>${Object.keys(stats.typesGenerated).length}</h3>
                    <p>Different Types Used</p>
                </div>
            </div>
            <div class="recent-activity">
                <h3>Recent Activity</h3>
                ${stats.recentActivity.map(item => `
                    <div class="activity-item">
                        <span class="activity-type">${item.type}</span>
                        <span class="activity-content">${item.content.substring(0, 30)}...</span>
                        <span class="activity-time">${new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        elements.statsContent.innerHTML = statsHTML;
    } catch (error) {
        elements.statsContent.innerHTML = '<div class="loading">Error loading statistics.</div>';
    }
}



function showLoading(show) {
    elements.loadingOverlay.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    const container = document.getElementById('toastContainer');
    container.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Add some utility functions
function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Add input validation
document.addEventListener('input', (e) => {
    const input = e.target;
    const type = input.type;
    
    if (type === 'url' && input.value) {
        input.style.borderColor = validateURL(input.value) ? '#28a745' : '#dc3545';
    } else if (type === 'email' && input.value) {
        input.style.borderColor = validateEmail(input.value) ? '#28a745' : '#dc3545';
    } else {
        input.style.borderColor = '#e1e5e9';
    }
});


