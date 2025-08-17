// Ensure DOM is ready and handle potential errors
document.addEventListener('DOMContentLoaded', function() {
  let resultDiv = document.getElementById('result');
  if (!resultDiv) {
    console.error('Error: #result element not found');
    document.write('<div id="result">Error: #result element not found</div>');
    resultDiv = document.getElementById('result');
  }
  resultDiv.innerHTML = 'Checking Firebase...';

  console.log('DOM loaded, initializing script...');

  let db; // Declare db globally

  if (typeof firebase === 'undefined') {
    resultDiv.innerHTML += '<br>Error: Firebase SDK not loaded. Check internet or script tags.';
    console.error('Firebase SDK not loaded');
  } else {
    resultDiv.innerHTML += '<br>Firebase SDK loaded';
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
      resultDiv.innerHTML += '<br>Firebase initialized';
      db = firebase.firestore(); // Assign to global db
      console.log('Firebase initialized successfully');
    } catch (error) {
      resultDiv.innerHTML += '<br>Initialization error: ' + error.message;
      console.error('Firebase initialization error:', error);
    }
  }

  // Function to generate a random short code
  function generateShortCode() {
    return Math.random().toString(36).substring(2, 8); // 6-character code
  }

  // Function to shorten URL, using global resultDiv
  window.shortenUrl = async function () {
    resultDiv.innerHTML += '<br>Function triggered';
    console.log('Shorten function triggered');
    if (!db) {
      resultDiv.innerHTML += '<br>Error: Firestore not initialized';
      console.error('Firestore not initialized');
      return;
    }
    const longUrl = document.getElementById('longUrl').value;
    if (!longUrl || !longUrl.startsWith('http')) {
      resultDiv.innerHTML += '<br>Error: Please enter a valid URL starting with http or https';
      console.log('Invalid URL:', longUrl);
      return;
    }

    const shortCode = generateShortCode();
    resultDiv.innerHTML += '<br>Generated short code: ' + shortCode;
    try {
      await db.collection('urls').doc(shortCode).set({
        longUrl: longUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      resultDiv.innerHTML += '<br>Success: Document written with ID: ' + shortCode;
      const shortUrl = window.location.origin + '/gshort/' + shortCode;
      resultDiv.innerHTML += '<br>Shortened URL: <a href="' + shortUrl + '">' + shortUrl + '</a>';
      console.log('Shortened URL created:', shortUrl);
    } catch (error) {
      resultDiv.innerHTML += '<br>Error: ' + error.message;
      console.error('Firestore write error:', error);
    }
  };

  // Redirect logic for shortened URLs
  window.onload = async function () {
    if (!db) {
      resultDiv.innerHTML += '<br>Error: Firestore not initialized';
      console.error('Firestore not initialized in onload');
      return;
    }
    try {
      let path = window.location.pathname;
      resultDiv.innerHTML += '<br>Full path: ' + path;
      console.log('Onload path:', path);
      let shortCode = path;
      if (path.startsWith('/gshort/')) {
        shortCode = path.replace('/gshort/', '');
        resultDiv.innerHTML += '<br>Extracted short code: ' + shortCode;
        document.body.setAttribute('data-shortcode', 'true');
        console.log('Extracted short code:', shortCode);
      } else if (path === '/gshort' || path === '/') {
        resultDiv.innerHTML += '<br>At base page, no redirect';
        console.log('At base page');
        return;
      }
      if (shortCode && shortCode.length === 6) {
        resultDiv.innerHTML += '<br>Validating short code: ' + shortCode;
        resultDiv.innerHTML += '<br>Querying Firestore for ' + shortCode;
        const doc = await db.collection('urls').doc(shortCode).get();
        resultDiv.innerHTML += '<br>Query completed, exists: ' + doc.exists;
        if (doc.exists) {
          const longUrl = doc.data().longUrl;
          resultDiv.innerHTML += '<br>Found longUrl: ' + longUrl;
          resultDiv.innerHTML += '<br>Preparing to redirect to ' + longUrl;
          window.setTimeout(() => {
            resultDiv.innerHTML += '<br>Redirect executed to ' + longUrl;
            window.location.replace(longUrl);
          }, 2000);
        } else {
          resultDiv.innerHTML += '<br>URL not found in Firestore';
        }
      } else {
        resultDiv.innerHTML += '<br>Invalid short code length: ' + shortCode.length;
      }
    } catch (error) {
      resultDiv.innerHTML += '<br>Error in onload function: ' + error.message;
      console.error('Onload error:', error);
    }
  };
});