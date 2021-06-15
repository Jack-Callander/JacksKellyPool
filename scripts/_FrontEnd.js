// Remove loading screen
window.onload = function() {
    document.getElementById("modal_loading").style.display = "none";
}

// Prevent accidental refresh
window.onbeforeunload = function() {
    return "Are you sure you want to leave/reload?";
}

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