import Event from "./Event.js";
import Player from "./Player.js";

class Model {
    constructor() {
        this._players = [];
        this._is_game_in_progress = false;
        this._is_allow_ball_overlaps_enabled = false;
        this._current_rack = [];

        this._balls_max = 15;
        this._full_rack = [];
        let i = 0;
        while (i < this._balls_max) this._full_rack.push(++i);
        this._current_rack = [...this._full_rack];

        this.gameStartedEvent = new Event();
        this.gameEndedEvent = new Event();
        this.pocketedBallEvent = new Event();
        this.assignedNewBallsEvent = new Event();
        this.invalidBallCountEvent = new Event();
        this.invalidPlayerNamesEvent = new Event();
        this.responsePlayerStats = new Event();
    }

    StartGame({player_names, ball_counts, divulged_list, do_allow_ball_overlaps}) {
        // Check for problems
        if (this._is_game_in_progress) return;
        if (!this._HasValidPlayerNames({player_names})) return;
        if (!this._HasValidBallCounts({ball_counts, do_allow_ball_overlaps})) return;

        // Create Players
        let i = 0;
        player_names.forEach(name => {
            this._players.push(new Player({
                name: name, 
                ball_count: ball_counts[i],
                divulged: divulged_list[i++],
            }));
        });

        // Assign Random Balls
        const initial_balls_list = this._AssignBalls(do_allow_ball_overlaps);
        
        this._is_game_in_progress = true;
        this._is_allow_ball_overlaps_enabled = do_allow_ball_overlaps;
        this.gameStartedEvent.trigger({initial_balls_list: initial_balls_list, is_game_in_progress: this._is_game_in_progress});
    }

    EndGame({winning_players_name}) {
        if (!this._is_game_in_progress) return;
        if (winning_players_name !== null) {
            let player_count = 0;
            this._players.forEach(player => { if (player.ball_count !== 0) player_count++; });

            this._players.forEach(player => {
                if (player.ball_count !== 0 && !this._is_allow_ball_overlaps_enabled)
                    player.AddGame(player_count, player.name === winning_players_name);
            });
        }

        this._players = [];
        this._current_rack = [...this._full_rack];
        this._is_game_in_progress = false;
        this.gameEndedEvent.trigger({winning_players_name: winning_players_name, is_game_in_progress: this._is_game_in_progress});
    }

    PocketBall({ball}) {
        if (!this._current_rack.includes(ball)) return;

        this._current_rack.splice(this._current_rack.indexOf(ball), 1);
        this._UpdateGameState();
    }

    UndoPocketBall({ball}) {
        if (this._current_rack.includes(ball)) return;

        this._current_rack.push(ball);
        this._UpdateGameState();
    }

    GetPlayerStats({name: name}) {
        const player = new Player({name: name, ball_count: 0, divulged: false});
        this.responsePlayerStats.trigger(player.stats);
    }

    _AssignBalls(do_allow_ball_overlaps) {
        let rack = [...this._full_rack]
        this._players.forEach(player => {
            for (let i = 0; i < player.ball_count; i++) {
                const random_index = Math.floor(Math.random() * rack.length);
                player.AddBall(rack.splice(random_index, 1)[0]);
            }
            if (do_allow_ball_overlaps) rack = [...this._full_rack];
        });

        let new_balls_list = [];
        this._players.forEach(player => {
            new_balls_list.push({
                name: player.name,
                balls: player.balls,
            });
        });
        this.assignedNewBallsEvent.trigger({new_balls_list});
        return new_balls_list;
    }

    _UpdateGameState() {
        this._players.forEach(player => {
            player.UpdateState({current_rack: this._current_rack});
        });

        let game_state = [];
        this._players.forEach(player => {
            game_state.push({
                name: player.name,
                balls_left: player.balls_left,
            });
        });

        this.pocketedBallEvent.trigger({game_state});
    }

    _HasValidPlayerNames({player_names}) {
        let valid = true;

        // Names Contain Valid Characters
        let bad_names = [];
        player_names.forEach(name => {
            if (/[^a-zA-Z0-9_'\- \!\?]/.test(name)) bad_names.push(name);
        });
        if (bad_names.length !== 0) {
            this.invalidPlayerNamesEvent.trigger({
                names: bad_names,
                message: `"${bad_names[0]}" is an invalid player name! The valid characters are A to Z, 0 to 9, underscore, hyphen, apostrophe, space, exclaimation mark and question mark.`,
            });
            valid = false;
        }

        // No Duplicate Names
        const duplicates = new Set(player_names.filter( (name, index) => player_names.indexOf(name) != index ));
        if (duplicates.size !== 0) { 
            const names = Array.from(duplicates.keys());
            this.invalidPlayerNamesEvent.trigger({
                names: names,
                message: `Two players cannot have the same name! "${names[0]}" appears more than once in the players list.`,
            });
            valid = false;
         }

        return valid;
    }

    _HasValidBallCounts({ball_counts, do_allow_ball_overlaps}) {
        let valid = true;
        const balls_max = this._balls_max;
        let balls_acc = 0;
        ball_counts.forEach(count => {
            balls_acc += count;
            if (balls_acc > balls_max) valid = false;
            if (do_allow_ball_overlaps) balls_acc = 0;
        });
        if (!valid) this.invalidBallCountEvent.trigger({message: `There aren't enough balls to go around!`});
        return valid;
    }

    get is_game_in_progress() { return this._is_game_in_progress(); }
}

export default Model;