(function() {
  let resultDiv = document.getElementById('result');
  if (!resultDiv) {
    document.body.innerHTML += '<div id="result"></div>';
    resultDiv = document.getElementById('result');
  }

  let db;
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

  // Redirect logic
  (async function redirect() {
    let path = window.location.pathname;
    let shortCode = path.replace('/gshort/', '');
    if (shortCode && shortCode.length === 6) {
      try {
        const doc = await db.collection('urls').doc(shortCode).get();
        if (doc.exists) {
          const longUrl = doc.data().longUrl;
          window.location.replace(longUrl);
        } else {
          resultDiv.innerHTML = 'URL not found';
        }
      } catch (error) {
        resultDiv.innerHTML = 'Error: ' + error.message;
      }
    }
  })();
})();