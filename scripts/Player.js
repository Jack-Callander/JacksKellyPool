import Player_Stats from "./Player_Stats.js";

class Player {
    constructor({name, ball_count, divulged}) {
        this._name = name;
        this._number_of_balls_assigned = ball_count;
        this._number_of_balls_remaining = ball_count;
        this._balls = [];

        this._stats = new Player_Stats(name, divulged);
    }

    AddBall(ball) {
        this._balls.push(ball);
    }

    AddGame(player_count, was_the_winner) {
        if (was_the_winner)
            this._stats.AddWin(player_count, this._number_of_balls_assigned);
        else
            this._stats.AddLoss(player_count, this._number_of_balls_assigned);
    }

    UpdateState({current_rack}) {
        let count_balls_left = 0;
        this._balls.forEach(ball => {
            if (current_rack.includes(ball)) count_balls_left++;
        });
        this._number_of_balls_remaining = count_balls_left;
    }

    get name() { return this._name; }
    set ball_count(count) { this._number_of_balls_assigned = Math.max(count, 0); }
    get ball_count() { return this._number_of_balls_assigned; }
    get balls() { return this._balls; }
    get balls_left() { return this._number_of_balls_remaining; }
    get stats() { return this._stats.Stats(); }
}

export default Player;