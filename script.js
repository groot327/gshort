if (typeof firebase === 'undefined') {
    document.getElementById('result').innerHTML = 'Error: Firebase SDK nof loaded'
} else {
    document.getElementById('result').innerHTML = 'Firebase SDK loaded'
}

// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBnkPe5qKDHWrPtgCBcAl4teU9W1h1qW0",
  authDomain: "g-url-shortener-64c6e.firebaseapp.com",
  projectId: "g-url-shortener-64c6e",
  storageBucket: "g-url-shortener-64c6e.firebasestorage.app",
  messagingSenderId: "786040303042",
  appId: "1:786040303042:web:d5cd682d1ef4c2ba56ba5b",
  measurementId: "G-DJYYW10D48"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
