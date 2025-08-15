const { default: firebase } = require("firebase/compat/app");

if (typeof firebase === 'undefined') {
    document.getElementById('result').innerHTML = 'Error: Firebase SDK not loaded'
} else {
    document.getElementById('result').innerHTML = 'Firebase SDK loaded'
    try {
        firebase.initializeApp(firebaseConfig);
        document.getElementById('result').innerHTML += '<br>Firebase initialized';
    } catch (error) {
        document.getElementById('result').innerHTML += '<br>Initialization error: ' + error.message;
    }
}

// Import the functions you need from the SDKs you need
const { initializeApp } = firebase;
const { getFirestore, doc, setDoc, serverTimestamp } = firebase.firestore;
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
const db = getFirestore(app);

// Function to generate a random short code
function generateShortCode() {
    return Math.random().toString(36).substring(2, 8); // 6-character code
}

// Function to shorten URL
function shortenUrl() {
    document.getElementById('result').innerHTML = 'Function triggered';
    const longUrl = document.getElementById('longUrl').value;
    if (!longUrl || !longUrl.startsWith('http')) {
        document.getElementById('result').innerHTML = 'Please enter a valid URL';
        return;
    }

    const shortCode = generateShortCode();
    try {
        await setDoc(doc(db, 'urls', shortCode), {
            longUrl: longUrl,
            createdAt: serverTimestamp()
        });
        const shortUrl = '${window.location.origin}/${shortCode}';
        document.getElementById('result').innerHTML = 'Shortened URL: <a href="' + shortUrl + '" target="_blank">' + shortUrl + '</a>';
    } catch (error) {
        document.getElementById('result').innerHTML = 'Error: ' + error.message;
    }
}

// Redirect logic for shortened URLs
window.onload = async function () {
    const path = window.location.pathname.substring(1); // Get short code from URL
    if (path) {
        try {
            const docSnap = await getDoc(doc(db, 'urls', path));
            if (docSnap.exists) {
                window.location.href = docSnap.data().longUrl; // Redirect to long URL
            } else {
                document.getElementById('result').innerHTML = 'URL not found';
            }
        } catch (error) {
            document.getElementById('result').innerHTML = 'Error: ' + error.message;
        }
    }
};
