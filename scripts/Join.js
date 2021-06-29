// FRONT END
const mod_error = document.getElementById("modal_error");
const lbl_error_text = document.getElementById("error_text");
const btn_close_error = document.getElementById("btn_closeError");
const mod_balls = document.getElementById("modal_balls");
const btn_close_balls = document.getElementById("btn_closeBalls");
window.onclick = function(e) {
    if (e.target == mod_error) { mod_error.style.display = "none"; }
    if (e.target == mod_balls) { mod_balls.style.display = "none"; }
}
btn_close_error.addEventListener("click", () => { mod_error.style.display = "none"; });
btn_close_balls.addEventListener("click", () => { mod_balls.style.display = "none"; });

const con_player = document.getElementById("player_con");
const lbl_player_name = document.getElementById("player_name");
const con_rack = document.getElementById("rack_con");
const btn_show = document.getElementById("btn_show");
const lbl_game_code = document.getElementById("game_label");

const balls = [];
for (let i = 0; i < 15; i++) {
    balls.push(document.getElementById(`ball${i+1}`));
}

btn_show.addEventListener("click", () => { mod_balls.style.display = "block"; });

// CODES
const tbx_game_code = document.getElementById("game_code");
const tbx_player_code = document.getElementById("player_code");

const selectOnFocus = (e) => {
    if (e.target.value.length === e.target.maxLength) e.target.select();
};

tbx_game_code.addEventListener("keyup", () => {
    if (tbx_game_code.value.length === tbx_game_code.maxLength) {
        tbx_player_code.focus();
    }
});

tbx_game_code.addEventListener("focus", selectOnFocus);
tbx_player_code.addEventListener("focus", selectOnFocus);

// IMPLEMENTATION
const connect = (game_code, player_code) => {
    firebase.database().ref(`games/${game_code}/${player_code}`).get().then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();

            lbl_player_name.innerText = data.name;

            for (let i = 0; i < 15; i++) {
                if (data.balls.includes(i+1)) {
                    balls[i].setAttribute("vis", "");
                } else {
                    balls[i].removeAttribute("vis");
                }
            }

            lbl_game_code.innerText = `Joined Game ${game_code}`;

            firebase.database().ref(`games/${game_code}/${player_code}`).on("value", (snapshot2) => {
                const data2 = snapshot2.val();
                btn_show.innerText = `SHOW ${data2.show_count}`;
            });
            btn_show.addEventListener("click", () => {
                const new_count = parseInt(btn_show.innerText.split(" ")[1]) + 1;
                btn_show.innerText = `SHOW ${new_count}`;
                firebase.database().ref(`games/${game_code}/${player_code}`).update({
                    show_count: new_count,
                });
            });

            tbx_game_code.style.display = "none";
            tbx_player_code.style.display = "none";
            btn_join.style.display = "none";
            lbl_game_code.style.display = "flex";
            con_player.style.display = "flex";
            con_rack.style.display = "flex";
            
        } else {
            lbl_error_text.innerText = "Unable to find Player or Game.";
            mod_error.style.display = "block";
        }
    });
};

const safeConnect = () => {
    if (game_code.value.length !== game_code.maxLength || /[^A-Z0-9]/.test(game_code.value.toUpperCase())) {
        lbl_error_text.innerText = "Invalid Game Code!";
        mod_error.style.display = "block";
        return;
    }
    if (player_code.value.length !== player_code.maxLength || /[^A-Z0-9]/.test(player_code.value.toUpperCase())) {
        lbl_error_text.innerText = "Invalid Player Code!";
        mod_error.style.display = "block";
        return;
    }

    connect(game_code.value.toUpperCase(), player_code.value.toUpperCase());
};

// BUTTONS
const btn_join = document.getElementById("btn_join");
const btn_menu = document.getElementById("btn_main_menu");

btn_join.addEventListener("click", safeConnect);
btn_menu.addEventListener("click", () => { window.location.replace("/"); });


// FIREBASE
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