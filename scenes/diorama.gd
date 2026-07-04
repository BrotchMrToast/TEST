extends Node3D
## Diorama — the HD-2D presentation shell (visual approach "A" from the brief):
## the whole 2D game world (TileMap ground + billboarded pixel sprites) is rendered
## into a SubViewport whose texture is mapped onto a slightly TILTED 3D plane.
## A Camera3D with practical DOF blurs the top/bottom bands (tilt-shift) and a
## WorldEnvironment supplies bloom/glow and per-world color grading.
## Gameplay scenes (overworld / battle) live INSIDE the viewport; crisp UI
## (dialogue, HUD, menus) lives on a CanvasLayer above the 3D view.

const GRADES := {
	"ash": {"sat": 0.9, "bright": 1.02, "contrast": 1.08, "tint": Color(1.06, 0.94, 0.88)},
	"forest": {"sat": 1.05, "bright": 1.0, "contrast": 1.05, "tint": Color(0.94, 1.05, 0.95)},
	"day": {"sat": 1.05, "bright": 1.05, "contrast": 1.02, "tint": Color(1.03, 1.01, 0.95)},
	"city": {"sat": 0.95, "bright": 1.0, "contrast": 1.06, "tint": Color(0.96, 0.99, 1.06)},
	"night": {"sat": 0.9, "bright": 0.94, "contrast": 1.1, "tint": Color(0.9, 0.94, 1.1)},
	"neon": {"sat": 1.18, "bright": 0.98, "contrast": 1.1, "tint": Color(1.02, 0.94, 1.1)},
	"sand": {"sat": 1.02, "bright": 1.06, "contrast": 1.04, "tint": Color(1.1, 1.0, 0.86)},
	"toxic": {"sat": 1.0, "bright": 0.95, "contrast": 1.08, "tint": Color(0.94, 1.06, 0.92)},
	"dusk": {"sat": 1.0, "bright": 0.97, "contrast": 1.06, "tint": Color(1.04, 0.95, 1.05)},
	"rift": {"sat": 1.1, "bright": 0.96, "contrast": 1.12, "tint": Color(1.04, 0.92, 1.12)},
}

var viewport: SubViewport
var env: Environment
var ui: CanvasLayer
# hub children are script-defined; kept untyped for dynamic member access
var world_node = null                # overworld instance (kept alive during battles)
var battle_node = null
var cutscene = null
var dialogue = null
var hud = null
var pause_menu = null
var shop_ui = null
var _shake_time := 0.0
var _shake_mag := 0.0
var _cam: Camera3D


func _ready() -> void:
	viewport = SubViewport.new()
	viewport.size = Vector2i(960, 540)
	viewport.disable_3d = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.canvas_item_default_texture_filter = Viewport.DEFAULT_CANVAS_ITEM_TEXTURE_FILTER_NEAREST
	add_child(viewport)

	var quad := MeshInstance3D.new()
	var mesh := QuadMesh.new()
	mesh.size = Vector2(1.778, 1.0)
	quad.mesh = mesh
	var mat := StandardMaterial3D.new()
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.albedo_texture = viewport.get_texture()
	mat.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
	quad.material_override = mat
	quad.rotation_degrees.x = -9.0
	add_child(quad)

	_cam = Camera3D.new()
	_cam.position = Vector3(0, 0, 1.16)
	_cam.fov = 50.0
	var attrs := CameraAttributesPractical.new()
	attrs.dof_blur_far_enabled = true
	attrs.dof_blur_far_distance = 1.30
	attrs.dof_blur_far_transition = 0.22
	attrs.dof_blur_near_enabled = true
	attrs.dof_blur_near_distance = 1.02
	attrs.dof_blur_near_transition = 0.18
	attrs.dof_blur_amount = 0.07
	_cam.attributes = attrs
	add_child(_cam)

	env = Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("050308")
	env.glow_enabled = true
	env.glow_intensity = 0.55
	env.glow_bloom = 0.12
	env.glow_hdr_threshold = 0.86
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)

	ui = CanvasLayer.new()
	ui.layer = 10
	add_child(ui)
	hud = load("res://scenes/ui/hud.gd").new()
	ui.add_child(hud)
	dialogue = load("res://scenes/ui/dialogue_box.gd").new()
	ui.add_child(dialogue)
	pause_menu = load("res://scenes/ui/pause_menu.gd").new()
	ui.add_child(pause_menu)
	shop_ui = load("res://scenes/ui/shop.gd").new()
	ui.add_child(shop_ui)
	cutscene = load("res://scripts/cutscene.gd").new()
	cutscene.diorama = self
	add_child(cutscene)

	_boot_world()


func _boot_world() -> void:
	var key := GameState.current
	if key == "":
		SceneRouter.go_title()
		return
	var c: Dictionary = GameState.ch()
	var w: Dictionary = Db.world(key)
	world_node = load("res://scenes/overworld.gd").new()
	world_node.diorama = self
	viewport.add_child(world_node)
	if not bool(c.get("started", false)):
		c["started"] = true
		var s: Dictionary = GameState.hero_stats(key)
		c["hp"] = s["hp"]
		c["mp"] = s["mp"]
		var start: Dictionary = w.get("start", {})
		world_node.load_map(String(start.get("map", "")), Vector2i(int(start.get("x", 2)), int(start.get("y", 2))))
		var intro := String(w.get("intro", ""))
		if intro != "":
			cutscene.run(Db.cutscene(intro))
	else:
		var mx := int(float(c.get("x", -1.0)) / 32.0)
		var my := int(float(c.get("y", -1.0)) / 32.0)
		var map_id := String(c.get("map", ""))
		if map_id == "" or Db.map_def(map_id).is_empty():
			var start2: Dictionary = w.get("start", {})
			map_id = String(start2.get("map", ""))
			mx = int(start2.get("x", 2))
			my = int(start2.get("y", 2))
		world_node.load_map(map_id, Vector2i(mx, my))


func apply_grade(grade: String) -> void:
	var g: Dictionary = GRADES.get(grade, GRADES["day"])
	env.adjustment_enabled = true
	env.adjustment_saturation = g["sat"]
	env.adjustment_brightness = g["bright"]
	env.adjustment_contrast = g["contrast"]


func shake(mag := 6.0, dur := 0.25) -> void:
	_shake_mag = mag
	_shake_time = maxf(_shake_time, dur)


func _process(delta: float) -> void:
	if _shake_time > 0.0:
		_shake_time -= delta
		var k := _shake_mag / 960.0
		_cam.position.x = randf_range(-k, k)
		_cam.position.y = randf_range(-k, k)
	else:
		_cam.position.x = 0.0
		_cam.position.y = 0.0


func busy() -> bool:
	return dialogue.active or cutscene.active or pause_menu.visible_active() \
		or shop_ui.visible_active() or battle_node != null


# ---------- battle swapping ----------
func start_battle(opts: Dictionary) -> void:
	if battle_node != null:
		return
	if world_node != null and world_node.get_parent() == viewport:
		viewport.remove_child(world_node)
	battle_node = load("res://scenes/battle.gd").new()
	battle_node.diorama = self
	battle_node.opts = opts
	viewport.add_child(battle_node)
	AudioDirector.play_theme(String(opts.get("music", "boss" if bool(opts.get("boss", false)) else "battle")))


func end_battle(outcome: String) -> void:
	if battle_node == null:
		return
	var opts: Dictionary = battle_node.opts
	viewport.remove_child(battle_node)
	battle_node.queue_free()
	battle_node = null
	if world_node != null and world_node.get_parent() != viewport:
		viewport.add_child(world_node)
	if outcome == "lose":
		world_node.respawn()
	else:
		world_node.resume()
	if opts.has("on_win") and outcome == "win":
		var cb: Callable = opts["on_win"]
		cb.call()
