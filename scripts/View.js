import Event from "./Event.js";

class View {
    constructor() {
        this.page_options = document.getElementById("options");
        this.page_game = document.getElementById("game");
        this.page_help = document.getElementById("help");

        this.btn_options = document.getElementById("btn_options");
        this.btn_game = document.getElementById("btn_game");
        this.btn_help = document.getElementById("btn_help");

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

        this.con_players_options = document.getElementById("player_options_con");
        this.con_players_game = document.getElementById("game_con");
        this.con_rack_tracker = document.getElementById("game_tracker_con");

        this.mod_new_game = document.getElementById("modal_newGame");
        this.mod_balls = document.getElementById("modal_balls");
        this.mod_error = document.getElementById("modal_error");
        this.mod_winner = document.getElementById("modal_winner");
        this.mod_stats = document.getElementById("modal_stats");
        this.mod_delete_stats = document.getElementById("modal_delete");

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

        this.balls = [];
        this.rack = [];
        for (let i = 1; i <= 15; i++) {
            this.rack.push(document.getElementById(`${i}ball`));
            this.balls.push(document.getElementById(`ball${i}`));
        }

        this.player_count_options = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
        ];
        this.ball_count_options = [
            "0 Balls (Sitting Out)", "1 Divulged Ball", "2 Divulged Balls", "1 Ball", "2 Balls", "3 Balls", "4 Balls", "5 Balls",
            "6 Balls", "7 Balls", "8 Balls", "9 Balls", "10 Balls", "11 Balls", "12 Balls", "13 Balls", "14 Balls", "15 Balls"
        ];

        this.startGameEvent = new Event();
        this.endGameEvent = new Event();
        this.pocketBallEvent = new Event();
        this.undoPocketBallEvent = new Event();
        this.requestPlayerStats = new Event();
        this.requestDeleteStats = new Event();

        this._RenderOptions();
        this._AssignEvents();
        this._RenderPlayerOptionsTable();
        this._RenderGameTable({is_game_in_progress: false});
    }

    _RenderOptions() {
        this._PopulateSelect(this.opt_player_count, this.player_count_options);
        this._PopulateSelect(this.opt_ball_count, this.ball_count_options);
        
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
    }

    _AssignEvents() {
        this.btn_options.addEventListener("click", () => { this._ChangeTabs("options"); });
        this.btn_game.addEventListener("click", () => { this._ChangeTabs("game"); });
        this.btn_help.addEventListener("click", () => { this._ChangeTabs("help"); });

        this.opt_player_count.addEventListener("change", () => { this._RenderPlayerOptionsTable(); this._SaveOptions(); });
        this.opt_ball_count.addEventListener("change", () => { this._SaveOptions(); })
        this.opt_show_remaining.addEventListener("click", () => { this._CheckElement(this.opt_show_remaining, null); this._SaveOptions(); });
        this.opt_allow_overlaps.addEventListener("click", () => { this._CheckElement(this.opt_allow_overlaps, null); this._SaveOptions(); });
        
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
        this.btn_finish_game.addEventListener("click", () => { this._EndGame(); this.mod_winner.style.display = "none"; });
        this.btn_cancel_finish_game.addEventListener("click", () => { this.mod_winner.style.display = "none"; });

        this.btn_delete_player.addEventListener("click", () => {
            this.mod_stats.style.display = "none";
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
        this.con_players_game.innerHTML = "";
        const players_options = this._GetOptionsTable();
        if (is_game_in_progress) {
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
                    show_button.setAttribute("class", "btn centered");
                    show_button.setAttribute("show_type", "");
                    this._CheckElement(show_button, true);
                    show_button.innerText = "SHOW 0";
                    show_button.addEventListener("click", (e) => {
                        const current_count = parseInt(e.target.innerText.split(" ")[1]);
                        e.target.innerText = `SHOW ${current_count + 1}`;
                        
                        for (let j = 0; j < this.balls.length; j++) {
                            if (initial_balls_list[i].balls.indexOf(j + 1) !== -1) {
                                this.balls[j].setAttribute("vis", "");
                                this._CheckElement(this.balls[j], this._IsChecked(this.rack[j]));
                            } else {
                                this.balls[j].removeAttribute("vis");
                            }
                        }
                        this.mod_balls.style.display = "block";
                    });
                    row_element.appendChild(show_button);
                }

                this.con_players_game.appendChild(row_element);
            }
        } else {
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
    }

    ToggleNewGame({is_game_in_progress, initial_balls_list}) {
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
                initial_balls_list.forEach(player => { player_names.push(player.name); });
                this._PopulateSelect(this.sel_winning_player, ["Nobody", ...player_names]);
            }

            this.con_rack_tracker.removeAttribute("hidden");
        } else {
            this.btn_new_game.removeAttribute("highlighted");
            this.btn_new_game_options.removeAttribute("highlighted");
            this.btn_new_game.innerText = "New Game";
            this.btn_new_game_options.innerText = "Start a New Game with these Options";

            this.con_rack_tracker.setAttribute("hidden", "");
            this.rack.forEach(ball => { this._CheckElement(ball, false); });
            this.balls.forEach(ball => { this._CheckElement(ball, false); });
        }
    }

    UpdateGameState({game_state}) {
        for (let i = 0; i < game_state.length; i++) {
            const balls_left_counter = document.getElementById(`p${i + 1}_balls_left`);
            if (balls_left_counter === null) continue;
            
            if (this.opt_show_remaining_current)
                balls_left_counter.innerText = game_state[i].balls_left;
            else
                balls_left_counter.innerText = "?";
            
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

    ShowError(e) {
        this.err_message.innerText = e.message;
        this.mod_error.style.display = "block";
    }

    _RequestStartOrEndGame() {
        if (this.game_in_progress) {
            this.mod_winner.style.display = "block";
        } else {
            this.mod_new_game.style.display = "block";
        }
    }

    _EndGame() {
        let winner = null;
        if (this.sel_winning_player.selectedIndex !== 0)
            winner = this.sel_winning_player.options[this.sel_winning_player.selectedIndex].innerText;

        this.endGameEvent.trigger({winning_players_name: winner});
    }

    _TriggerNewGame() {
        let player_names = [];
        let ball_counts = [];
        let divulged_list = [];

        this._GetOptionsTable().forEach(player => {
            player_names.push(player.name);
            ball_counts.push(this._ConvertIndexToAmount(player.ball_index));
            divulged_list.push(this._HasDivulgedBalls(player.ball_index));
        });

        const do_allow_ball_overlaps = this._IsChecked(this.opt_allow_overlaps);
        this.opt_allow_overlaps_current = do_allow_ball_overlaps;
        this.opt_show_remaining_current = this._IsChecked(this.opt_show_remaining);

        this.startGameEvent.trigger({
            player_names: player_names,
            ball_counts: ball_counts,
            divulged_list: divulged_list,
            do_allow_ball_overlaps: do_allow_ball_overlaps,
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

    _SaveOptions() {
        localStorage.setItem("options_player_count", this.opt_player_count.selectedIndex);
        localStorage.setItem("options_ball_index", this.opt_ball_count.selectedIndex);
        localStorage.setItem("options_show_remaining", this._IsChecked(this.opt_show_remaining));
        localStorage.setItem("options_allow_overlaps", this._IsChecked(this.opt_allow_overlaps));
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

    _CheckElement(el, val) {
        if (val === null) this._CheckElement(el, !this._IsChecked(el)); // Toggle
        else if (val)     el.setAttribute("checked", "");               // Set checked
        else              el.removeAttribute("checked");                // Set unchecked
    }

    _IsChecked(el) {
        return el.hasAttribute("checked");
    }
}

export default View;