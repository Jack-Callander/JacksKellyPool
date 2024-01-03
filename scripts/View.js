import Event from "./Event.js";
import BallSetManager from "./BallSetManager.js";

class View {
    constructor() {
        this.page_options = document.getElementById("options");
        this.page_game = document.getElementById("game");
        this.page_help = document.getElementById("help");

        this.btn_host_game = document.getElementById("btn_host_game");
        this.btn_join_game = document.getElementById("btn_join_game");

        this.btn_options = document.getElementById("btn_options");
        this.btn_game = document.getElementById("btn_game");
        this.btn_help = document.getElementById("btn_help");

        this.btn_sort = document.getElementById("btn_sort");
        this.btn_new_game_options = document.getElementById("btn_newOptionsGame");
        this.btn_new_game = document.getElementById("btn_newGame");
        this.btn_start_new_game = document.getElementById("btn_startNewGame");
        this.btn_cancel_new_game = document.getElementById("btn_cancelNewGame");
        this.game_in_progress = false;

        this.btn_close_show_mod = document.getElementById("btn_closeBalls");

        this.opt_player_count = document.getElementById("sel_playerCount");
        this.opt_ball_count = document.getElementById("sel_ballCount");
        this.opt_show_remaining = document.getElementById("cb_showRemainingBallCount");
        this.opt_show_remaining_current = true;
        this.opt_allow_overlaps = document.getElementById("cb_allowBallOverlaps");
        this.opt_allow_overlaps_current = false;
        this.opt_locked_balls = document.getElementById("locked_balls");

        this.con_players_options = document.getElementById("player_options_con");
        this.con_players_game = document.getElementById("game_con");
        this.con_rack_tracker = document.getElementById("game_tracker_con");

        this.mod_menu = document.getElementById("modal_menu");
        this.mod_new_game = document.getElementById("modal_newGame");
        this.mod_balls = document.getElementById("modal_balls");
        this.mod_error = document.getElementById("modal_error");
        this.mod_winner = document.getElementById("modal_winner");
        this.mod_stats = document.getElementById("modal_stats");
        this.mod_delete_stats = document.getElementById("modal_delete");
        this.mod_ball_preset = document.getElementById("modal_ball_preset");

        this.sel_winning_player = document.getElementById("sel_whoWon");
        this.btn_finish_game = document.getElementById("btn_finish");
        this.btn_cancel_finish_game = document.getElementById("btn_cancelFinish");

        this.lbl_stats_title = document.getElementById("stats_title");
        this.btn_close_stats = document.getElementById("btn_closeStats");
        this.btn_delete_player = document.getElementById("btn_deletePlayer");

        this.tbx_confirm_name = document.getElementById("delete_confirm_name");
        this.btn_confirm_delete_player = document.getElementById("btn_confirm_delete");
        this.btn_cancel_delete_player = document.getElementById("btn_cancel_delete");

        this.err_message = document.getElementById("error_text");
        this.btn_close_error = document.getElementById("btn_closeError");
        
        this.btn_customise_ball_set = document.getElementById("btn_customiseBallSet");
        this.opt_ball_set_preset = document.getElementById("sel_ballSetPreset");
        this.opts_ball_presets = document.getElementsByClassName("ballPreset");
        this.btn_reset_ball_preset = document.getElementById("btn_resetBallPreset");
        this.btn_close_ball_preset = document.getElementById("btn_closeBallPreset");

        this.lbl_game_code = document.getElementById("game_code");
        this.lbl_player_code = document.getElementById("player_code");
        this.player_codes = [];

        this.balls = [];
        this.rack = [];
        for (let i = 1; i <= 15; i++) {
            this.rack.push(document.getElementById(`${i}ball`));
            this.balls.push(document.getElementById(`ball${i}`));
        }
        this.players_still_in = [];

        this.player_count_options = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
        ];
        this.ball_count_options = [
            "0 Balls (Sitting Out)", "1 Divulged Ball", "2 Divulged Balls", "1 Ball", "2 Balls", "3 Balls", "4 Balls", "5 Balls",
            "6 Balls", "7 Balls", "8 Balls", "9 Balls", "10 Balls", "11 Balls", "12 Balls", "13 Balls", "14 Balls", "15 Balls"
        ];
        
        this.ballSetManager = new BallSetManager();
        
        this.startGameEvent = new Event();
        this.endGameEvent = new Event();
        this.pocketBallEvent = new Event();
        this.undoPocketBallEvent = new Event();
        this.requestPlayerStats = new Event();
        this.requestDeleteStats = new Event();
        this.updateShowCountEvent = new Event();

        this._RenderOptions();
        this._AssignEvents();
        this._RenderPlayerOptionsTable();
        this._RenderGameTable({is_game_in_progress: false});
        
        this._UpdateBallSet();
    }

    _RenderOptions() {
        this._PopulateSelect(this.opt_player_count, this.player_count_options);
        this._PopulateSelect(this.opt_ball_count, this.ball_count_options);
        this._PopulateSelect(this.opt_ball_set_preset, this.ballSetManager.PresetNames());
        this.opt_ball_set_preset.value = this.ballSetManager.InitialPresetSelection({});
        for (let opt_ball_preset of this.opts_ball_presets) {
            this._PopulateSelect(opt_ball_preset, ["Set Preset", ...this.ballSetManager.PresetNames()]);
            opt_ball_preset.value = this.ballSetManager.InitialPresetSelection({ballId: opt_ball_preset.getAttribute("ball")});
        }
        
        const options_player_count = localStorage.getItem("options_player_count");
        if (options_player_count !== null) {
            this.opt_player_count.selectedIndex = options_player_count;
        } else {
            this.opt_player_count.selectedIndex = 3;
        }

        const options_ball_index = localStorage.getItem("options_ball_index");
        if (options_ball_index !== null) {
            this.opt_ball_count.selectedIndex = options_ball_index;
        } else {
            this.opt_ball_count.selectedIndex = 4;
        }

        const options_show_remaining = localStorage.getItem("options_show_remaining");
        if (options_show_remaining !== null) {
            this._CheckElement(this.opt_show_remaining, options_show_remaining === "true");
            this.opt_show_remaining_current = options_show_remaining === "true";
        }

        const options_allow_overlaps = localStorage.getItem("options_allow_overlaps");
        if (options_allow_overlaps !== null) {
            this._CheckElement(this.opt_allow_overlaps, options_allow_overlaps === "true");
        }

        const options_locked_balls = localStorage.getItem("options_locked_balls");
        if (options_locked_balls !== null) {
            this.opt_locked_balls.value = options_locked_balls;
        }
    }

    _AssignEvents() {
        this.btn_host_game.addEventListener("click", () => { this.mod_menu.style.display = "none"; });
        this.btn_join_game.addEventListener("click", () => { window.location.replace("/join"); });

        this.btn_options.addEventListener("click", () => { this._ChangeTabs("options"); });
        this.btn_game.addEventListener("click", () => { this._ChangeTabs("game"); });
        this.btn_help.addEventListener("click", () => { this._ChangeTabs("help"); });

        this.opt_player_count.addEventListener("change", () => { this._RenderPlayerOptionsTable(); this._SaveOptions(); });
        this.opt_ball_count.addEventListener("change", () => { this._SaveOptions(); });
        this.opt_show_remaining.addEventListener("click", () => { this._CheckElement(this.opt_show_remaining, null); this._SaveOptions(); });
        this.opt_allow_overlaps.addEventListener("click", () => { this._CheckElement(this.opt_allow_overlaps, null); this._SaveOptions(); });
        this.opt_locked_balls.addEventListener("change", () => { this._SaveOptions(); });

        this.btn_sort.addEventListener("click", () => { this._SortPlayerOptionsTable(); });
        this.btn_new_game.addEventListener("click", () => { this._RequestStartOrEndGame(); });
        this.btn_new_game_options.addEventListener("click", () => { this._RequestStartOrEndGame(); });
        this.btn_start_new_game.addEventListener("click", () => { this._TriggerNewGame(); this._ChangeTabs("game"); this.mod_new_game.style.display = "none"; });
        this.btn_cancel_new_game.addEventListener("click", () => { this.mod_new_game.style.display = "none"; });

        this.btn_close_show_mod.addEventListener("click", () => { this.mod_balls.style.display = "none"; });
        this.rack.forEach(ball => { ball.addEventListener("click", (e) => {
            this._CheckElement(e.target, null);
            const value = parseInt(e.target.getAttribute("value"));
            if (this._IsChecked(e.target)) {
                this.pocketBallEvent.trigger({ball: value});
                this._CheckElement(this.balls[value - 1], true);
                
                const divulged_ball = document.getElementById(`dball${value}`);
                if (divulged_ball !== null) this._CheckElement(divulged_ball, true);

            } else {
                this.undoPocketBallEvent.trigger({ball: value});
                this._CheckElement(this.balls[value - 1], false);

                const divulged_ball = document.getElementById(`dball${value}`);
                if (divulged_ball !== null) this._CheckElement(divulged_ball, false);
            }
        }); });

        this.btn_close_stats.addEventListener("click", () => { this.mod_stats.style.display = "none"; });
        this.btn_close_error.addEventListener("click", () => { this.mod_error.style.display = "none"; });
        this.btn_close_ball_preset.addEventListener("click", () => { this.mod_ball_preset.style.display = "none"; });
        this.btn_finish_game.addEventListener("click", () => { this._EndGame(); this.mod_winner.style.display = "none"; });
        this.btn_cancel_finish_game.addEventListener("click", () => { this.mod_winner.style.display = "none"; });

        this.btn_delete_player.addEventListener("click", () => {
            this.mod_stats.style.display = "none";
            this.tbx_confirm_name.value = "";
            this.btn_confirm_delete_player.setAttribute("hidden", "");
            this.mod_delete_stats.style.display = "block";
        });

        this.tbx_confirm_name.addEventListener("change", () => { 
            if (this.tbx_confirm_name.value === this.lbl_stats_title.getAttribute("name"))
                this.btn_confirm_delete_player.removeAttribute("hidden");
            else
                this.btn_confirm_delete_player.setAttribute("hidden", "");
        });

        this.btn_cancel_delete_player.addEventListener("click", () => {
            this.mod_delete_stats.style.display = "none";
            this.mod_stats.style.display = "block";
        });

        this.btn_confirm_delete_player.addEventListener("click", () => {
            this.requestDeleteStats.trigger(this.tbx_confirm_name.value);
            this.mod_delete_stats.style.display = "none";
        });
        
        this.btn_customise_ball_set.addEventListener("click", () => {
            this.mod_ball_preset.style.display = "block";
        });
        
        this.opt_ball_set_preset.addEventListener("change", () => {
            this.ballSetManager.SavePreset({index: this.opt_ball_set_preset.value});
            this._UpdateBallSet();
        });
        for (let opt_ball_preset of this.opts_ball_presets) {
            opt_ball_preset.addEventListener("change", () => {
                this.ballSetManager.SaveBall({ballId: opt_ball_preset.getAttribute("ball"), index: opt_ball_preset.value});
                this._UpdateBall({ballId: opt_ball_preset.getAttribute("ball")});
            });
        }
        this.btn_reset_ball_preset.addEventListener("click", () => {
            this.ballSetManager.ResetAll();
            this.opt_ball_set_preset.value = this.ballSetManager.InitialPresetSelection({});
            for (let opt_ball_preset of this.opts_ball_presets) {
                opt_ball_preset.value = this.ballSetManager.InitialPresetSelection({ballId: opt_ball_preset.getAttribute("ball")});
            }
            this._UpdateBallSet();
        });
    }
    
    _UpdateBall({ballId}) {
        let src = this.ballSetManager.GetBallUrl({ballId: ballId});
        let leadingNumber = ballId[0];
        let trailingId = ballId.substring(1);
        let imgs = document.querySelectorAll(`#\\3${leadingNumber} ${trailingId}`);
        for (let img of imgs) {
            img.setAttribute("src", src);
        }
    }
    
    _UpdateBallSet() {
        for (let i = 0; i < 15; i++)
            this._UpdateBall({ballId: `${i+1}ball`});
    }

    _RenderPlayerOptionsTable() {
        this.con_players_options.innerHTML = "";
        const player_names = localStorage.getItem("options_table_player_names");
        const ball_indicies = localStorage.getItem("options_table_ball_indicies");

        for (let i = 0; i < this.opt_player_count.selectedIndex + 1; i++) {
            const row_element = document.createElement("div");
            row_element.setAttribute("class", "option_elem");

            const input_element = document.createElement("input");
            input_element.setAttribute("id", `p${i + 1}_name`);
            input_element.setAttribute("player", i + 1);
            input_element.setAttribute("class", "text");

            if (player_names !== null && player_names.split(";").length > i) {
                input_element.setAttribute("value", player_names.split(";")[i]);
            } else {
                input_element.setAttribute("value", `Player ${i + 1}`);
            }

            const option_container = document.createElement("div");
            option_container.setAttribute("class", "option_data");

            const select_element = document.createElement("select");
            select_element.setAttribute("id", `p${i + 1}_ball_count`);
            select_element.setAttribute("name", "Player's Ball Count");
            this._PopulateSelect(select_element, [ "Default Ball Count", ...this.ball_count_options]);
            
            if (ball_indicies !== null && ball_indicies.split(";").length > i) {
                select_element.selectedIndex = ball_indicies.split(";")[i];
            } else {
                select_element.selectedIndex = 0;
            }

            option_container.appendChild(select_element);
            row_element.appendChild(input_element);
            row_element.appendChild(option_container);
            this.con_players_options.appendChild(row_element);

            input_element.addEventListener("change", () => { this._SavePlayerOptionsTable(); });
            select_element.addEventListener("change", () => { this._SavePlayerOptionsTable(); });
        }
    }

    _RenderGameTable({is_game_in_progress, initial_balls_list}) {
        if (!is_game_in_progress) {
            this.RefreshStatsTable(is_game_in_progress);
        } else {
            const players_options = this._GetOptionsTable();
            this.con_players_game.innerHTML = "";
            for (let i = 0; i < (parseInt(this.opt_player_count.value) + 1); i++) {

                if (initial_balls_list[i].balls.length === 0) continue;

                const row_element = document.createElement("div");
                row_element.setAttribute("class", "game_elem");
                const ball_element = document.createElement("div");
                ball_element.setAttribute("class", "balls_left");
                const ball_value_element = document.createElement("div");
                ball_value_element.setAttribute("class", "ball_stripe");
                ball_value_element.setAttribute("id", `p${i + 1}_balls_left`);
                if (this.opt_show_remaining_current)
                    ball_value_element.innerText = initial_balls_list[i].balls.length;
                else
                    ball_value_element.innerText = "?";

                const name_element = document.createElement("div");
                name_element.setAttribute("class", "player_name");
                name_element.innerText = initial_balls_list[i].name;
                name_element.addEventListener("click", () => {
                    this.requestPlayerStats.trigger({name: initial_balls_list[i].name});
                });

                ball_element.appendChild(ball_value_element);
                row_element.appendChild(ball_element);
                row_element.appendChild(name_element);

                if (this._HasDivulgedBalls(players_options[i].ball_index)) {
                    // Show balls instead of a show button
                    const divulged_con = document.createElement("div");
                    divulged_con.setAttribute("class", "divulged_con");
                    for (let j = 0; j < initial_balls_list[i].balls.length; j++) {
                        const divulged_ball = document.createElement("img");
                        divulged_ball.setAttribute("class", "divulged_ball");
                        divulged_ball.setAttribute("id", `dball${initial_balls_list[i].balls[j]}`);
                        divulged_ball.setAttribute("src", `./images/${initial_balls_list[i].balls[j]}ball.png`);
                        divulged_con.appendChild(divulged_ball);
                    }
                    row_element.appendChild(divulged_con);
                } else {
                    // Create a show button
                    const show_button = document.createElement("div");
                    show_button.setAttribute("player", initial_balls_list[i].name);
                    show_button.setAttribute("class", "btn centered");
                    show_button.setAttribute("show_type", "");
                    this._CheckElement(show_button, true);
                    show_button.innerText = "SHOW 0";
                    show_button.addEventListener("click", (e) => {
                        const new_count = parseInt(e.target.innerText.split(" ")[1]) + 1;
                        e.target.innerText = `SHOW ${new_count}`;
                        this.updateShowCountEvent.trigger({
                            player_code: this.player_codes[i],
                            show_count: new_count,
                        });
                        
                        for (let j = 0; j < this.balls.length; j++) {
                            if (initial_balls_list[i].balls.indexOf(j + 1) !== -1) {
                                this.balls[j].setAttribute("vis", "");
                                this._CheckElement(this.balls[j], this._IsChecked(this.rack[j]));
                            } else {
                                this.balls[j].removeAttribute("vis");
                            }
                        }

                        this.lbl_player_code.innerText = `${initial_balls_list[i].name}'s Player Code: ${this.player_codes[i]}`;

                        this.mod_balls.style.display = "block";
                    });

                    row_element.appendChild(show_button);
                }

                this.con_players_game.appendChild(row_element);
            }
        }
    }

    UpdateShowCount({player_name, show_count}) {
        const show_button = document.querySelector(`.btn[player="${player_name}"]`);
        if (show_button != null)
            show_button.innerText = `SHOW ${show_count}`;
    }

    RefreshStatsTable(is_game_in_progress) {
        if (is_game_in_progress) return;
        this.con_players_game.innerHTML = "";
        let player_names = localStorage.getItem("player_names_list");
        if (player_names === null) {
            // TODO
        } else {
            player_names = player_names.split(";");
            player_names.length--;

            const stats_table = document.createElement("div");
            stats_table.setAttribute("class", "fill table");
            stats_table.setAttribute("id", "stats_table");

            player_names.sort();
            player_names.forEach(name => {
                const table_element = document.createElement("div");
                table_element.setAttribute("class", "table_elem");
                table_element.innerText = name;
                table_element.addEventListener("click", () => { this.requestPlayerStats.trigger({name: name}); });

                stats_table.appendChild(table_element);
            });

            this.con_players_game.appendChild(stats_table);
        }
    }

    ToggleNewGame({is_game_in_progress, initial_balls_list, locked_balls}) {
        this.game_in_progress = is_game_in_progress;
        this._RenderGameTable({is_game_in_progress: is_game_in_progress, initial_balls_list: initial_balls_list});

        if (is_game_in_progress) {
            this.btn_new_game.setAttribute("highlighted", "");
            this.btn_new_game_options.setAttribute("highlighted", "");
            this.btn_new_game.innerText = "End Game";
            this.btn_new_game_options.innerText = "End Game";
            
            if (this.opt_allow_overlaps_current) {
                this._PopulateSelect(this.sel_winning_player, ["Not enabled with Ball Overlaps option"]);
            } else {
                let player_names = [];
                initial_balls_list.forEach(player => {
                    if (player.balls.length > 0) player_names.push(player.name);
                });
                this._PopulateSelect(this.sel_winning_player, ["Nobody", ...player_names]);
            }

            // Lock out balls
            this.rack.forEach(ball => { 
                if (locked_balls.includes(parseInt(ball.getAttribute("value"))))
                    this._CheckElement(ball, true, "locked");
            });
            this.balls.forEach(ball => { 
                if (locked_balls.includes(parseInt(ball.getAttribute("value"))))
                    this._CheckElement(ball, true, "locked"); 
            });

            this.con_rack_tracker.removeAttribute("hidden");
        } else {
            this.btn_new_game.removeAttribute("highlighted");
            this.btn_new_game_options.removeAttribute("highlighted");
            this.btn_new_game.innerText = "New Game";
            this.btn_new_game_options.innerText = "Start a New Game with these Options";

            this.con_rack_tracker.setAttribute("hidden", "");
            this.rack.forEach(ball => { this._CheckElement(ball, false); });
            this.balls.forEach(ball => { this._CheckElement(ball, false); });
            this.rack.forEach(ball => { this._CheckElement(ball, false, "locked"); });
            this.balls.forEach(ball => { this._CheckElement(ball, false, "locked"); });
        }
    }

    UpdateGameState({game_state}) {
        this.players_still_in = [];
        for (let i = 0; i < game_state.length; i++) {
            const balls_left_counter = document.getElementById(`p${i + 1}_balls_left`);
            if (balls_left_counter === null) continue;
            
            if (this.opt_show_remaining_current)
                balls_left_counter.innerText = game_state[i].balls_left;
            else
                balls_left_counter.innerText = "?";
            
            if (game_state[i].balls_left !== 0) this.players_still_in.push(game_state[i].name);
            this._CheckElement(balls_left_counter, game_state[i].balls_left === 0);
        }
    }

    ShowStats(player_stats) {
        this.lbl_stats_title.innerText = `${player_stats.name}'s Stats (Win Percentage)`;
        this.lbl_stats_title.setAttribute("name", player_stats.name);

        for (let i = 0; i < 14; i++) {
            const stat_table_row = document.getElementById(`str${i + 1}`);
            let row_header = stat_table_row.childNodes[0];
            stat_table_row.innerHTML = "";
            stat_table_row.appendChild(row_header);

            let j = 0;
            player_stats.total_games[i].forEach(game => {
                const td = document.createElement("td");
                td.innerText = (game === 0) ? "" : (Math.floor((player_stats.total_wins[i][j] / game) * 100) + "%");
                stat_table_row.appendChild(td);
                j++;
            });
        }

        this.mod_stats.style.display = "block";
    }

    ShowCodes({game_code, player_codes}) {
        
        this._CheckElement(this.lbl_game_code, window.navigator.onLine);
        this._CheckElement(this.lbl_player_code, window.navigator.onLine);
        if (window.navigator.onLine) {
            this.lbl_game_code.innerText = `Game Code: ${game_code}`;
            this.player_codes = [];
            player_codes.forEach(code => {
                this.player_codes.push(code);
            });
        } else {
            this.lbl_game_code.innerText = "No game code available (offline).";
            this.lbl_player_code.innerText = "No player code available (offline).";
        }

        this.lbl_game_code.style.display = "block";
    }

    HideCodes() {
        this.lbl_game_code.style.display = "none";
        this.player_codes = [];
    }

    ShowError(e) {
        this.err_message.innerText = e.message;
        this.mod_error.style.display = "block";
    }

    _RequestStartOrEndGame() {
        if (this.game_in_progress) {
            if (this.players_still_in.length === 1) {
                let i = 0;
                while (this.players_still_in[0] !== this.sel_winning_player.childNodes[i].innerText) i++;
                this.sel_winning_player.selectedIndex = i;
            }
            this.mod_winner.style.display = "block";
        } else {
            this.mod_new_game.style.display = "block";
        }
    }

    _EndGame() {
		// Allow refreshing again
		window.onbeforeunload = null;
		
        let winner = null;
        if (this.sel_winning_player.selectedIndex !== 0)
            winner = this.sel_winning_player.options[this.sel_winning_player.selectedIndex].innerText;

        this.player_codes = [];
        this.endGameEvent.trigger({winning_players_name: winner});
    }

    _TriggerNewGame() {
		// Prevent accidental refresh from now on
		window.onbeforeunload = function() {
			return "Your game will be lost if you leave the page! Are you sure?";
		};
		
        let player_names = [];
        let ball_counts = [];
        let divulged_list = [];

        this._GetOptionsTable().forEach(player => {
            player_names.push(player.name);
            ball_counts.push(this._ConvertIndexToAmount(player.ball_index));
            divulged_list.push(this._HasDivulgedBalls(player.ball_index));
        });

        const locked_balls = this._GetLockedBalls();

        const do_allow_ball_overlaps = this._IsChecked(this.opt_allow_overlaps);
        this.opt_allow_overlaps_current = do_allow_ball_overlaps;
        this.opt_show_remaining_current = this._IsChecked(this.opt_show_remaining);

        this.startGameEvent.trigger({
            player_names: player_names,
            ball_counts: ball_counts,
            divulged_list: divulged_list,
            do_allow_ball_overlaps: do_allow_ball_overlaps,
            locked_balls: locked_balls,
        }); 
    }

    _GetOptionsTable() {
        let players_options = [];
        this.con_players_options.childNodes.forEach(option_row => {
            players_options.push({
                name: option_row.childNodes[0].value,
                ball_index: option_row.childNodes[1].childNodes[0].selectedIndex,
            });
        });
        return players_options;
    }

    _GetLockedBalls() {
        let locked_balls = [];
        const locked_balls_string = this.opt_locked_balls.value;
        // Split the locked balls string by any character that isn't a digit
        const numbers = locked_balls_string.split(/\D/);
        numbers.forEach(number => {
            const ball = parseInt(number);
            locked_balls.push(ball);
        });

        return locked_balls;
    }

    _SetOptionsTable(player_options) {
        let i = 1;
        player_options.forEach(player => {
            document.getElementById(`p${i}_name`).value = player.name;
            document.getElementById(`p${i}_ball_count`).value = player.ball_index;
            i++;
        });
    }

    _SavePlayerOptionsTable() {
        let player_names = [];
        let ball_indicies = [];
        this._GetOptionsTable().forEach(player => {
            player_names.push(player.name);
            ball_indicies.push(player.ball_index);
        });
        localStorage.setItem("options_table_player_names", player_names.join(";"));
        localStorage.setItem("options_table_ball_indicies", ball_indicies.join(";"));
    }

    _SortPlayerOptionsTable() {
        let options_table = [];
        const full_table = this._GetOptionsTable();

        let i = 0;
        while (i < this.opt_player_count.selectedIndex + 1) {
            options_table.push(full_table[i++]);
        }

        options_table.sort((a, b) => { return a.name < b.name ? -1 : 1; });
        this._SetOptionsTable(options_table);
        this._SavePlayerOptionsTable();
    }

    _SaveOptions() {
        localStorage.setItem("options_player_count", this.opt_player_count.selectedIndex);
        localStorage.setItem("options_ball_index", this.opt_ball_count.selectedIndex);
        localStorage.setItem("options_show_remaining", this._IsChecked(this.opt_show_remaining));
        localStorage.setItem("options_allow_overlaps", this._IsChecked(this.opt_allow_overlaps));
        localStorage.setItem("options_locked_balls", this.opt_locked_balls.value);
    }

    _ChangeTabs(tab) {
        this._CheckElement(this.page_options, false);
        this._CheckElement(this.page_game, false);
        this._CheckElement(this.page_help, false);

        this._CheckElement(this.btn_options, false);
        this._CheckElement(this.btn_game, false);
        this._CheckElement(this.btn_help, false);

        if (tab === "options") {
            this._CheckElement(this.page_options, true);
            this._CheckElement(this.btn_options, true);
        }

        if (tab === "game") {
            this._CheckElement(this.page_game, true);
            this._CheckElement(this.btn_game, true);
        }

        if (tab === "help") {
            this._CheckElement(this.page_help, true);
            this._CheckElement(this.btn_help, true);
        }
    }

    // Convert the indivual player's ball count selected index to an amount of balls.
    _ConvertIndexToAmount(index) {
        if (index === 0) return this._ConvertIndexToAmount(this.opt_ball_count.selectedIndex + 1);
        if (index < 4) return index - 1;
        return index - 3;
    }

    _HasDivulgedBalls(index) {
        if (index === 0) return this._HasDivulgedBalls(this.opt_ball_count.selectedIndex + 1);
        if (index === 1) return false;
        if (index < 4) return true;
        return false;
    }

    _PopulateSelect(select, options) {
        select.innerHTML = "";
        let id = 0;
        options.forEach(option => {
            const el = document.createElement("option");
            el.setAttribute("value", id++);
            el.innerText = option;
            select.appendChild(el);
        });
    }

    _CheckElement(el, val, name="checked") {
        if (val === null) this._CheckElement(el, !this._IsChecked(el, name), name); // Toggle
        else if (val)     el.setAttribute(name, "");               // Set checked
        else              el.removeAttribute(name);                // Set unchecked
    }

    _IsChecked(el, name="checked") {
        return el.hasAttribute(name);
    }
}

export default View;