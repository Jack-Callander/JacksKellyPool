// Remove loading screen
window.addEventListener("load", () => {
    document.getElementById("modal_loading").style.display = "none";
});

// Close modals that can be closed
window.onclick = function(e) {
    let m = document.getElementById("modal_newGame");
    if (e.target == m) { m.style.display = "none"; }

    m = document.getElementById("modal_balls");
    if (e.target == m) { m.style.display = "none"; }

    m = document.getElementById("modal_error");
    if (e.target == m) { m.style.display = "none"; }

    m = document.getElementById("modal_stats");
    if (e.target == m) { m.style.display = "none"; }
}

// Connect to Firebase
// The following connection to firebase has no form of security on it, which is pretty much always bad practice, 
//  but for this project I doubt this will be a problem.

const firebaseConfig = {
    apiKey: "AIzaSyD8H1GgwDphlyDsmt2Np0DxsQahR9LRN4c",
    authDomain: "kellypool.firebaseapp.com",
    projectId: "kellypool",
    storageBucket: "kellypool.appspot.com",
    messagingSenderId: "102507307334",
    appId: "1:102507307334:web:a7380521c1a878545d4547",
    databaseURL: "https://kellypool-default-rtdb.asia-southeast1.firebasedatabase.app/",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);