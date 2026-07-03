extends SceneTree
## Headless unit tests for the pure game logic.
## Run: ./tools/godot --headless --path . --script tools/run_tests.gd

var failures := 0
var checks := 0


func check(cond: bool, label: String) -> void:
	checks += 1
	if cond:
		print("  ok   ", label)
	else:
		failures += 1
		printerr("  FAIL ", label)


func _init() -> void:
	# Autoloads are not instanced for --script runs; register them manually
	# under their autoload names so cross-references resolve.
	var db = load("res://autoload/db.gd").new()
	db.name = "Db"
	root.add_child(db)
	var gs = load("res://autoload/game_state.gd").new()
	gs.name = "GameState"
	root.add_child(gs)
	# protect any real save file from the roundtrip test
	var save_abs := ProjectSettings.globalize_path(gs.SAVE_PATH)
	var backup := ""
	if FileAccess.file_exists(gs.SAVE_PATH):
		backup = FileAccess.get_file_as_string(gs.SAVE_PATH)

	print("== stats & leveling ==")
	gs.reset_all()
	check(gs.exp_for(1) == 55, "exp_for(1) == 55")
	check(gs.exp_for(2) > gs.exp_for(1), "exp curve rises")
	gs.current = "samurai"
	var s: Dictionary = gs.hero_stats("samurai")
	check(int(s["hp"]) == 95 and int(s["atk"]) == 12, "samurai base stats at Lv1")
	var c: Dictionary = gs.chars["samurai"]
	var leveled: bool = gs.gain_exp("samurai", 60)
	check(leveled and int(c["level"]) == 2, "gain_exp levels up at threshold")
	check(int(c["hp"]) == int(gs.hero_stats("samurai")["hp"]), "level-up restores hp")

	print("== inventory & equipment ==")
	gs.inv_add(c, "sam_w1", 2)
	check(gs.inv_count(c, "sam_w1") == 2, "inv_add stacks")
	var atk_before := int(gs.hero_stats("samurai")["atk"])
	gs.equip_item(c, "sam_w1")
	check(int(gs.hero_stats("samurai")["atk"]) == atk_before + 6, "weapon adds +6 atk")
	check(gs.inv_count(c, "sam_w1") == 1, "equipping consumes from bag")
	gs.inv_add(c, "sam_w2", 1)
	gs.equip_item(c, "sam_w2")
	check(gs.inv_count(c, "sam_w1") == 2, "swap returns old weapon to bag")
	check(not gs.inv_remove(c, "nothing", 1), "removing absent item fails")

	print("== quests ==")
	gs.start_quest("q_sam_wolves")
	check(c["quests"].has("q_sam_wolves"), "quest starts")
	for i in range(4):
		gs.notify_kill("sam_wolf")
	check(gs.quest_ready("q_sam_wolves"), "kill quest ready after 4 kills")
	var gold_before := int(c["gold"])
	var reward: Dictionary = gs.turn_in_quest("q_sam_wolves")
	check(int(c["gold"]) == gold_before + int(reward.get("gold", 0)), "turn-in pays gold")
	check(bool(c["quests"]["q_sam_wolves"]["done"]), "quest marked done")

	print("== companions ==")
	var cs: Dictionary = gs.comp_stats("goro", 5)
	check(int(cs["hp"]) > 0 and int(cs["atk"]) > 0, "companion stats computed")
	check(int(gs.comp_stats("kiku", 5)["crit"]) == 14, "thief crit bonus")

	print("== save / load roundtrip ==")
	c["gold"] = 777
	c["flags"]["test_flag"] = 1
	check(gs.save_game(), "save_game writes")
	gs.reset_all()
	check(int(gs.chars["samurai"]["gold"]) != 777, "reset clears state")
	check(gs.load_game(), "load_game reads")
	check(int(gs.chars["samurai"]["gold"]) == 777, "gold survives roundtrip")
	check(gs.chars["samurai"]["flags"].has("test_flag"), "flags survive roundtrip")
	gs.wipe_save()
	if backup != "":
		var f := FileAccess.open(gs.SAVE_PATH, FileAccess.WRITE)
		f.store_string(backup)
		print("  (restored pre-existing save at %s)" % save_abs)

	print("== db content ==")
	check(not db.item("sam_w1").is_empty(), "items loaded")
	check(not db.enemy("kuroyami2").is_empty(), "enemies loaded")
	check(not db.map_def("conv_nexus").is_empty(), "maps loaded")
	check(db.cutscene("conv_final").size() > 0, "cutscenes loaded")
	check(not db.bank("gambler").is_empty(), "archetype banks loaded")

	print("\n%d checks, %d failure(s)" % [checks, failures])
	quit(1 if failures > 0 else 0)
