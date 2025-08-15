document.getElementById('result').innerHTML = 'Checking Firebase...';

let db; // Declare db globally

if (typeof firebase === 'undefined') {
  document.getElementById('result').innerHTML += '<br>Error: Firebase SDK not loaded. Check internet or script tags.';
} else {
  document.getElementById('result').innerHTML += '<br>Firebase SDK loaded';
  try {
    const firebaseConfig = {
      apiKey: "AIzaSyBBnkPe5qKDHWrPtgCBcAl4teU9W1h1qW0",
      authDomain: "g-url-shortener-64c6e.firebaseapp.com",
      projectId: "g-url-shortener-64c6e",
      storageBucket: "g-url-shortener-64c6e.firebasestorage.app",
      messagingSenderId: "786040303042",
      appId: "1:786040303042:web:d5cd682d1ef4c2ba56ba5b",
      measurementId: "G-DJYYW10D48"
    };

    firebase.initializeApp(firebaseConfig);
    document.getElementById('result').innerHTML += '<br>Firebase initialized';
    db = firebase.firestore(); // Assign to global db
  } catch (error) {
    document.getElementById('result').innerHTML += '<br>Initialization error: ' + error.message;
  }
}

// Function to generate a random short code
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8); // 6-character code
}

// Function to shorten URL
window.shortenUrl = async function () {
  document.getElementById('result').innerHTML += '<br>Function triggered';
  if (!db) {
    document.getElementById('result').innerHTML += '<br>Error: Firestore not initialized';
    return;
  }
  const longUrl = document.getElementById('longUrl').value;
  if (!longUrl || !longUrl.startsWith('http')) {
    document.getElementById('result').innerHTML += '<br>Error: Please enter a valid URL starting with http or https';
    return;
  }

  const shortCode = generateShortCode();
  document.getElementById('result').innerHTML += '<br>Generated short code: ' + shortCode;
  try {
    await db.collection('urls').doc(shortCode).set({
      longUrl: longUrl,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    const shortUrl = window.location.origin + '/gshort/' + shortCode; // Adjust for subdirectory
    document.getElementById('result').innerHTML += '<br>Success: Document written with ID: ' + shortCode;
    document.getElementById('result').innerHTML += '<br>Shortened URL: <a href="' + shortUrl + '">' + shortUrl + '</a>'; // Removed target="_blank" for testing
  } catch (error) {
    document.getElementById('result').innerHTML += '<br>Error: ' + error.message;
  }
};

// Redirect logic for shortened URLs
window.onload = async function () {
  if (!db) {
    document.getElementById('result').innerHTML += '<br>Error: Firestore not initialized';
    return;
  }
  let path = window.location.pathname; // Get full pathname
  document.getElementById('result').innerHTML += '<br>Full path: ' + path;
  let shortCode = path;
  if (path.startsWith('/gshort/')) {
    shortCode = path.substring('/gshort/'.length); // Extract short code after '/gshort/'
    document.getElementById('result').innerHTML += '<br>Extracted short code: ' + shortCode;
  } else if (path === '/gshort' || path === '/') {
    document.getElementById('result').innerHTML += '<br>At base page, no redirect';
    return;
  }
  if (shortCode && shortCode.length === 6) { // Validate short code length
    document.getElementById('result').innerHTML += '<br>Querying Firestore for ' + shortCode;
    try {
      const doc = await db.collection('urls').doc(shortCode).get();
      document.getElementById('result').innerHTML += '<br>Query completed, exists: ' + doc.exists;
      if (doc.exists) {
        const longUrl = doc.data().longUrl;
        document.getElementById('result').innerHTML += '<br>Found longUrl: ' + longUrl;
        document.getElementById('result').innerHTML += '<br>Redirecting to ' + longUrl;
        setTimeout(() => window.location.replace(longUrl), 0); // Force redirect with timeout
      } else {
        document.getElementById('result').innerHTML += '<br>URL not found in Firestore';
      }
    } catch (error) {
      document.getElementById('result').innerHTML += '<br>Error during query: ' + error.message;
    }
  } else {
    document.getElementById('result').innerHTML += '<br>Invalid short code: ' + shortCode;
  }
};