// Ensure firebase is loaded from CDN scripts
document.getElementById('result').innerHTML += '<br>Checking Firebase...';

if (typeof firebase === 'undefined') {
  document.getElementById('result').innerHTML += '<br>Error: Firebase SDK not loaded. Check internet or script tags.';
} else {
  document.getElementById('result').innerHTML += '<br>Firebase SDK loaded';
  try {
    const { initializeApp } = firebase;
    const { getFirestore, doc, setDoc, serverTimestamp, getDoc } = firebase.firestore;
    if (!firebaseConfig || firebaseConfig !== 'object') {
      document.getElementById('result').innerHTML += '<br>Error: firebaseConfig is missing or invalid';
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

    const app = initializeApp(firebaseConfig);
    document.getElementById('result').innerHTML += '<br>Firebase initialized';
    const db = getFirestore(app);

    // Function to generate a random short code
    function generateShortCode() {
      return Math.random().toString(36).substring(2, 8); // 6-character code
    }

    // Function to shorten URL
    async function shortenUrl() {
      document.getElementById('result').innerHTML += '<br>Function triggered';
      const longUrl = document.getElementById('longUrl').value;
      if (!longUrl || !longUrl.startsWith('http')) {
        document.getElementById('result').innerHTML += '<br>Error: Please enter a valid URL starting with http or https';
        return;
      }

      const shortCode = generateShortCode();
      document.getElementById('result').innerHTML += '<br>Generated short code: ' + shortCode;
      try {
        await setDoc(doc(db, 'urls', shortCode), {
          longUrl: longUrl,
          createdAt: serverTimestamp()
        });
        const shortUrl = window.location.origin + '/' + shortCode;
        document.getElementById('result').innerHTML += '<br>Success: Document written with ID: ' + shortCode + '<br>Shortened URL: <a href="' + shortUrl + '" target="_blank">' + shortUrl + '</a>';
      } catch (error) {
        document.getElementById('result').innerHTML += '<br>Error: ' + error.message;
      }
    }

    // Redirect logic for shortened URLs
    window.onload = async function () {
      const path = window.location.pathname.substring(1); // Get short code from URL
      if (path) {
        try {
          const docSnap = await getDoc(doc(db, 'urls', path));
          if (docSnap.exists()) {
            window.location.href = docSnap.data().longUrl; // Redirect to long URL
          } else {
            document.getElementById('result').innerHTML += '<br>URL not found';
          }
        } catch (error) {
          document.getElementById('result').innerHTML = '<br>Error: ' + error.message;
        }
      }
    };
  } catch (error) {
    document.getElementById('result').innerHTML += '<br>Initialization error: ' + error.message;
  }
}