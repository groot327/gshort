// Firebase configuration (replace with your config)
const firebaseConfig = {
    // Paste your Firebase config here
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Function to generate a random short code
function generateShortCode() {
    return Math.random().toString(36).substring(2, 8); // 6-character code
}

// Function to shorten URL
async function shortenUrl() {
    const longUrl = document.getElementById('longUrl').value;
    if (!longUrl || !longUrl.startsWith('http')) {
        document.getElementById('result').innerHTML = 'Please enter a valid URL';
        return;
    }

    const shortCode = generateShortCode();
    try {
        await db.collection('urls').doc(shortCode).set({
            longUrl: longUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        const shortUrl = `${window.location.origin}/${shortCode}`;
        document.getElementById('result').innerHTML = `Shortened URL: <a href="${shortUrl}" target="_blank">${shortUrl}</a>`;
    } catch (error) {
        document.getElementById('result').innerHTML = `Error: ${error.message}`;
    }
}

// Redirect logic for shortened URLs
window.onload = async function () {
    const path = window.location.pathname.substring(1); // Get short code from URL
    if (path) {
        try {
            const doc = await db.collection('urls').doc(path).get();
            if (doc.exists) {
                window.location.href = doc.data().longUrl; // Redirect to long URL
            } else {
                document.getElementById('result').innerHTML = 'URL not found';
            }
        } catch (error) {
            document.getElementById('result').innerHTML = `Error: ${error.message}`;
        }
    }
};
