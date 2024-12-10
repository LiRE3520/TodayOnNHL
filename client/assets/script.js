document.getElementById("showTeams").addEventListener("click", function() {
    document.getElementById("teams").style.display = "block";
    document.getElementById("matches").style.display = "none";
});

document.getElementById("showMatches").addEventListener("click", function() {
    document.getElementById("teams").style.display = "none";
    document.getElementById("matches").style.display = "block";
});