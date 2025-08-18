(function() {
  let resultDiv = document.getElementById('result');
  if (!resultDiv) {
    document.body.innerHTML += '<div id="result"></div>';
    resultDiv = document.getElementById('result');
  }

  let db;
  try {
    if (typeof firebase === 'undefined') {
      alert('Firebase SDK not loaded');
      return;
    }
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
    db = firebase.firestore();
    alert('Firebase initialized successfully');
  } catch (error) {
    alert('Firebase initialization error: ' + error.message);
    return;
  }

  function generateShortCode() {
    return Math.random().toString(36).substring(2, 8);
  }

  window.shortenUrl = async function () {
    alert('Shorten function started');
    if (!db) {
      alert('Firestore not initialized');
      return;
    }
    const longUrl = document.getElementById('longUrl').value;
    if (!longUrl || !longUrl.startsWith('http')) {
      alert('Invalid URL');
      return;
    }

    const shortCode = generateShortCode();
    alert('Generated short code: ' + shortCode);
    try {
      await db.collection('urls').doc(shortCode).set({
        longUrl: longUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      resultDiv.innerHTML = 'URL created with ID: ' + shortCode;
      const shortUrl = window.location.origin + '/gshort/' + shortCode;
      resultDiv.innerHTML += '<br>Here is the URL: <a href="' + shortUrl + '">' + shortUrl + '</a>';
      alert('URL saved and message set');
    } catch (error) {
      resultDiv.innerHTML = 'Error: ' + error.message;
      alert('Save error: ' + error.message);
    }
  };

  // Redirect logic with Firebase check
  (async function redirect() {
    const path = window.location.pathname;
    if (!path.startsWith('/gshort/')) return; // Only run on /gshort/ pages
    alert('Redirect logic started for path: ' + path);
    if (typeof firebase === 'undefined') {
      alert('Firebase is not defined in redirect');
      return;
    }
    const shortCode = path.replace('/gshort/', '');
    if (shortCode.length !== 6) {
      resultDiv.innerHTML = 'Invalid short code';
      return;
    }
    try {
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
})();