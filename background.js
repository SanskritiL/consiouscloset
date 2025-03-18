importScripts('ExtPay.js') // or `import` / `require` if using a bundler

var extpay = ExtPay('closet'); // Initialize ExtPay with correct ID

// Start 7-day free trial when extension is installed
extpay.onTrialStarted.addListener(user => {
    console.log('Trial started:', user);
});

// Handle trial end by checking trial status in getUser
async function checkTrialStatus() {
    try {
        const user = await extpay.getUser();
        if (user.trialStartedAt && !user.paid) {
            const trialEnd = new Date(user.trialStartedAt);
            trialEnd.setDate(trialEnd.getDate() + 7);
            if (new Date() > trialEnd) {
                console.log('Trial ended:', user);
            }
        }
    } catch (error) {
        console.error('Failed to check trial status:', error);
    }
}

// Check trial status periodically
setInterval(checkTrialStatus, 60 * 60 * 1000); // Check every hour

extpay.startBackground();
