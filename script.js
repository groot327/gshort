document.getElementById('result').innerHTML = 'Checking Firebase...';

let db; // Declare db globally

if (typeof firebase === 'undefined') {
  document.getElementById('result').innerHTML = 'Error: Firebase SDK not loaded. Check internet or script tags.';
} else {
  document.getElementById('result').innerHTML = 'Firebase SDK loaded';
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
  document.getElementById('result').innerHTML = 'Function triggered';
  if (!db) {
    document.getElementById('result').innerHTML = 'Error: Firestore not initialized';
    return;
  }
  const longUrl = document.getElementById('longUrl').value;
  if (!longUrl || !longUrl.startsWith('http')) {
    document.getElementById('result').innerHTML = 'Error: Please enter a valid URL starting with http or https';
    return;
  }

  const shortCode = generateShortCode();
  document.getElementById('result').innerHTML = 'Generated short code: ' + shortCode;
  try {
    await db.collection('urls').doc(shortCode).set({
      longUrl: longUrl,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    const shortUrl = window.location.origin + '/gshort/' + shortCode; // Adjust for subdirectory
    document.getElementById('result').innerHTML = 'Success: Document written with ID: ' + shortCode + '<br>Shortened URL: <a href="' + shortUrl + '" target="_blank">' + shortUrl + '</a>';
  } catch (error) {
    document.getElementById('result').innerHTML = 'Error: ' + error.message;
  }
};

// Redirect logic for shortened URLs
window.onload = async function () {
  if (!db) {
    document.getElementById('result').innerHTML = 'Error: Firestore not initialized';
    return;
  }
  let path = window.location.pathname.substring(1); // Get full path
  document.getElementById('result').innerHTML = 'Path checked: ' + path; // Debug
  if (path.startsWith('gshort/')) {
    path = path.substring('gshort/'.length); // Extract short code after 'gshort/'
    document.getElementById('result').innerHTML += '<br>Extracted path: ' + path;
  }
  if (path) {
    try {
      document.getElementById('result').innerHTML += '<br>Querying Firestore for ' + path;
      const doc = await db.collection('urls').doc(path).get();
      document.getElementById('result').innerHTML += '<br>Query completed';
      if (doc.exists) {
        document.getElementById('result').innerHTML += '<br>Redirecting to ' + doc.data().longUrl;
        window.location.href = doc.data().longUrl; // Redirect to long URL
      } else {
        document.getElementById('result').innerHTML += '<br>URL not found';
      }
    } catch (error) {
      document.getElementById('result').innerHTML += '<br>Error: ' + error.message;
    }
  }
};