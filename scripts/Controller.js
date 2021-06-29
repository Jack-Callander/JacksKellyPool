import Model from "./Model.js";
import View from "./View.js";
import Database from "./Database.js";

class Controller {
    constructor() {
        this._model = new Model();
        this._view = new View();
        this._database = new Database();

        // View -> Model
        this._view.startGameEvent.addListener(e => { this._model.StartGame(e); });
        this._view.endGameEvent.addListener(e => { this._model.EndGame(e); });
        this._view.pocketBallEvent.addListener(e => { this._model.PocketBall(e); });
        this._view.undoPocketBallEvent.addListener(e => { this._model.UndoPocketBall(e); });
        this._view.requestPlayerStats.addListener(e => { this._model.GetPlayerStats(e); });
        this._view.requestDeleteStats.addListener(e => { this._model.DeletePlayerStats(e); });

        // Model -> View
        this._model.gameStartedEvent.addListener(e => { this._view.ToggleNewGame(e); });
        this._model.gameEndedEvent.addListener(e => { this._view.ToggleNewGame(e); });
        this._model.pocketedBallEvent.addListener(e => { this._view.UpdateGameState(e); });
        this._model.invalidPlayerNamesEvent.addListener(e => { this._view.ShowError(e); });
        this._model.invalidBallCountEvent.addListener(e => { this._view.ShowError(e); });
        this._model.responsePlayerStats.addListener(e => { this._view.ShowStats(e); });
        this._model.responseDeleteStats.addListener(e => { this._view.RefreshStatsTable(e); });

        // Model -> Database
        this._model.gameStartedEvent.addListener(e => { this._database.NewGame(e); });
        this._model.gameEndedEvent.addListener(e => { this._database.EndGame(); });

        // Database -> View
        this._database.generatedCodesEvent.addListener(e => { this._view.ShowCodes(e); });
        this._database.removedCodesEvent.addListener(e => { this._view.HideCodes(e); });



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
}

export default Controller;