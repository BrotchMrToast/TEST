extends Control

const VW := 960.0
const VH := 540.0
## Dialogue box — typewriter text, speaker name + portrait, branching choices.
## Lines: [{who, text, portrait, color, choices:[{label, action:Callable}]}]

var lines: Array = []
var index := 0
var chars := 0.0
var choice := 0
var active := false
var _on_done: Callable = Callable()


func _ready() -> void:
	position = Vector2.ZERO
	size = Vector2(VW, VH)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	visible = false


func open(new_lines: Array, on_done: Callable) -> void:
	lines = new_lines
	index = 0
	chars = 0.0
	choice = 0
	active = true
	visible = true
	_on_done = on_done


func _finish() -> void:
	active = false
	visible = false
	if _on_done.is_valid():
		var cb := _on_done
		_on_done = Callable()
		cb.call()


func _process(delta: float) -> void:
	if not active:
		return
	queue_redraw()
	if index >= lines.size():
		_finish()
		return
	var line: Dictionary = lines[index]
	var full := String(line.get("text", "")).length()
	if chars < full:
		chars = minf(full, chars + delta * 60.0)
	var typed := chars >= full
	var choices: Array = line.get("choices", [])
	if not choices.is_empty() and typed:
		if Input.is_action_just_pressed("move_up"):
			choice = (choice + choices.size() - 1) % choices.size()
			AudioDirector.sfx("move")
		if Input.is_action_just_pressed("move_down"):
			choice = (choice + 1) % choices.size()
			AudioDirector.sfx("move")
		if Input.is_action_just_pressed("confirm"):
			AudioDirector.sfx("confirm")
			var pick: Dictionary = choices[choice]
			_finish()
			var action: Callable = pick.get("action", Callable())
			if action.is_valid():
				action.call()
		return
	if Input.is_action_just_pressed("confirm") or Input.is_action_just_pressed("cancel"):
		if not typed:
			chars = full
			return
		AudioDirector.sfx("confirm")
		index += 1
		chars = 0.0
		choice = 0
		if index >= lines.size():
			_finish()


func _draw() -> void:
	if not active or index >= lines.size():
		return
	var line: Dictionary = lines[index]
	var box_h := 128.0
	var y := VH - box_h - 14.0
	var x := 20.0
	var w := VW - 40.0
	var accent := Color(String(line.get("color", "#8878c8")))
	_panel(Rect2(x, y, w, box_h), accent)
	var tx := x + 22.0
	var tw := w - 44.0
	var portrait_name := String(line.get("portrait", ""))
	if portrait_name != "":
		var tex := Db.portrait_tex(portrait_name)
		if tex != null:
			_panel(Rect2(x + 14, y - 34, 92, 92), accent, Color(0.05, 0.04, 0.09, 0.98))
			draw_texture_rect(tex, Rect2(x + 20, y - 28, 80, 80), false)
			tx = x + 122.0
			tw = w - 144.0
	var font := get_theme_default_font()
	var who := String(line.get("who", ""))
	if who != "":
		var nw := font.get_string_size(who, HORIZONTAL_ALIGNMENT_LEFT, -1, 15).x + 24.0
		_panel(Rect2(tx - 6, y - 16, nw, 26), accent, Color(0.09, 0.07, 0.16, 0.98))
		draw_string(font, Vector2(tx + 6, y + 3), who, HORIZONTAL_ALIGNMENT_LEFT, -1, 15, accent)
	var shown := String(line.get("text", "")).substr(0, int(chars))
	_draw_wrapped(font, shown, tx, y + 34, tw, 15, Color("e8e4f4"))
	var typed := chars >= String(line.get("text", "")).length()
	var choices: Array = line.get("choices", [])
	if typed and choices.is_empty():
		var bob := sin(Time.get_ticks_msec() / 160.0) * 3.0
		draw_string(font, Vector2(x + w - 30, y + box_h - 14 + bob), "v", HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("8878c8"))
	if typed and not choices.is_empty():
		var cw := 320.0
		var cx := VW - cw - 34.0
		var cy := y - choices.size() * 30.0 - 18.0
		_panel(Rect2(cx, cy, cw, choices.size() * 30.0 + 14.0), Color("ffd23e"))
		for i in range(choices.size()):
			var col := Color("ffe98a") if i == choice else Color("b8b0d0")
			var prefix := "> " if i == choice else "  "
			draw_string(font, Vector2(cx + 16, cy + 26 + i * 30), prefix + String(choices[i]["label"]),
				HORIZONTAL_ALIGNMENT_LEFT, cw - 24, 15, col)


func _panel(rect: Rect2, border: Color, bg := Color(0.04, 0.03, 0.08, 0.92)) -> void:
	draw_rect(rect, bg)
	draw_rect(rect, border, false, 2.0)


func _draw_wrapped(font: Font, text: String, x: float, y: float, max_w: float, fsize: int, color: Color) -> void:
	var words := text.split(" ")
	var line := ""
	var yy := y
	var rows := 0
	for word in words:
		var test := (line + " " + word).strip_edges()
		if font.get_string_size(test, HORIZONTAL_ALIGNMENT_LEFT, -1, fsize).x > max_w and line != "":
			draw_string(font, Vector2(x, yy), line, HORIZONTAL_ALIGNMENT_LEFT, max_w, fsize, color)
			line = word
			yy += fsize + 6
			rows += 1
			if rows >= 4:
				return
		else:
			line = test
	if line != "":
		draw_string(font, Vector2(x, yy), line, HORIZONTAL_ALIGNMENT_LEFT, max_w, fsize, color)
