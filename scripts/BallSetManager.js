class BallSetManager {
    
    constructor() {
        this._assetsPath = "./images";
        this._defaultPreset = 1; // Default set below, zero indexed
        this._presetNames = {
            "aramith_tournament_set": "Aramith Tournament Set",
            "aramith_tv_set": "Aramith TV Set",
            "classic_set": "Classic Set",
            "cyclop_set": "Cyclop Set"
        };
        this._presetKey = "ballSetPreset";
        this._preset = this._LoadPreset();
        this._ballSet = this._LoadBallSet({preset: this._preset});
    }
    
    GetBallUrl({ballId}) {
        if (!Object.keys(this._ballSet).includes(ballId)) return null;
        return `${this._assetsPath}/${this._ballSet[ballId]}/${ballId}.png`;
    }
    
    SaveBall({ballId, index}) {
        if (!Object.keys(this._ballSet).includes(ballId)) return false;
        if (index == 0) {
            this.ResetBall({ballId: ballId});
            return true;
        }
        
        let presetId = Object.keys(this._presetNames)[index - 1];
        
        this._ballSet[ballId] = presetId;
        localStorage.setItem(this._GetBallKey({ballId: ballId}), presetId);
        return true;
    }
    
    ResetBall({ballId}) {
        this._ballSet[ballId] = this._preset;
        localStorage.removeItem(this._GetBallKey({ballId: ballId}));
    }
    
    ResetAll() {
        localStorage.removeItem(this._presetKey);
        this._preset = Object.keys(this._presetNames)[this._defaultPreset];
        for (let ballId of Object.keys(this._ballSet)) {
            this.ResetBall({ballId: ballId});
        }
    }
    
    SavePreset({index}) {
        let presetId = Object.keys(this._presetNames)[index];
        localStorage.setItem(this._presetKey, presetId);
        this._preset = presetId;
        this._ballSet = this._LoadBallSet({preset: presetId});
    }
    
    PresetNames() {
        return Object.values(this._presetNames);
    }
    
    InitialPresetSelection({ballId}) {
        if (ballId == undefined) {
            return Object.keys(this._presetNames).indexOf(this._preset);
        } else
            if (localStorage.getItem(this._GetBallKey({ballId: ballId})) == null) return 0;
            return Object.keys(this._presetNames).indexOf(this._ballSet[ballId]) + 1;
    }
    
    _LoadPreset() {
        let preset = localStorage.getItem(this._presetKey);
        if (preset == null) preset = Object.keys(this._presetNames)[this._defaultPreset];
        return preset;
    }
    
    _LoadBallSet({preset}) {
        let ballSet = {};
        for (let i = 0; i < 15; i++) {
            let ball = localStorage.getItem(this._GetBallKey({ballNumber: i + 1}));
            if (ball == null) ball = preset;
            ballSet[`${i+1}ball`] = ball;
        }
        return ballSet;
    }
    
    _GetBallKey({ballId, ballNumber}) {
        let number = ballNumber;
        if (number == undefined)
            number = this._BallIndex({ballId});
        return `ballPreset${number}`;
    }
    
    _BallIndex({ballId}) {
        let number = ballId.replace(/\D/, '');
        return parseInt(number);
    }
}

export default BallSetManager;