class Player_Stats {
    constructor(player_name, divulged) {
        this.name = player_name;
        this.divulged = divulged;

        this.past_game_save_count = 20;
        this.max_opponents = 14;
        this.amount_of_ball_counts = 6; // ie - save 1 divulged up to 4 balls.

        // _game_past is a 2D array where the first dimension is the amount of players in the game, and the second dimension is
        //  the amount of balls this player had in that situation.
        this._game_past = [];
        let empty_past = "";
        for (let i = 0; i < this.past_game_save_count; i++) { empty_past += "-"; }
        for (let i = 0; i < this.max_opponents; i++) {
            let _past_ball_counts = [];
            for (let j = 0; j < this.amount_of_ball_counts; j++) {
                _past_ball_counts.push(empty_past);
            }
            this._game_past.push(_past_ball_counts);
        }

        // Load existing stats
        if (localStorage.getItem(`player_stat_${this.name}`) !== null) {
            this._Load(localStorage.getItem(`player_stat_${this.name}`));
        }
    }

    AddWin(player_count, ball_count) {
        this._AddStat(player_count, ball_count, "w");
    }

    AddLoss(player_count, ball_count) {
        this._AddStat(player_count, ball_count, "l");
    }

    DeleteStats() {
        let player_names = localStorage.getItem("player_names_list").split(";");
        player_names.splice(player_names.indexOf(this.name), 1);

        localStorage.setItem("player_names_list", player_names.join(";"));
        localStorage.removeItem(`player_stat_${this.name}`);
    }

    _AddStat(player_count, ball_count, stat_char) {
        if (player_count <= 1) return;
        if (ball_count > 4) return;
        if (!this.divulged) ball_count += 2;

        let queue = this._game_past[player_count - 2][ball_count - 1];

        queue = [stat_char, ...queue];
        queue.length = this.past_game_save_count;
        queue = queue.join("");

        this._game_past[player_count - 2][ball_count - 1] = queue;
        this._Save();
    }

    Stats() {
        let total_wins = [];
        let total_games = [];
        for (let i = 0; i < this.max_opponents; i++) {
            total_wins.push([]);
            total_games.push([]);
            for (let j = 0; j < this.amount_of_ball_counts; j++) {
                let win_sum = 0;
                let game_sum = 0;

                for (let k = 0; k < this._game_past[i][j].length; k++) {
                    if (this._game_past[i][j][k] === 'w') {
                        win_sum++;
                        game_sum++;
                    } else if (this._game_past[i][j][k] === 'l') {
                        game_sum++;
                    }
                }

                total_wins[i].push(win_sum);
                total_games[i].push(game_sum);
            }
        }

        const stats = {
            name: this.name,
            total_wins: total_wins,
            total_games: total_games,
        }
        return stats;
    }

    _Load(save_string) {

        let ball_amount_groups = save_string.split("|");

        for (let i = 0; i < this.max_opponents; i++) {

            let ball_amounts = ball_amount_groups[i].split(";");

            for (let j = 0; j < this.amount_of_ball_counts; j++) {
                this._game_past[i][j] = ball_amounts[j];
            }
        }
    }

    _Save() {
        let save_string = "";
        for (let i = 0; i < this.max_opponents; i++) {
            for (let j = 0; j < this.amount_of_ball_counts; j++) {
                save_string += this._game_past[i][j];
                save_string += ";";
            }
            save_string += "|";
        }
        localStorage.setItem(`player_stat_${this.name}`, save_string);

        let saved_players_list = localStorage.getItem("player_names_list");
        if (saved_players_list !== null) {
            const list = saved_players_list.split(";");
            list.length--;

            if (!list.includes(this.name)) saved_players_list += `${this.name};`;
        } else {
            saved_players_list = `${this.name};`;
        }
        localStorage.setItem("player_names_list", saved_players_list);
    }
}

export default Player_Stats;