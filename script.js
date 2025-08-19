(function() {
  let resultDiv = document.getElementById('result');
  if (!resultDiv) {
    document.body.innerHTML = '<div id="result"></div>';
    resultDiv = document.getElementById('result');
  }

  function updateStatus(isComment, text) {
    alert('in update status isComment = ' + isComment);
    if (isComment == true) {
      resultDiv.innerHTML += '<!-- ' + text + ' -->';
    } else {
      resultDiv.innerHTML += '<br>' + text;
    }
    resultDiv.style.display = 'none';
    resultDiv.offsetHeight; // Trigger reflow
    resultDiv.style.display = 'block';
    alert('end update status');
  }

  updateStatus(true, 'Script loaded'); // Debug: Confirm script is running

  let db;
  updateStatus(true, 'Checking Firebase...');
  if (typeof firebase === 'undefined') {
    updateStatus(true, 'Error: Firebase SDK not loaded. Check internet or script tags.');
    return;
  }
  updateStatus(true, 'Firebase SDK loaded');
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
    updateStatus(true, 'Firebase initialized');
    db = firebase.firestore();
  } catch (error) {
    updateStatus(true, 'Init error: ' + error.message);
    return;
  }

  function validateUrl(url) {
    try {
      // Initial checks
      if (!url || typeof url !== 'string') {
        updateStatus(true, `Validation error: URL is not a string: ${url}`);
        updateStatus(false, 'URL Validation error. Please try again later.')
        return false;
      }

      // Pre-check for traversal sequences in raw URL
      const hasRawTraversal = /\/\.\.(\/|$)/.test(url) || /%2e%2e(\/|$)/i.test(url);
      if (hasRawTraversal) {
        updateStatus(true, `Validation error: Traversal sequence detected in raw URL: ${url}`);
        updateStatus(false, 'URL Validation error. Please try again later.')
        return false;
      }

      // Parse URL
      let urlObj;
      try {
        urlObj = new URL(url);
      } catch (e) {
        updateStatus(true, `Validation error: Invalid URL format: ${url}, Error: ${e.message}`);
        updateStatus(false, 'URL Validation error. Please try again later.')
        return false;
      }

      // Protocol check
      const isValidProtocol = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      updateStatus(true, `Protocol check for ${url}: ${isValidProtocol}`);
      if (!isValidProtocol) {
        updateStatus(true, `Validation error: Invalid protocol for ${url}`);
        updateStatus(false, 'URL Validation error. Please try again later.')
        return false;
      }

      // Hostname check
      const isValidHostname = urlObj.hostname === 'groot327.github.io';
      updateStatus(true, `Hostname check for ${url}: ${isValidHostname}`);
      if (!isValidHostname) {
        updateStatus(true, `Validation error: Invalid hostname for ${url}`);
        updateStatus(false, 'Invalid host name. Please try again later.')
        return false;
      }

      // Length check (e.g., 10,000 characters max)
      const maxLength = 10000;
      if (url.length > maxLength) {
        updateStatus(true, `Validation error: URL exceeds ${maxLength} characters: ${url.length}`);
        updateStatus(false, 'URL too long. Please try again later.')
        return false;
      }

      // Whitelist characters for path and query
      const allowedChars = /^[a-zA-Z0-9\-._/~:/?#[\]@!$&'()*+,;=]+$/;
      const pathAndQuery = urlObj.pathname + (urlObj.search ? urlObj.search : '') + (urlObj.hash ? urlObj.hash : '');
      const isValidPathQuery = allowedChars.test(pathAndQuery);
      updateStatus(true, `Path/Query check for ${pathAndQuery}: ${isValidPathQuery}`);
      if (!isValidPathQuery) {
        updateStatus(true, `Validation error: Invalid characters in ${pathAndQuery}`);
        updateStatus(false, 'URL Validation error. Please try again later.')
        return false;
      }

      const isValidUrl = isValidProtocol && isValidHostname && isValidPathQuery;
      updateStatus(true, `Validating URL: ${url}, Result: ${isValidUrl}`);
      return isValidUrl;
    } catch (error) {
      updateStatus(true, `Validation error: ${error.message} for URL ${url}`);
      return false;
    }
  }

  (async function redirect() {
    const queryString = window.location.search.substring(1);
    let shortCode = queryString.match(/^[a-zA-Z0-9]*/) ? queryString.match(/^[a-zA-Z0-9]*/)[0] : '';
    if (!shortCode) return;
    // updateStatus('Redirect logic started for query: ' + queryString);
    if (shortCode.length !== 6) {
      updateStatus(true, 'Invalid short code');
      return;
    }
    try {
      if (!db) {
        updateStatus(true, 'Firestore not available');
        return;
      }
      const doc = await db.collection('urls').doc(shortCode).get();
      updateStatus(true, 'Firestore query completed, exists: ' + doc.exists);
      if (doc.exists) {
        const longUrl = doc.data().longUrl;
        window.location.replace(longUrl);
      } else {
        updateStatus(true, 'URL not found');
      }
    } catch (error) {
      updateStatus(true, 'Redirect error: ' + error.message);
    }
  })();

  function generateShortCode() {
    return Math.random().toString(36).substring(2, 8);
  }

  window.shortenUrl = async function () {
    updateStatus(true, 'Function triggered');
    if (!db) {
      updateStatus(true, 'Error: Firestore not initialized');
      return;
    }
    const longUrl = document.getElementById('longUrl').value;
    if (!validateUrl(longUrl)) {
      updateStatus(true, 'Invalid URL: Only groot327.github.io URLs with valid characters are allowed.');
      // window.location.replace('https://fbi.gov/investigate');
      return;
    }

    const shortCode = generateShortCode();
    updateStatus(true, 'Generated code: ' + shortCode);
    try {
      await db.collection('urls').doc(shortCode).set({
        longUrl: longUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      updateStatus(true, 'Success: Saved ID: ' + shortCode);
      const shortUrl = window.location.origin + '/gshort?' + shortCode;
      updateStatus(false, 'Short URL: <a href="' + shortUrl + '">' + shortUrl + '</a>');
    } catch (error) {
      updateStatus(false, 'Save error: ' + error.message);
    }
  };

  updateStatus(true, 'Script initialization complete'); // Debug: Confirm end of setup
})();