document.addEventListener('DOMContentLoaded', function() {
  let resultDiv = document.getElementById('result');
  if (!resultDiv) {
    console.error('Error: #result not found');
    document.write('<div id="result"></div>');
    resultDiv = document.getElementById('result');
  }
  resultDiv.innerHTML = 'Checking Firebase...';

  console.log('Script initialized');

  let db; // Declare db globally

  if (typeof firebase === 'undefined') {
    resultDiv.innerHTML += '<br>Error: Firebase SDK not loaded';
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
      db = firebase.firestore();
      console.log('Firebase initialized');
    } catch (error) {
      resultDiv.innerHTML += '<br>Init error: ' + error.message;
      console.error('Firebase init error:', error);
    }
  }

  function generateShortCode() {
    return Math.random().toString(36).substring(2, 8);
  }

  window.shortenUrl = async function () {
    resultDiv.innerHTML += '<br>Function triggered';
    console.log('Shorten triggered');
    if (!db) {
      resultDiv.innerHTML += '<br>Firestore not initialized';
      console.error('Firestore not initialized');
      return;
    }
    const longUrl = document.getElementById('longUrl')?.value || '';
    if (!longUrl || !longUrl.startsWith('http')) {
      resultDiv.innerHTML += '<br>Invalid URL';
      console.log('Invalid URL:', longUrl);
      return;
    }

    const shortCode = generateShortCode();
    resultDiv.innerHTML += '<br>Code: ' + shortCode;
    try {
      await db.collection('urls').doc(shortCode).set({
        longUrl: longUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      resultDiv.innerHTML += '<br>Saved with ID: ' + shortCode;
      const shortUrl = window.location.origin + '/gshort/' + shortCode;
      resultDiv.innerHTML += '<br>Short URL: <a href="' + shortUrl + '">' + shortUrl + '</a>';
      console.log('Short URL created:', shortUrl);
    } catch (error) {
      resultDiv.innerHTML += '<br>Error: ' + error.message;
      console.error('Save error:', error);
    }
  };

  window.onload = async function () {
    if (!db) {
      resultDiv.innerHTML += '<br>Firestore init failed';
      console.error('Firestore init failed in onload');
      return;
    }
    try {
      let path = window.location.pathname;
      resultDiv.innerHTML += '<br>Path: ' + path;
      console.log('Onload path:', path);
      let shortCode = path.split('/').pop();
      if (path.startsWith('/gshort/') && shortCode.length === 6) {
        resultDiv.innerHTML += '<br>Short code: ' + shortCode;
        document.body.setAttribute('data-shortcode', 'true');
        console.log('Short code extracted:', shortCode);
        resultDiv.innerHTML += '<br>Querying Firestore';
        const doc = await db.collection('urls').doc(shortCode).get();
        resultDiv.innerHTML += '<br>Query done, exists: ' + doc.exists;
        if (doc.exists) {
          const longUrl = doc.data().longUrl;
          resultDiv.innerHTML += '<br>Long URL: ' + longUrl;
          resultDiv.innerHTML += '<br>Redirecting to: ' + longUrl;
          window.setTimeout(() => {
            resultDiv.innerHTML += '<br>Redirect executed';
            window.location.replace(longUrl);
          }, 2000);
        } else {
          resultDiv.innerHTML += '<br>URL not found';
        }
      } else if (path === '/gshort' || path === '/') {
        resultDiv.innerHTML += '<br>At base page';
        console.log('At base page');
      } else {
        resultDiv.innerHTML += '<br>Invalid path';
      }
    } catch (error) {
      resultDiv.innerHTML += '<br>Onload error: ' + error.message;
      console.error('Onload error:', error);
    }
  };
});