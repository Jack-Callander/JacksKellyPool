import Event from "./Event.js";

class Database {
    constructor() {
        this._game_keys = [];
        this._valid_key_chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        window.addEventListener("beforeunload", () => { this._deconstructor(); });

        this._fb = firebase.database();

        this.generatedCodesEvent = new Event();
        this.removedCodesEvent = new Event();
    }

    NewGame(info) {
        const game_code = this._GenerateCode(6);
        this._game_keys.push(game_code);

        let player_codes = [];
        info.initial_balls_list.forEach(player => {
            const player_code = this._GenerateCodeUnique(3, player_codes);
            player_codes.push(player_code);

            this._fb.ref(`games/${game_code}/${player_code}`).set({
                name: player.name,
                balls: player.balls,
            });
        });

        this.generatedCodesEvent.trigger({
            game_code: game_code,
            player_codes: player_codes,
        });
    }

    EndGame() {
        this._game_keys.forEach(key => {
            this._fb.ref(`games/${key}`).remove();
        });
        this._game_keys = [];

        this.removedCodesEvent.trigger();
    }

    _GenerateCode(length) {
        let code = "";
        for (let i = 0; i < length; i++) {
            const index = Math.floor(Math.random() * this._valid_key_chars.length);
            code += this._valid_key_chars.charAt(index);
        }
        return code;
    }

    _GenerateCodeUnique(length, dup_list) {
        let code = this._GenerateCode(length);
        while (dup_list.includes(code)) code = this._GenerateCode(length);
        return code;
    }

    _deconstructor() {
        this.EndGame();
    }
}

export default Database;