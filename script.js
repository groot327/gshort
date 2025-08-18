(function() {
  alert('Script started');
  let resultDiv = document.getElementById('result');
  if (!resultDiv) {
    alert('No #result, creating it');
    document.body.innerHTML = '<div id="result"></div>';
    resultDiv = document.getElementById('result');
  }

  // Function to update status and force re-render
  function updateStatus(text) {
    alert('Updating status to: ' + text);
    resultDiv.innerHTML += '<br>' + text;
    alert('Status now: ' + resultDiv.innerHTML);
    // Force re-render
    requestAnimationFrame(() => {
      resultDiv.style.opacity = resultDiv.style.opacity === '0.99' ? '1' : '0.99';
    });
  }

  // Initial status update with delay
  setTimeout(() => {
    alert('Before setting initial text');
    updateStatus('Checking Firebase...');

    let db;
    if (typeof firebase === 'undefined') {
      updateStatus('Error: Firebase SDK not loaded. Check internet.');
      alert('Firebase SDK not loaded');
      return;
    } else {
      updateStatus('Firebase SDK loaded');
      alert('Firebase SDK loaded');
    }
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
      alert('Firebase initialized');
    } catch (error) {
      updateStatus('Init error: ' + error.message);
      alert('Init error: ' + error.message);
      return;
    }

    (async function redirect() {
      const queryString = window.location.search.substring(1); // Remove the leading '?'
      let shortCode = queryString.match(/^[a-zA-Z0-9]*/) ? queryString.match(/^[a-zA-Z0-9]*/)[0] : ''; // Extract only leading alphanumeric
      if (!shortCode) return; // Only run if there’s a query
      alert('Redirect logic started for query: ' + queryString);
      if (shortCode.length !== 6) {
        resultDiv.innerHTML = 'Invalid short code';
        return;
      }
      try {
        if (!db) {
          resultDiv.innerHTML = 'Firestore not available';
          alert('Firestore not available in redirect');
          return;
        }
        const doc = await db.collection('urls').doc(shortCode).get();
        alert('Firestore query completed, exists: ' + doc.exists);
        if (doc.exists) {
          const longUrl = doc.data().longUrl;
          window.location.replace(longUrl);
        } else {
          resultDiv.innerHTML = 'URL not found';
        }
      } catch (error) {
        resultDiv.innerHTML = 'Error: ' + error.message;
        alert('Redirect error: ' + error.message);
      }
    })();
  }, 100); // 100ms delay

  function generateShortCode() {
    return Math.random().toString(36).substring(2, 8);
  }

  window.shortenUrl = async function () {
    updateStatus('Function triggered');
    if (!db) {
      updateStatus('Error: Firestore not initialized');
      return;
    }
    const longUrl = document.getElementById('longUrl').value;
    if (!longUrl || !longUrl.startsWith('http')) {
      updateStatus('Error: Valid URL required (http/https)');
      return;
    }

    const shortCode = generateShortCode();
    updateStatus('Code: ' + shortCode);
    try {
      await db.collection('urls').doc(shortCode).set({
        longUrl: longUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      updateStatus('Success: Saved ID: ' + shortCode);
      const shortUrl = window.location.origin + '/gshort/' + shortCode;
      updateStatus('Short URL: <a href="' + shortUrl + '">' + shortUrl + '</a>');
    } catch (error) {
      updateStatus('Error: ' + error.message);
    }
  };
})();