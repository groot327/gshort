(function() {
  alert('Script started');
  let resultDiv = document.getElementById('result');
  if (!resultDiv) {
    alert('No #result, creating it');
    document.body.innerHTML = '<div id="result"></div>';
    resultDiv = document.getElementById('result');
  }

  function updateStatus(text) {
    alert('Updating status to: ' + text);
    resultDiv.innerHTML += '<br>' + text;
    alert('Status now: ' + resultDiv.innerHTML);
    // Force re-render/reflow
    resultDiv.style.display = 'none';
    resultDiv.offsetHeight; // Trigger reflow
    resultDiv.style.display = 'block';
  }

  let db;
  updateStatus('Checking Firebase...');
  if (typeof firebase === 'undefined') {
    updateStatus('Error: Firebase SDK not loaded. Check internet.');
    alert('Firebase SDK not loaded');
    return;
  }
  updateStatus('Firebase SDK loaded');
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
    updateStatus('Firebase initialized');
    db = firebase.firestore();
    alert('Firebase initialized, db available');
  } catch (error) {
    updateStatus('Init error: ' + error.message);
    alert('Init error: ' + error.message);
    return;
  }

  // Redirect logic
  (async function redirect() {
    const queryString = window.location.search.substring(1); // Remove the leading '?'
    let shortCode = queryString.match(/^[a-zA-Z0-9]*/) ? queryString.match(/^[a-zA-Z0-9]*/)[0] : ''; // Extract only leading alphanumeric
    if (!shortCode) return; // Only run if there’s a query
    updateStatus('Redirect logic started for query: ' + queryString);
    if (shortCode.length !== 6) {
      updateStatus('Invalid short code');
      return;
    }
    try {
      if (!db) {
        updateStatus('Firestore not available');
        alert('Firestore not available in redirect');
        return;
      }
      const doc = await db.collection('urls').doc(shortCode).get();
      updateStatus('Firestore query completed, exists: ' + doc.exists);
      if (doc.exists) {
        const longUrl = doc.data().longUrl;
        window.location.replace(longUrl);
      } else {
        updateStatus('URL not found');
      }
    } catch (error) {
      updateStatus('Redirect error: ' + error.message);
      alert('Redirect error: ' + error.message);
    }
  })();

  function generateShortCode() {
    return Math.random().toString(36).substring(2, 8);
  }

  window.shortenUrl = async function () {
    updateStatus('Function triggered');
    if (!db) {
      updateStatus('Error: Firestore not initialized');
      alert('Firestore not initialized in shortenUrl');
      return;
    }
    const longUrl = document.getElementById('longUrl').value;
    if (!longUrl || !longUrl.startsWith('http')) {
      updateStatus('Error: Valid URL required (http/https)');
      return;
    }

    const shortCode = generateShortCode();
    updateStatus('Generated code: ' + shortCode);
    try {
      const docRef = await db.collection('urls').doc(shortCode).set({
        longUrl: longUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      updateStatus('Success: Saved ID: ' + shortCode);
      const shortUrl = window.location.origin + '/gshort?' + shortCode;
      updateStatus('Short URL: <a href="' + shortUrl + '">' + shortUrl + '</a>');
    } catch (error) {
      updateStatus('Save error: ' + error.message);
      alert('Save error: ' + error.message);
    }
  };
})();