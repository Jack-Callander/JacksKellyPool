import Event from "./Event.js";

class Database {
    constructor() {
        this._game_keys = [];
        this._current_game_key = "";
        this._valid_key_chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        window.addEventListener("beforeunload", () => { this._deconstructor(); });

        this._fb = firebase.database();

        this._rack = [];

        this.generatedCodesEvent = new Event();
        this.removedCodesEvent = new Event();
        this.updateShowCountEvent = new Event();
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
                show_count: 0,
            });
        });

        this._rack = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        this._fb.ref(`games/${game_code}/game_info`).set({
            rack: this._rack,
        });

        this._current_game_key = game_code;
        this.generatedCodesEvent.trigger({
            game_code: game_code,
            player_codes: player_codes,
        });

        for (let i = 0; i < info.initial_balls_list.length; i++) {
            this._fb.ref(`games/${game_code}/${player_codes[i]}`).on("value", (snapshot) => {
                const data = snapshot.val();
                this.updateShowCountEvent.trigger({
                    player_name: info.initial_balls_list[i].name,
                    show_count: data.show_count,
                });
            });
        }
    }

    EndGame() {
        this._game_keys.forEach(key => {
            this._fb.ref(`games/${key}`).remove();
        });
        this._game_keys = [];
        this._current_game_key = "";

        this.removedCodesEvent.trigger();
    }

    PocketBall({ball}) {
        if (this._rack.splice(this._rack.indexOf(ball), 1).length !== 0) {
            this._fb.ref(`games/${this._current_game_key}/game_info`).update({
                rack: this._rack,
            });
        }
    }

    UndoPocketBall({ball}) {
        if (!this._rack.includes(ball)) {
            this._rack.push(ball);
            this._fb.ref(`games/${this._current_game_key}/game_info`).update({
                rack: this._rack,
            });
        }
    }

    UpdateShowCount({player_code, show_count}) {
        this._fb.ref(`games/${this._current_game_key}/${player_code}`).update({
            show_count: show_count,
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