extends Node
## SceneRouter — input-map registration, fade transitions, toasts,
## and the title/select/world/battle scene flow.

var fade_rect: ColorRect
var toast_box: VBoxContainer
var pending_map := ""
var pending_pos := Vector2i(-1, -1)
var _fading := false


func _enter_tree() -> void:
	_register_inputs()


func _ready() -> void:
	var layer := CanvasLayer.new()
	layer.layer = 100
	add_child(layer)
	fade_rect = ColorRect.new()
	fade_rect.color = Color(0, 0, 0, 0)
	fade_rect.position = Vector2.ZERO
	fade_rect.size = Vector2(960, 540)
	fade_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(fade_rect)
	toast_box = VBoxContainer.new()
	toast_box.position = Vector2(0, 54)
	toast_box.size = Vector2(960, 300)
	toast_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	toast_box.alignment = BoxContainer.ALIGNMENT_BEGIN
	layer.add_child(toast_box)


func _register_inputs() -> void:
	var defs := {
		"move_up": [KEY_UP, KEY_W],
		"move_down": [KEY_DOWN, KEY_S],
		"move_left": [KEY_LEFT, KEY_A],
		"move_right": [KEY_RIGHT, KEY_D],
		"confirm": [KEY_Z, KEY_ENTER, KEY_SPACE],
		"cancel": [KEY_X, KEY_BACKSPACE],
		"menu": [KEY_ESCAPE],
		"boost_up": [KEY_E],
		"boost_dn": [KEY_Q],
		"run": [KEY_SHIFT],
		"mute": [KEY_M],
	}
	for action in defs.keys():
		if not InputMap.has_action(action):
			InputMap.add_action(action)
		for keycode in defs[action]:
			# register BOTH physical (layout position) and label keycode so
			# non-QWERTY layouts (e.g. German QWERTZ) work either way
			var ev := InputEventKey.new()
			ev.physical_keycode = keycode
			InputMap.action_add_event(action, ev)
			var ev_label := InputEventKey.new()
			ev_label.keycode = keycode
			InputMap.action_add_event(action, ev_label)
	var pads := {
		"confirm": JOY_BUTTON_A, "cancel": JOY_BUTTON_B, "menu": JOY_BUTTON_START,
		"boost_up": JOY_BUTTON_RIGHT_SHOULDER, "boost_dn": JOY_BUTTON_LEFT_SHOULDER,
		"run": JOY_BUTTON_X,
		"move_up": JOY_BUTTON_DPAD_UP, "move_down": JOY_BUTTON_DPAD_DOWN,
		"move_left": JOY_BUTTON_DPAD_LEFT, "move_right": JOY_BUTTON_DPAD_RIGHT,
	}
	for action in pads.keys():
		var ev := InputEventJoypadButton.new()
		ev.button_index = pads[action]
		InputMap.action_add_event(action, ev)
	var axes := {
		"move_up": [JOY_AXIS_LEFT_Y, -1.0], "move_down": [JOY_AXIS_LEFT_Y, 1.0],
		"move_left": [JOY_AXIS_LEFT_X, -1.0], "move_right": [JOY_AXIS_LEFT_X, 1.0],
	}
	for action in axes.keys():
		var ev := InputEventJoypadMotion.new()
		ev.axis = axes[action][0]
		ev.axis_value = axes[action][1]
		InputMap.action_add_event(action, ev)


func _process(_delta: float) -> void:
	if Input.is_action_just_pressed("mute"):
		AudioDirector.set_muted(not GameState.muted)
		toast("Music " + ("muted" if GameState.muted else "on"), Color("b8b0d0"))


# ---------- transitions ----------
func fade_to(callback: Callable, dur := 0.5) -> void:
	if _fading:
		return
	_fading = true
	var tw := create_tween()
	tw.tween_property(fade_rect, "color:a", 1.0, dur * 0.5)
	tw.tween_callback(callback)
	tw.tween_property(fade_rect, "color:a", 0.0, dur * 0.5)
	tw.tween_callback(func(): _fading = false)


func toast(text: String, color := Color.WHITE) -> void:
	var lbl := Label.new()
	lbl.text = text
	lbl.add_theme_color_override("font_color", color)
	lbl.add_theme_color_override("font_outline_color", Color.BLACK)
	lbl.add_theme_constant_override("outline_size", 4)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	toast_box.add_child(lbl)
	while toast_box.get_child_count() > 4:
		toast_box.get_child(0).queue_free()
	var tw := create_tween()
	tw.tween_interval(2.4)
	tw.tween_property(lbl, "modulate:a", 0.0, 0.4)
	tw.tween_callback(lbl.queue_free)


# ---------- flow ----------
func go_title() -> void:
	fade_to(func(): get_tree().change_scene_to_file("res://scenes/title.tscn"))


func go_select() -> void:
	fade_to(func(): get_tree().change_scene_to_file("res://scenes/character_select.tscn"))


func enter_world(key: String) -> void:
	GameState.current = key
	pending_map = ""
	pending_pos = Vector2i(-1, -1)
	fade_to(func(): get_tree().change_scene_to_file("res://scenes/diorama.tscn"), 0.8)


func diorama():
	# untyped return: the diorama shell is script-defined, callers use dynamic access
	var cur := get_tree().current_scene
	if cur != null and cur.has_method("start_battle"):
		return cur
	return null


func start_battle(opts: Dictionary) -> void:
	var d = diorama()
	if d != null:
		fade_to(func(): d.start_battle(opts), 0.6)
