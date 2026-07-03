extends Node
## Cutscene runner — executes JSON step arrays from Db.cutscene(id).
## Steps: {say}|{wait}|{flag:[k,v]}|{give:{item,n}}|{gold}|{heal}|{shake}|{flash}
##        {sfx}|{music}|{chapter}|{quest}|{tp:{map,x,y}}
##        {battle:{enemies,bg,boss,stop_at,party}}|{rift}|{unify}|{final_win}|{credits}

var diorama: Node3D
var active := false
var _steps: Array = []
var _index := -1
var _waiting := 0.0
var _overlay: Control


func _ready() -> void:
	_overlay = Control.new()
	_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_overlay.draw.connect(_draw_overlay)
	diorama.ui.add_child(_overlay)
	set_process(true)

var _flash := 0.0


func run(steps: Array) -> void:
	if steps.is_empty():
		return
	_steps = steps
	_index = -1
	active = true
	_next()


func _next() -> void:
	if not active:
		return
	_index += 1
	if _index >= _steps.size():
		active = false
		_overlay.queue_redraw()
		return
	var s: Dictionary = _steps[_index]
	var c: Dictionary = GameState.ch()
	if s.has("say"):
		var lines: Array = []
		for l in s["say"]:
			lines.append(l.duplicate())
		diorama.dialogue.open(lines, _next)
		return
	if s.has("wait"):
		_waiting = float(s["wait"])
		return
	if s.has("flag"):
		c["flags"][String(s["flag"][0])] = s["flag"][1]
		_next()
		return
	if s.has("give"):
		var g: Dictionary = s["give"]
		GameState.inv_add(c, String(g["item"]), int(g.get("n", 1)))
		SceneRouter.toast("Got %s" % String(Db.item(String(g["item"])).get("name", g["item"])), Color("ffd23e"))
		_next()
		return
	if s.has("gold"):
		c["gold"] = int(c["gold"]) + int(s["gold"])
		AudioDirector.sfx("gold")
		SceneRouter.toast("+%d %s" % [int(s["gold"]), GameState.currency()], Color("ffd23e"))
		_next()
		return
	if s.has("heal"):
		var st := GameState.hero_stats(GameState.current)
		c["hp"] = st["hp"]
		c["mp"] = st["mp"]
		AudioDirector.sfx("heal")
		_next()
		return
	if s.has("shake"):
		diorama.shake(float(s["shake"]), 0.5)
		_next()
		return
	if s.has("flash"):
		_flash = 0.5
		_next()
		return
	if s.has("sfx"):
		AudioDirector.sfx(String(s["sfx"]))
		_next()
		return
	if s.has("music"):
		AudioDirector.play_theme(String(s["music"]))
		_next()
		return
	if s.has("chapter"):
		c["chapter"] = int(s["chapter"])
		var w := Db.world(String(c.get("world", GameState.current)))
		var chapters: Array = w.get("chapters", [])
		if int(s["chapter"]) < chapters.size():
			SceneRouter.toast("◆ " + String(chapters[int(s["chapter"])].get("goal", "")), Color("9adcff"))
		_next()
		return
	if s.has("quest"):
		GameState.start_quest(String(s["quest"]))
		_next()
		return
	if s.has("tp"):
		var t: Dictionary = s["tp"]
		SceneRouter.fade_to(func():
			diorama.world_node.load_map(String(t["map"]), Vector2i(int(t["x"]), int(t["y"])))
			_next(), 0.7)
		return
	if s.has("battle"):
		var opts: Dictionary = (s["battle"] as Dictionary).duplicate()
		opts["scripted"] = true
		opts["on_win"] = _next
		SceneRouter.start_battle(opts)
		return
	if s.has("rift"):
		c["rift_reached"] = true
		GameState.save_game()
		AudioDirector.sfx("rift")
		active = false
		SceneRouter.go_select()
		return
	if s.has("unify"):
		var conv := GameState.convergence
		conv["flags"]["unified"] = 1
		conv["equip"] = {"weapon": "div_w1", "armor": "div_a1", "acc": "div_x1"}
		GameState.inv_add(conv, "div_h1", 4)
		var stats := GameState.hero_stats("convergence")
		conv["hp"] = stats["hp"]
		conv["mp"] = stats["mp"]
		GameState.save_game()
		diorama.world_node.load_map(String(conv["map"]) if String(conv.get("map", "")) != "" else "conv_nexus",
			Vector2i(14, 17))
		_next()
		return
	if s.has("final_win"):
		GameState.convergence["done"] = true
		GameState.save_game()
		_next()
		return
	if s.has("credits"):
		active = false
		SceneRouter.fade_to(func(): get_tree().change_scene_to_file("res://scenes/credits.tscn"), 1.0)
		return
	_next()


func _process(delta: float) -> void:
	if _flash > 0.0:
		_flash -= delta
		_overlay.queue_redraw()
	if not active:
		return
	_overlay.queue_redraw()
	if _waiting > 0.0:
		_waiting -= delta
		if _waiting <= 0.0:
			_next()


func _draw_overlay() -> void:
	var sz := _overlay.size
	if _flash > 0.0:
		_overlay.draw_rect(Rect2(0, 0, sz.x, sz.y), Color(1, 1, 1, minf(1.0, _flash * 2.0)))
	if active:
		_overlay.draw_rect(Rect2(0, 0, sz.x, 26), Color(0, 0, 0, 0.85))
		_overlay.draw_rect(Rect2(0, sz.y - 26, sz.x, 26), Color(0, 0, 0, 0.85))
