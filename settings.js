const extpay = ExtPay('closet');

const subscriptionStatus = document.getElementById('subscriptionStatus');
const cancelSubscriptionBtn = document.getElementById('cancelSubscription');

// Update subscription status
async function updateSubscriptionStatus() {
    try {
        const user = await extpay.getUser();
        if (user.paid) {
            subscriptionStatus.textContent = 'Active subscription';
            cancelSubscriptionBtn.style.display = 'block';
        } else if (user.trialStartedAt) {
            const trialEnd = new Date(user.trialStartedAt);
            trialEnd.setDate(trialEnd.getDate() + 7);
            const now = new Date();
            
            if (now < trialEnd) {
                const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
                subscriptionStatus.textContent = `Free trial (${daysLeft} days remaining)`;
                cancelSubscriptionBtn.style.display = 'none';
            } else {
                subscriptionStatus.textContent = 'Trial expired';
                cancelSubscriptionBtn.style.display = 'none';
            }
        } else {
            subscriptionStatus.textContent = 'No active subscription';
            cancelSubscriptionBtn.style.display = 'none';
        }
    } catch (err) {
        subscriptionStatus.textContent = 'Error loading subscription status';
        console.error('Failed to load subscription status:', err);
    }
}

// Handle subscription cancellation
cancelSubscriptionBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to cancel your subscription?')) {
        try {
            await extpay.openPaymentPage(); // Opens payment management page
            updateSubscriptionStatus(); // Refresh status after potential changes
        } catch (err) {
            console.error('Failed to open payment management:', err);
            alert('Failed to open subscription management. Please try again later.');
        }
    }
});

// Initialize
updateSubscriptionStatus();