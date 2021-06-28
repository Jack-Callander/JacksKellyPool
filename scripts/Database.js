import Event from "./Event.js";

class Database {
    constructor() {
        this._game_keys = [];
        this._valid_key_chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        window.addEventListener("beforeunload", () => { this._deconstructor(); });

        this._fb = firebase.database();
    }

    NewGame(info) {
        const game_code = this._GenerateCode(4);
        this._game_keys.push(game_code);

        let player_codes = [];
        info.initial_balls_list.forEach(player => {
            const player_code = this._GenerateCode(3);
            this._fb.ref(`games/${game_code}/${player_code}`).set({
                name: player.name,
                balls: player.balls,
            });
        });
    }

    EndGame() {
        this._game_keys.forEach(key => {
            this._fb.ref(`games/${key}`).remove();
        });
    }

    _GenerateCode(length) {
        let code = "";
        for (let i = 0; i < length; i++) {
            const index = Math.floor(Math.random() * this._valid_key_chars.length);
            code += this._valid_key_chars.charAt(index);
        }
        return code;
    }

    _deconstructor() {
        this.EndGame();
    }
}

export default Database;