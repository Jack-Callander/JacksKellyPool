import Model from "./Model.js";
import View from "./View.js";

class Controller {
    constructor() {
        this._model = new Model();
        this._view = new View();

        this._view.startGameEvent.addListener(e => { this._model.StartGame(e); });
        this._view.endGameEvent.addListener(e => { this._model.EndGame(e); });
        this._view.pocketBallEvent.addListener(e => { this._model.PocketBall(e); });
        this._view.undoPocketBallEvent.addListener(e => { this._model.UndoPocketBall(e); });
        this._view.requestPlayerStats.addListener(e => { this._model.GetPlayerStats(e); });
        this._view.requestDeleteStats.addListener(e => { this._model.DeletePlayerStats(e); });

        this._model.gameStartedEvent.addListener(e => { this._view.ToggleNewGame(e); });
        this._model.gameEndedEvent.addListener(e => { this._view.ToggleNewGame(e); });
        this._model.pocketedBallEvent.addListener(e => { this._view.UpdateGameState(e); });
        this._model.invalidPlayerNamesEvent.addListener(e => { this._view.ShowError(e); });
        this._model.invalidBallCountEvent.addListener(e => { this._view.ShowError(e); });
        this._model.responsePlayerStats.addListener(e => { this._view.ShowStats(e); });
        this._model.responseDeleteStats.addListener(() => { this._view.RefreshStatsTable(); });



        // Debug messages
        // this._model.invalidPlayerNamesEvent.addListener(e => { console.log(`Invalid Player Names Event: `); console.log({e}); });
        // this._model.invalidBallCountEvent.addListener(e => { console.log(`Invalid Ball Count Event: `); console.log({e}); });
        // this._model.assignedNewBallsEvent.addListener(e => { console.log(`Assigned New Balls Event: `); console.log({e}); });
        // this._model.gameStartedEvent.addListener(e => { console.log(`Started! `); console.log({e}); });
        // this._model.gameEndedEvent.addListener(e => { console.log(`Ended! `); console.log({e}); });
        // this._model.pocketedBallEvent.addListener(e => { console.log(`New Game State! `); console.log({e}); });
    }

    Run() {
        
    }

    __RunTests() {
        this.___StartUpTests();
        this.___GameplayTests();
    }

    ___StartUpTests() {
        this._model.StartGame({
            player_names: ["Jack", "Jesse", "Matthew", "Josephine"],
            ball_counts: [2, 2, 2, 2],
            do_allow_ball_overlaps: false,
        });

        this._model.EndGame({winning_players_name: "Jesse"});
        this._model.EndGame({});    // Already Ended!

        this._model.StartGame({
            player_names: ["Jack"],
            ball_counts: [15],
            do_allow_ball_overlaps: false,
        });
        this._model.StartGame({     // Already Started!
            player_names: ["Interupt"],
            ball_counts: [15],
            do_allow_ball_overlaps: false,
        });
        this._model.EndGame({winning_players_name: "Jack"});

        this._model.StartGame({
            player_names: ["Jack", "Jesse", "Matthew", "Josephine", "Ethan", "Thomas", "Travis", "Lyam"],
            ball_counts: [2, 2, 2, 2, 2, 2, 2, 2],  // Too many balls (16 total)
            do_allow_ball_overlaps: false,
        });
        this._model.StartGame({
            player_names: ["Jack", "Jesse", "Matthew", "Josephine", "Ethan", "Thomas", "Travis", "Lyam"],
            ball_counts: [1, 2, 2, 2, 3, 3, 1, 1],
            do_allow_ball_overlaps: false,
        });
        this._model.EndGame({winning_players_name: "Jack"});

        this._model.StartGame({
            player_names: ["Jack", "Jesse", "Matthew", "Josephine", "Ethan", "Thomas", "Travis", "Lyam"],
            ball_counts: [2, 2, 2, 2, 3, 3, 4, 5],
            do_allow_ball_overlaps: true,
        });
        this._model.EndGame({winning_players_name: "Jack"});

        this._model.StartGame({
            player_names: ["Jack", "Jesse", "Matthew", "Josephine", "Ethan", "Matthew", "Travis", "Lyam"], // Duplicate Player Names!
            ball_counts: [2, 2, 2, 2, 3, 3, 4, 5],
            do_allow_ball_overlaps: true,
        });
        this._model.StartGame({
            player_names: ["Jack,", "Je%sse", "Ma#tthew", "Joseph/ine", "Eth?an", "Th_omas", "Tr435avis", "Lyam"],   // Bad Names!
            ball_counts: [2, 2, 2, 2, 2, 2, 2, 2],  // Too many balls (16 total)
            do_allow_ball_overlaps: false,
        });
    }

    ___GameplayTests() {
        this._model.StartGame({
            player_names: ["Jack", "Jesse", "Matthew", "Josephine", "Ethan", "Thomas", "Travis", "Lyam"],
            ball_counts: [2, 2, 2, 2, 3, 3, 4, 5],
            do_allow_ball_overlaps: true,
        });
        for (let i = 0; i < 15; i++) {
            const random_ball = Math.floor(Math.random() * 15) + 1;
            console.log(`Pocketing ball: ${random_ball}`);
            this._model.PocketBall({ball: random_ball});
        }

        this._model.EndGame({});
    }
}

export default Controller;