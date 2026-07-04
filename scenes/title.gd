extends Control

const VW := 960.0
const VH := 540.0
## Title screen: animated rift sky, the three silhouettes, press-confirm.

var t := 0.0
var erase_arm := 0.0
var _hero_sprites: Array[Sprite2D] = []


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	AudioDirector.play_theme("title")
	var order := ["kenji", "daiki", "vex"]
	for i in range(3):
		var s := Sprite2D.new()
		s.position = Vector2(480 + (i - 1) * 150, 360)
		s.scale = Vector2(2, 2)
		SpriteUtil.apply_frame(s, order[i], 0, "down")
		add_child(s)
		_hero_sprites.append(s)


func _process(delta: float) -> void:
	t += delta
	erase_arm = maxf(0.0, erase_arm - delta)
	var order := ["kenji", "daiki", "vex"]
	for i in range(3):
		var f := 0 if int(t * 2.0 + i) % 2 == 0 else 1
		SpriteUtil.apply_frame(_hero_sprites[i], order[i], f, "down")
		_hero_sprites[i].position.y = 360 + sin(t * 1.5 + i * 2.1) * 6.0
	queue_redraw()
	if Input.is_action_just_pressed("confirm"):
		AudioDirector.sfx("confirm")
		SceneRouter.go_select()
	if Input.is_action_just_pressed("cancel"):
		if erase_arm > 0.0:
			GameState.wipe_save()
			SceneRouter.toast("Save erased.", Color("ff8080"))
			erase_arm = 0.0
		elif FileAccess.file_exists(GameState.SAVE_PATH):
			erase_arm = 3.0


func _draw() -> void:
	var w := VW
	var h := VH
	# sky
	draw_rect(Rect2(0, 0, w, h), Color("0a0616"))
	for band in range(20):
		var yy := h * band / 20.0
		draw_rect(Rect2(0, yy, w, h / 20.0 + 1), Color("0a0616").lerp(Color("2a1048"), band / 19.0))
	# stars
	var rng := RandomNumberGenerator.new()
	rng.seed = 9
	for i in range(120):
		var x := rng.randf() * w
		var y := rng.randf() * h * 0.7
		var a := 0.3 + sin(t * 2.0 + i) * 0.25
		var c := Color("c86bff") if i % 9 == 0 else Color("cfd4ff")
		c.a = maxf(0.05, a)
		draw_rect(Rect2(x, y, 2, 2), c)
	# rift arcs
	var cols := [Color("c86bff"), Color("ff2d95"), Color("00e5c9")]
	for i in range(3):
		var pts := PackedVector2Array()
		for s in range(25):
			var u := s / 24.0
			var x := w * 0.5 - 190 + u * 380.0 + i * 8.0
			var y := 210.0 + sin(u * 6.0 + t * 1.8 + i * 2.0) * (26.0 - i * 6.0)
			pts.append(Vector2(x, y))
		var c: Color = cols[i]
		c.a = 0.5 + sin(t * 1.8 + i * 2.0) * 0.3
		draw_polyline(pts, c, 3.0 - i * 0.7)
	# logo
	var font := get_theme_default_font()
	draw_string(font, Vector2(w / 2 - 297, 143), "TRINITY RIFT", HORIZONTAL_ALIGNMENT_CENTER, 600, 64, Color.BLACK)
	draw_string(font, Vector2(w / 2 - 300, 140), "TRINITY RIFT", HORIZONTAL_ALIGNMENT_CENTER, 600, 64, Color("ffb85a"))
	draw_string(font, Vector2(w / 2 - 300, 172), "Three Lives. One Soul. Zero Time.", HORIZONTAL_ALIGNMENT_CENTER, 600, 16, Color("b8b0d0"))
	if int(t * 1.6) % 2 == 0:
		draw_string(font, Vector2(w / 2 - 300, 470), "— PRESS Z / ENTER —", HORIZONTAL_ALIGNMENT_CENTER, 600, 18, Color("f0ecff"))
	var hint := "a 2.5D tale of vengeance, debt, and neon"
	if FileAccess.file_exists(GameState.SAVE_PATH):
		hint = "PRESS X AGAIN TO ERASE SAVE" if erase_arm > 0.0 else "save data found — X twice to erase"
	draw_string(font, Vector2(w / 2 - 300, 512), hint, HORIZONTAL_ALIGNMENT_CENTER, 600, 12, Color("5a5470"))
