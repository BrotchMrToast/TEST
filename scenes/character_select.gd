extends Control

const VW := 960.0
const VH := 540.0
## Character select — one panel per life; convergence panel unlocks
## once all three timelines have reached their rift.

var idx := 0
var t := 0.0


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	AudioDirector.play_theme("title")
	GameState.maybe_unlock_convergence()


func panels() -> Array:
	var p := [
		{"key": "samurai", "bg": "ashvillage", "setting": "Sengoku Japan — 1573",
		 "blurb": "Avenge your mother. Find your sister. Drown the warlord in his own war."},
		{"key": "business", "bg": "street", "setting": "Tokyo — Present Day",
		 "blurb": "The Kurosawa-gumi owns your debt, your desk, your life. Smile. Collect. Wait."},
		{"key": "cyber", "bg": "neon", "setting": "Neo-Shizuoka — 2087",
		 "blurb": "One last job went wrong. Now the Ministry hunts you for killing your only friend."},
	]
	if bool(GameState.convergence.get("unlocked", false)):
		p.append({"key": "convergence", "bg": "rift", "setting": "Outside Time",
			"blurb": "The rifts scream in three voices. It is time to answer."})
	return p


func _process(delta: float) -> void:
	t += delta
	queue_redraw()
	var list := panels()
	if Input.is_action_just_pressed("move_left"):
		idx = (idx + list.size() - 1) % list.size()
		AudioDirector.sfx("move")
	if Input.is_action_just_pressed("move_right"):
		idx = (idx + 1) % list.size()
		AudioDirector.sfx("move")
	if Input.is_action_just_pressed("cancel"):
		AudioDirector.sfx("cancel")
		SceneRouter.go_title()
	if Input.is_action_just_pressed("confirm"):
		AudioDirector.sfx("confirm")
		var p: Dictionary = list[idx]
		var key := String(p["key"])
		if key == "convergence":
			if bool(GameState.convergence.get("done", false)):
				SceneRouter.toast("The story is complete. (Erase save on title for a fresh start.)", Color("ffe98a"))
			else:
				SceneRouter.enter_world("convergence")
		else:
			if bool(GameState.chars[key]["rift_reached"]):
				SceneRouter.toast("This life has reached the rift. Play the others!", Color("c86bff"))
			else:
				SceneRouter.enter_world(key)


func _draw() -> void:
	var w := VW
	var h := VH
	draw_rect(Rect2(0, 0, w, h), Color("07060c"))
	var font := get_theme_default_font()
	var list := panels()
	var n := list.size()
	var pw: float = minf(280.0, (w - 60.0) / n - 16.0)
	var total := n * (pw + 16.0)
	for i in range(n):
		var p: Dictionary = list[i]
		var sel := i == idx
		var x := w / 2.0 - total / 2.0 + i * (pw + 16.0) + 8.0
		var y := 74.0 if sel else 90.0
		var ph := 360.0
		var rect := Rect2(x, y, pw, ph)
		# backdrop strip
		var tex := Db.backdrop_tex(String(p["bg"]))
		draw_texture_rect_region(tex, rect, Rect2(200, 40, pw * 1.4, ph * 1.4))
		draw_rect(rect, Color(0.02, 0.015, 0.05, 0.35 if sel else 0.66))
		var key := String(p["key"])
		var is_conv := key == "convergence"
		var info := GameState.hero_info(key)
		draw_rect(rect, Color("ffe98a") if sel else Color(info["color"]), false, 3.0 if sel else 1.5)
		# hero sprite
		var frame := (int(t * 3.0) % 2 + 1) if sel else 0
		var at := SpriteUtil.frame_atlas(String(info["sprite"]), frame, "down")
		var sc := 2.4 if sel else 2.0
		draw_texture_rect(at, Rect2(x + pw / 2 - 16 * sc, y + 56, 32 * sc, 48 * sc), false)
		# labels
		draw_string(font, Vector2(x, y + 36), "???" if is_conv else String(info["name"]),
			HORIZONTAL_ALIGNMENT_CENTER, pw, 20, Color(info["color"]))
		draw_string(font, Vector2(x, y + 54), "THE CONVERGENCE" if is_conv else String(info["title"]),
			HORIZONTAL_ALIGNMENT_CENTER, pw, 12, Color("b8b0d0"))
		draw_string(font, Vector2(x, y + 210), String(p["setting"]), HORIZONTAL_ALIGNMENT_CENTER, pw, 12, Color("8a82a8"))
		_draw_wrapped(font, String(p["blurb"]), x + 15, y + 236, pw - 30, 12, Color("cfc8e8"))
		# progress line
		var prog := "NEW STORY"
		var pc := Color("8a82a8")
		if is_conv:
			prog = "— COMPLETE —" if bool(GameState.convergence.get("done", false)) else "◆ THE RIFT CALLS ◆"
			pc = Color("c86bff")
		else:
			var c: Dictionary = GameState.chars[key]
			if bool(c["rift_reached"]):
				prog = "RIFT REACHED ◆"
				pc = Color("c86bff")
			elif bool(c["started"]):
				prog = "Chapter %d — Lv %d" % [int(c["chapter"]) + 1, int(c["level"])]
				pc = Color("7dffa0")
		draw_string(font, Vector2(x, y + ph - 20), prog, HORIZONTAL_ALIGNMENT_CENTER, pw, 13, pc)
	draw_string(font, Vector2(0, 46), "CHOOSE A LIFE", HORIZONTAL_ALIGNMENT_CENTER, w, 22, Color("f0ecff"))
	var done := 0
	for k in ["samurai", "business", "cyber"]:
		if bool(GameState.chars[k]["rift_reached"]):
			done += 1
	var hint := "play each life to its rift — %d/3 threads complete" % done
	if bool(GameState.convergence.get("unlocked", false)):
		hint = "the three threads are cut loose — walk into the light between them"
	draw_string(font, Vector2(0, 500), hint, HORIZONTAL_ALIGNMENT_CENTER, w, 13, Color("5a5470"))


func _draw_wrapped(font: Font, text: String, x: float, y: float, max_w: float, fsize: int, color: Color) -> void:
	var words := text.split(" ")
	var line := ""
	var yy := y
	for word in words:
		var test := (line + " " + word).strip_edges()
		if font.get_string_size(test, HORIZONTAL_ALIGNMENT_LEFT, -1, fsize).x > max_w and line != "":
			draw_string(font, Vector2(x, yy), line, HORIZONTAL_ALIGNMENT_CENTER, max_w, fsize, color)
			line = word
			yy += fsize + 5
		else:
			line = test
	if line != "":
		draw_string(font, Vector2(x, yy), line, HORIZONTAL_ALIGNMENT_CENTER, max_w, fsize, color)
