// Constants for DOM elements
const injectButton = document.getElementById('inject-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const gaugeContainer = document.querySelector('.gauge-container');
const infoSections = document.querySelectorAll('.info-section');
const itemDescription = document.getElementById('itemDescription');
const greenwashingAnalysis = document.getElementById('greenwashingAnalysis');
const scoreValue = document.getElementById('scoreValue');
const gaugeChartCtx = document.getElementById('gaugeChart').getContext('2d');
const gaugeNeedle = document.getElementById('gaugeNeedle');

// Event listener for the inject button
injectButton.addEventListener('click', handleInjectButtonClick);

// Handle inject button click
function handleInjectButtonClick(event) {
    // Disable the button and show the loading spinner
    injectButton.disabled = true;
    loadingSpinner.style.display = 'flex';

    // Show loading state
    gaugeContainer.style.display = 'block';
    infoSections.forEach(el => el.style.display = 'block');

    console.log("Injecting content script...");

    // Inject the content script
    injectContentScript();
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

        // Hide the loading spinner and re-enable the button
        loadingSpinner.style.display = 'none';
        injectButton.disabled = false;

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

    // Create a new chart
    window.myChart = new Chart(gaugeChartCtx, {
        type: 'doughnut',
        data: {
            labels: ['Poor', 'Moderate', 'Excellent'],
            datasets: [{
                data: [2, 1, 2],  // Score zones
                backgroundColor: ['#ff4d4d', '#ffcc00', '#33cc33'],
                borderWidth: 0,
                cutout: '70%',
            }]
        },
        options: {
            responsive: true,
            rotation: -90,
            circumference: 180,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            },
        }
    });

    // Adjust needle position based on the score
    const angle = -90 + (score / 5) * 180;
    gaugeNeedle.style.transform = `rotate(${angle}deg)`;
}