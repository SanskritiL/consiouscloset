// Initialize ExtPay
const extpay = ExtPay('closet');

// Constants for DOM elements
const injectButton = document.getElementById('inject-btn');
const subscribeButton = document.getElementById('subscribe-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const gaugeContainer = document.querySelector('.gauge-container');
const infoSections = document.querySelectorAll('.info-section');
const itemDescription = document.getElementById('itemDescription');
const greenwashingAnalysis = document.getElementById('greenwashingAnalysis');
const scoreValue = document.getElementById('scoreValue');
const gaugeChartCtx = document.getElementById('gaugeChart').getContext('2d');
const gaugeNeedle = document.getElementById('gaugeNeedle');

// Check payment status on popup load
checkPaymentStatus();

// Event listeners
injectButton.addEventListener('click', handleInjectButtonClick);
subscribeButton.addEventListener('click', () => extpay.openPaymentPage());

// Check payment and trial status
async function checkPaymentStatus() {
    try {
        const user = await extpay.getUser();
        if (user.paid) {
            subscribeButton.style.display = 'none';
            injectButton.style.display = 'block';
        } else if (user.trialStartedAt) {
            // User is in trial period
            const trialEnd = new Date(user.trialStartedAt);
            trialEnd.setDate(trialEnd.getDate() + 7);
            const now = new Date();
            
            if (now < trialEnd) {
                const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
                subscribeButton.textContent = `${daysLeft} days left in trial`;
                subscribeButton.style.display = 'block';
                injectButton.style.display = 'block';
            } else {
                // Trial has ended
                subscribeButton.textContent = 'Subscribe Now';
                subscribeButton.style.display = 'block';
                injectButton.style.display = 'none';
                subscribeButton.onclick = () => extpay.openPaymentPage();
            }
        } else {
            // User hasn't started trial
            subscribeButton.textContent = 'Start 7-Day Free Trial';
            subscribeButton.style.display = 'block';
            injectButton.style.display = 'none';
            
            // Add click handler for starting trial
            subscribeButton.onclick = () => extpay.openTrialPage('7d');
        }
    } catch (err) {
        console.error('Failed to check payment status:', err);
        // Show error state in UI
        subscribeButton.textContent = 'Error checking status';
        subscribeButton.style.display = 'block';
        injectButton.style.display = 'none';
        // Retry after 1 minute
        setTimeout(checkPaymentStatus, 60000);
    }
}

// Handle inject button click
function handleInjectButtonClick(event) {
    // Disable the button and show the loading spinner
    injectButton.disabled = true;
    loadingSpinner.style.display = 'flex';

    // Hide gauge and info sections during loading
    gaugeContainer.style.display = 'none';
    infoSections.forEach(el => el.style.display = 'none');

    console.log("Injecting content script...");

    // Send analyze message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "analyze" });
    });
}

// Inject content script into the active tab
function injectContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["content.js"]
        }, () => {
            console.log("Content script injected.");
        });
    });
}

// Message listener for fabricData
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "fabricData") {
        console.log("fabricData received:", message);

        // Hide the loading spinner, re-enable the button and show analysis sections
        loadingSpinner.style.display = 'none';
        injectButton.disabled = false;
        gaugeContainer.style.display = 'block';
        infoSections.forEach(el => el.style.display = 'block');

        // Display the analysis
        displayAnalysis(message);
    }
});

// Display analysis data
function displayAnalysis(data) {
    itemDescription.innerText = data.data.description;
    greenwashingAnalysis.innerText = data.data.analysis;
    scoreValue.innerText = `${data.data.score}/5`;

    console.log('Materials:', data.data.materials);
    drawChart(data.data.materials, data.data.score);
}

// Draw the gauge chart
function drawChart(materials, score) {
    // Destroy the existing chart if it exists
    if (window.myChart) {
        window.myChart.destroy();
    }

    // Create a new chart with vibrant gradients and emojis
    window.myChart = new Chart(gaugeChartCtx, {
        type: 'doughnut',
        data: {
            labels: ['Poor 🍂', 'Moderate 🌿', 'Excellent 🌱'],
            datasets: [{
                data: [2, 1, 2],  // Score zones
                backgroundColor: [
                    'rgb(255, 107, 107)',  // Coral for poor
                    'rgb(255, 217, 61)',   // Yellow for moderate
                    'rgb(78, 205, 196)'    // Teal for excellent
                ],
                borderWidth: 0,
                cutout: '70%',
            }]
        },
        options: {
            responsive: true,
            rotation: -90,
            circumference: 180,
            plugins: {
                legend: { 
                    display: true,
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14,
                            family: "'Inter', system-ui, -apple-system, sans-serif"
                        },
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: { enabled: false },
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });

    // Adjust needle position with smooth animation
    const angle = -90 + (score / 5) * 180;
    gaugeNeedle.style.transition = 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
    gaugeNeedle.style.transform = `rotate(${angle}deg)`;
}