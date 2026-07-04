extends Node2D
## Overworld — builds a playable area from a JSON map definition:
## TileMapLayer ground, y-sorted feature sprites, NPCs, chests, shrine
## checkpoints, exits, story triggers, random encounters, followers,
## ambient particles and the area-name banner.

const TILE := 32
const GROUND_ROW := {
	"floor": 0, "hostile": 1, "path": 2, "dirt": 3, "sand": 4, "water_a": 5,
	"water_b": 6, "wall": 7, "void": 8, "swamp": 9, "neon": 10, "mountain": 11,
}
const LEGEND := {
	".": {"g": "floor"}, ",": {"g": "hostile", "hostile": true}, ";": {"g": "hostile", "hostile": true},
	"=": {"g": "path"}, "-": {"g": "path"}, "D": {"g": "path"},
	"d": {"g": "dirt"}, "s": {"g": "sand"},
	"~": {"g": "water_a", "solid": true}, "#": {"g": "wall", "solid": true},
	"^": {"g": "mountain", "solid": true}, "_": {"g": "void", "solid": true},
	"w": {"g": "swamp", "hostile": true}, "n": {"g": "neon"},
	"*": {"g": "floor", "f": "flowers"}, "x": {"g": "floor", "f": "crack"},
	"+": {"g": "floor", "f": "shrine_a", "shrine": true},
	"T": {"g": "floor", "f": "tree", "solid": true}, "Y": {"g": "floor", "f": "deadtree", "solid": true},
	"%": {"g": "floor", "f": "bamboo", "solid": true}, "o": {"g": "floor", "f": "rock", "solid": true},
	"P": {"g": "floor", "f": "pillar", "solid": true}, "F": {"g": "floor", "f": "fence", "solid": true},
	"H": {"g": "floor", "f": "house", "solid": true}, "B": {"g": "floor", "f": "hirise", "solid": true},
	"c": {"g": "floor", "f": "counter", "solid": true},
}
const FEATURE_COL := {
	"tree": 0, "deadtree": 1, "bamboo": 2, "rock": 3, "pillar": 4, "fence": 5, "house": 6,
	"hirise": 7, "counter": 8, "shrine_a": 9, "shrine_b": 10, "chest_closed": 11,
	"chest_open": 12, "flowers": 13, "crack": 14,
}
const AMBIENCE := {
	"ash": {"count": 40, "col": Color(0.8, 0.75, 0.7, 0.5), "vy": 14, "vx": 0, "spread": 8, "size": 2.0},
	"embers": {"count": 30, "col": Color(1.0, 0.47, 0.2, 0.6), "vy": -16, "vx": 0, "spread": 10, "size": 2.0},
	"petals": {"count": 30, "col": Color(0.94, 0.66, 0.75, 0.7), "vy": 20, "vx": -13, "spread": 8, "size": 3.0},
	"rain": {"count": 90, "col": Color(0.63, 0.75, 0.9, 0.4), "vy": 360, "vx": -30, "spread": 20, "size": 1.5},
	"neonrain": {"count": 70, "col": Color(0.0, 0.9, 0.79, 0.35), "vy": 320, "vx": -20, "spread": 20, "size": 1.5},
	"motes": {"count": 26, "col": Color(0.78, 0.42, 1.0, 0.6), "vy": -9, "vx": 0, "spread": 6, "size": 2.0},
	"dust": {"count": 24, "col": Color(0.82, 0.7, 0.5, 0.35), "vy": 0, "vx": 35, "spread": 10, "size": 2.0},
	"fireflies": {"count": 18, "col": Color(0.86, 1.0, 0.55, 0.8), "vy": 0, "vx": 0, "spread": 12, "size": 2.0},
	"smog": {"count": 14, "col": Color(0.47, 0.47, 0.55, 0.13), "vy": 0, "vx": 14, "spread": 6, "size": 20.0},
}

# untyped by design: the diorama shell is a script-defined hub; dynamic access
# avoids native-type member errors in the strict analyzer
var diorama = null
var map: Dictionary = {}
var grid: Array = []                 # rows of strings
var map_w := 0
var map_h := 0
var player: Sprite2D
var player_pos := Vector2.ZERO       # feet position, pixels
var dir := "down"
var moving := false
var anim_t := 0.0
var hist: Array = []                 # follower position history
var followers: Array = []            # [{id, node}]
var npcs: Array = []                 # runtime npc records
var chests: Array = []
var camera: Camera2D
var entity_layer: Node2D
var tiles: TileMapLayer
var enc_meter := 0.0
var enc_threshold := 5.0
var water_cells: Array = []
var water_flip := false
var water_t := 0.0
var shrine_cells: Array = []
var shrine_t := 0.0
var banner_label: Label
var banner_t := 0.0
var chatter_t := 9.0
var chatter_label: Label
var chatter_follower: Node2D = null
var chatter_life := 0.0
var _shadow_tex: ImageTexture
var frozen := false                  # true while battle owns the viewport


func _ready() -> void:
	_shadow_tex = _make_shadow()


func hero_key() -> String:
	return GameState.current


# ================= map loading =================
func load_map(map_id: String, spawn: Vector2i) -> void:
	map = Db.map_def(map_id)
	if map.is_empty():
		push_error("Overworld: missing map " + map_id)
		return
	for child in get_children():
		child.queue_free()
	npcs.clear()
	chests.clear()
	followers.clear()
	water_cells.clear()
	shrine_cells.clear()
	hist.clear()
	grid = map.get("rows", [])
	map_h = grid.size()
	map_w = 0
	for row in grid:
		map_w = maxi(map_w, String(row).length())

	var c: Dictionary = GameState.ch()
	c["map"] = map_id
	var theme := String(map.get("theme", "sengoku"))

	_build_tiles(theme)
	entity_layer = Node2D.new()
	entity_layer.y_sort_enabled = true
	add_child(entity_layer)
	_build_features(theme)
	_build_npcs()
	_build_chests(theme)
	_build_player(spawn)
	_build_camera()
	_build_ambience()
	_build_banner()

	enc_meter = 0.0
	enc_threshold = randf_range(4.0, 8.0)
	if diorama != null:
		diorama.apply_grade(String(map.get("grade", "day")))
	AudioDirector.play_theme(String(map.get("music", "title")))
	if c.get("checkpoint", {}).is_empty():
		c["checkpoint"] = {"map": map_id, "x": spawn.x, "y": spawn.y}
	frozen = false


func tile_at(tx: int, ty: int) -> String:
	if tx < 0 or ty < 0 or ty >= map_h:
		return "#"
	var row := String(grid[ty])
	if tx >= row.length():
		return "#"
	return row[tx]


func legend_of(ch_: String) -> Dictionary:
	return LEGEND.get(ch_, {"g": "floor"})


func is_solid(tx: int, ty: int) -> bool:
	return bool(legend_of(tile_at(tx, ty)).get("solid", false))


func solid_px(x: float, y: float) -> bool:
	return is_solid(int(x / TILE), int(y / TILE))


func blocked(x: float, y: float) -> bool:
	var hw := 9.0
	if solid_px(x - hw, y - 4) or solid_px(x + hw, y - 4) or solid_px(x - hw, y + 5) or solid_px(x + hw, y + 5):
		return true
	for n in npcs:
		if bool(n.get("hidden", false)):
			continue
		var np: Vector2 = n["node"].position
		if absf(np.x - x) < 20 and absf(np.y - y) < 16:
			return true
	return false


func _build_tiles(theme: String) -> void:
	var ts := TileSet.new()
	ts.tile_size = Vector2i(TILE, TILE)
	var src := TileSetAtlasSource.new()
	src.texture = Db.tiles_tex(theme)
	src.texture_region_size = Vector2i(TILE, TILE)
	for row in range(12):
		for v in range(3):
			src.create_tile(Vector2i(v, row))
	var sid := ts.add_source(src)
	tiles = TileMapLayer.new()
	tiles.tile_set = ts
	tiles.z_index = -10
	add_child(tiles)
	for y in range(map_h):
		for x in range(map_w):
			var ch_ := tile_at(x, y)
			var leg := legend_of(ch_)
			var row: int = GROUND_ROW[String(leg["g"])]
			var variant := (x * 7 + y * 13 + x * y) % 3
			tiles.set_cell(Vector2i(x, y), sid, Vector2i(variant, row))
			if String(leg["g"]) == "water_a":
				water_cells.append(Vector2i(x, y))


func _feature_sprite(theme: String, feature: String, tx: int, ty: int) -> Sprite2D:
	var s := Sprite2D.new()
	s.texture = Db.features_tex(theme)
	s.region_enabled = true
	s.region_rect = Rect2(FEATURE_COL[feature] * 32, 0, 32, 64)
	s.centered = false
	s.position = Vector2(tx * TILE + 16, ty * TILE + TILE)
	s.offset = Vector2(-16, -64)
	return s


func _build_features(theme: String) -> void:
	for y in range(map_h):
		for x in range(map_w):
			var leg := legend_of(tile_at(x, y))
			if not leg.has("f"):
				continue
			var s := _feature_sprite(theme, String(leg["f"]), x, y)
			entity_layer.add_child(s)
			if bool(leg.get("shrine", false)):
				shrine_cells.append(s)


func _build_npcs() -> void:
	var c: Dictionary = GameState.ch()
	for def in map.get("npcs", []):
		var is_hidden: bool = def.has("min_chapter") and int(c["chapter"]) < int(def["min_chapter"])
		var node := Node2D.new()
		node.position = Vector2(int(def["x"]) * TILE + 16, int(def["y"]) * TILE + 16)
		var shadow := _shadow_sprite()
		node.add_child(shadow)
		var spr := Sprite2D.new()
		SpriteUtil.apply_frame(spr, String(def["sprite"]), 0, String(def.get("dir", "down")))
		node.add_child(spr)
		var mark := Label.new()
		mark.text = ""
		mark.position = Vector2(-6, -64)
		mark.add_theme_font_size_override("font_size", 16)
		mark.add_theme_color_override("font_outline_color", Color.BLACK)
		mark.add_theme_constant_override("outline_size", 4)
		node.add_child(mark)
		node.visible = not is_hidden
		entity_layer.add_child(node)
		npcs.append({"def": def, "node": node, "spr": spr, "mark": mark, "hidden": is_hidden,
			"dir": String(def.get("dir", "down")), "home": node.position,
			"wander_t": randf() * 4.0, "target": Vector2.ZERO, "walking": false})


func _build_chests(theme: String) -> void:
	var c: Dictionary = GameState.ch()
	for def in map.get("chests", []):
		var opened: bool = c["flags"].has("chest_%s_%s" % [String(map["id"]), str(def["id"])])
		var s := _feature_sprite(theme, "chest_open" if opened else "chest_closed", int(def["x"]), int(def["y"]))
		entity_layer.add_child(s)
		chests.append({"def": def, "node": s, "open": opened})


func _build_player(spawn: Vector2i) -> void:
	var holder := Node2D.new()
	player_pos = Vector2(spawn.x * TILE + 16, spawn.y * TILE + 16)
	holder.position = player_pos
	holder.add_child(_shadow_sprite())
	player = Sprite2D.new()
	SpriteUtil.apply_frame(player, String(GameState.hero_info(hero_key())["sprite"]), 0, "down")
	holder.add_child(player)
	entity_layer.add_child(holder)
	player.set_meta("holder", holder)
	var c: Dictionary = GameState.ch()
	c["x"] = player_pos.x
	c["y"] = player_pos.y
	_rebuild_followers()


func _rebuild_followers() -> void:
	for f in followers:
		f["node"].queue_free()
	followers.clear()
	for comp_id in GameState.ch().get("party", []):
		var node := Node2D.new()
		node.position = player_pos
		node.add_child(_shadow_sprite())
		var spr := Sprite2D.new()
		SpriteUtil.apply_frame(spr, String(Db.companion(comp_id).get("sprite", "goro")), 0, "down")
		node.add_child(spr)
		entity_layer.add_child(node)
		followers.append({"id": comp_id, "node": node, "spr": spr})


func _build_camera() -> void:
	camera = Camera2D.new()
	camera.position = player_pos
	camera.limit_left = 0
	camera.limit_top = 0
	camera.limit_right = maxi(map_w * TILE, 960)
	camera.limit_bottom = maxi(map_h * TILE, 540)
	camera.position_smoothing_enabled = true
	camera.position_smoothing_speed = 8.0
	add_child(camera)
	camera.make_current()
	# soft vignette bands attached to the camera (screen space)
	var top := ColorRect.new()
	top.color = Color(0, 0, 0, 0.22)
	top.position = Vector2(-480, -270)
	top.size = Vector2(960, 34)
	camera.add_child(top)
	var bottom := ColorRect.new()
	bottom.color = Color(0, 0, 0, 0.28)
	bottom.position = Vector2(-480, 236)
	bottom.size = Vector2(960, 34)
	camera.add_child(bottom)


func _build_ambience() -> void:
	var preset_name := String(map.get("amb", ""))
	if not AMBIENCE.has(preset_name):
		return
	var a: Dictionary = AMBIENCE[preset_name]
	var parts := GPUParticles2D.new()
	var mat := ParticleProcessMaterial.new()
	mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	mat.emission_box_extents = Vector3(520, 300, 0)
	mat.direction = Vector3(float(a["vx"]), float(a["vy"]), 0).normalized() if (float(a["vx"]) != 0.0 or float(a["vy"]) != 0.0) else Vector3(0, 1, 0)
	var speed: float = Vector2(float(a["vx"]), float(a["vy"])).length()
	mat.initial_velocity_min = maxf(4.0, speed * 0.8)
	mat.initial_velocity_max = maxf(8.0, speed * 1.2)
	mat.spread = float(a["spread"])
	mat.gravity = Vector3.ZERO
	mat.scale_min = float(a["size"]) * 0.7
	mat.scale_max = float(a["size"]) * 1.3
	mat.color = a["col"]
	parts.process_material = mat
	parts.amount = int(a["count"])
	parts.lifetime = 6.0
	parts.preprocess = 6.0
	var img := Image.create(2, 2, false, Image.FORMAT_RGBA8)
	img.fill(Color.WHITE)
	parts.texture = ImageTexture.create_from_image(img)
	camera.add_child(parts)


func _build_banner() -> void:
	banner_label = Label.new()
	banner_label.text = String(map.get("name", ""))
	banner_label.add_theme_font_size_override("font_size", 30)
	banner_label.add_theme_color_override("font_outline_color", Color.BLACK)
	banner_label.add_theme_constant_override("outline_size", 6)
	banner_label.position = Vector2(-480, -210)
	banner_label.size = Vector2(960, 40)
	banner_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	camera.add_child(banner_label)
	banner_t = 3.0
	chatter_label = Label.new()
	chatter_label.visible = false
	chatter_label.add_theme_font_size_override("font_size", 11)
	chatter_label.add_theme_color_override("font_color", Color("d8d2ec"))
	chatter_label.add_theme_color_override("font_outline_color", Color(0.06, 0.05, 0.11))
	chatter_label.add_theme_constant_override("outline_size", 5)
	add_child(chatter_label)


func _make_shadow() -> ImageTexture:
	var img := Image.create(24, 10, false, Image.FORMAT_RGBA8)
	for y in range(10):
		for x in range(24):
			var dx := (x - 12.0) / 12.0
			var dy := (y - 5.0) / 5.0
			if dx * dx + dy * dy <= 1.0:
				img.set_pixel(x, y, Color(0, 0, 0, 0.35))
	return ImageTexture.create_from_image(img)


func _shadow_sprite() -> Sprite2D:
	var s := Sprite2D.new()
	s.texture = _shadow_tex
	s.position = Vector2(0, 2)
	return s


# ================= per-frame =================
func _process(delta: float) -> void:
	if frozen or map.is_empty():
		return
	_animate_environment(delta)
	if banner_t > 0.0:
		banner_t -= delta
		banner_label.modulate.a = clampf(minf(banner_t, (3.0 - banner_t) * 2.0), 0.0, 1.0)
	_update_chatter(delta)
	_update_npc_marks()
	if diorama != null and diorama.busy():
		return
	if Input.is_action_just_pressed("menu"):
		AudioDirector.sfx("confirm")
		diorama.pause_menu.open()
		return
	if Input.is_action_just_pressed("confirm"):
		_interact()
		return
	_move_player(delta)
	_wander_npcs(delta)


func _animate_environment(delta: float) -> void:
	water_t += delta
	if water_t > 0.6 and not water_cells.is_empty():
		water_t = 0.0
		water_flip = not water_flip
		var row := 6 if water_flip else 5
		var sid := 0
		for cell: Vector2i in water_cells:
			var variant: int = (cell.x * 7 + cell.y * 13 + cell.x * cell.y) % 3
			tiles.set_cell(cell, sid, Vector2i(variant, row))
	shrine_t += delta
	if shrine_t > 0.5:
		shrine_t = 0.0
		for s: Sprite2D in shrine_cells:
			var col := int(s.region_rect.position.x / 32.0)
			var next: int = FEATURE_COL["shrine_b"] if col == FEATURE_COL["shrine_a"] else FEATURE_COL["shrine_a"]
			s.region_rect = Rect2(next * 32, 0, 32, 64)


func _move_player(delta: float) -> void:
	var v := Vector2.ZERO
	if Input.is_action_pressed("move_up"):
		v.y -= 1
	if Input.is_action_pressed("move_down"):
		v.y += 1
	if Input.is_action_pressed("move_left"):
		v.x -= 1
	if Input.is_action_pressed("move_right"):
		v.x += 1
	moving = v != Vector2.ZERO
	var holder: Node2D = player.get_meta("holder")
	if moving:
		if v.y < 0:
			dir = "up"
		elif v.y > 0:
			dir = "down"
		if v.x < 0:
			dir = "left"
		elif v.x > 0:
			dir = "right"
		var speed := 205.0 if Input.is_action_pressed("run") else 145.0
		var step := v.normalized() * speed * delta
		if not blocked(player_pos.x + step.x, player_pos.y):
			player_pos.x += step.x
		if not blocked(player_pos.x, player_pos.y + step.y):
			player_pos.y += step.y
		anim_t += delta * 8.0
		hist.push_front([player_pos, dir])
		if hist.size() > 40:
			hist.pop_back()
		var c: Dictionary = GameState.ch()
		c["x"] = player_pos.x
		c["y"] = player_pos.y
		_check_encounters(delta)
		if _check_exits():
			return
		_check_triggers()
	else:
		anim_t = 0.0
		_check_triggers()
	holder.position = player_pos
	camera.position = player_pos
	var frame := 0 if not moving else (int(anim_t) % 2 + 1)
	SpriteUtil.apply_frame(player, String(GameState.hero_info(hero_key())["sprite"]), frame, dir)
	for i in range(followers.size()):
		var rec: Array = hist[mini(hist.size() - 1, (i + 1) * 13)] if not hist.is_empty() else [player_pos, dir]
		var f: Dictionary = followers[i]
		f["node"].position = rec[0]
		SpriteUtil.apply_frame(f["spr"], String(Db.companion(f["id"]).get("sprite", "goro")), frame, String(rec[1]))


func _check_encounters(delta: float) -> void:
	var enc: Dictionary = map.get("enc", {})
	if enc.is_empty():
		return
	var leg := legend_of(tile_at(int(player_pos.x / TILE), int(player_pos.y / TILE)))
	if not bool(leg.get("hostile", false)):
		return
	enc_meter += delta * (1.35 if Input.is_action_pressed("run") else 1.0)
	if enc_meter >= enc_threshold:
		enc_meter = 0.0
		enc_threshold = randf_range(4.0, 8.5)
		var groups: Array = enc.get("groups", [])
		if groups.is_empty():
			return
		var group: Array = groups[randi() % groups.size()]
		SceneRouter.start_battle({"enemies": group, "bg": String(map.get("bg", "rift"))})


func _check_exits() -> bool:
	var c: Dictionary = GameState.ch()
	var tx := int(player_pos.x / TILE)
	var ty := int(player_pos.y / TILE)
	for e in map.get("exits", []):
		var ex := int(e["x"])
		var ey := int(e["y"])
		var ew := int(e.get("w", 1))
		var eh := int(e.get("h", 1))
		if tx < ex or tx >= ex + ew or ty < ey or ty >= ey + eh:
			continue
		if e.has("req_chapter") and int(c["chapter"]) < int(e["req_chapter"]):
			if e.has("locked"):
				SceneRouter.toast(String(e["locked"]), Color("ff8080"))
			var push: Vector2 = {"down": Vector2(0, -16), "up": Vector2(0, 16), "left": Vector2(16, 0), "right": Vector2(-16, 0)}[dir]
			player_pos += push
			return true
		var target := String(e["to"])
		var tpos := Vector2i(int(e["tx"]), int(e["ty"]))
		SceneRouter.fade_to(func(): load_map(target, tpos), 0.6)
		frozen = true
		return true
	return false


func _check_triggers() -> void:
	var c: Dictionary = GameState.ch()
	var tx := int(player_pos.x / TILE)
	var ty := int(player_pos.y / TILE)
	for t in map.get("triggers", []):
		var key := "trg_%s_%s" % [String(map["id"]), str(t["id"])]
		if bool(t.get("once", true)) and c["flags"].has(key):
			continue
		if t.has("chapter") and int(c["chapter"]) != int(t["chapter"]):
			continue
		if t.has("req_flag") and not c["flags"].has(String(t["req_flag"])):
			continue
		if t.has("not_flag") and c["flags"].has(String(t["not_flag"])):
			continue
		var rx := int(t["x"])
		var ry := int(t["y"])
		if tx < rx or tx >= rx + int(t.get("w", 1)) or ty < ry or ty >= ry + int(t.get("h", 1)):
			continue
		if bool(t.get("once", true)):
			c["flags"][key] = 1
		diorama.cutscene.run(Db.cutscene(String(t["event"])))
		return


# ================= interaction =================
func facing_point() -> Vector2:
	var d: Vector2 = {"down": Vector2(0, 26), "up": Vector2(0, -26), "left": Vector2(-26, 0), "right": Vector2(26, 0)}[dir]
	return player_pos + d + Vector2(0, -6)


func _interact() -> void:
	var fp := facing_point()
	for n in npcs:
		if bool(n.get("hidden", false)):
			continue
		var np: Vector2 = n["node"].position
		if absf(np.x - fp.x) < 26 and absf(np.y - 6 - fp.y) < 28:
			_interact_npc(n)
			return
	var c: Dictionary = GameState.ch()
	for chest in chests:
		if bool(chest["open"]):
			continue
		var cp: Vector2 = chest["node"].position
		if absf(cp.x - fp.x) < 26 and absf(cp.y - 16 - fp.y) < 26:
			chest["open"] = true
			c["flags"]["chest_%s_%s" % [String(map["id"]), str(chest["def"]["id"])]] = 1
			chest["node"].region_rect = Rect2(FEATURE_COL["chest_open"] * 32, 0, 32, 64)
			AudioDirector.sfx("chest")
			for entry in chest["def"].get("items", []):
				GameState.inv_add(c, String(entry["id"]), int(entry.get("n", 1)))
				SceneRouter.toast("Got %s%s" % [String(Db.item(String(entry["id"])).get("name", entry["id"])),
					(" x%d" % int(entry.get("n", 1))) if int(entry.get("n", 1)) > 1 else ""], Color("ffd23e"))
			if chest["def"].has("gold"):
				c["gold"] = int(c["gold"]) + int(chest["def"]["gold"])
				SceneRouter.toast("+%d %s" % [int(chest["def"]["gold"]), GameState.currency()], Color("ffd23e"))
			return
	# shrine
	var leg_here := legend_of(tile_at(int(player_pos.x / TILE), int(player_pos.y / TILE)))
	var leg_face := legend_of(tile_at(int(fp.x / TILE), int(fp.y / TILE)))
	if bool(leg_here.get("shrine", false)) or bool(leg_face.get("shrine", false)):
		var s := GameState.hero_stats(hero_key())
		c["hp"] = s["hp"]
		c["mp"] = s["mp"]
		c["checkpoint"] = {"map": String(map["id"]), "x": int(player_pos.x / TILE), "y": int(player_pos.y / TILE)}
		GameState.save_game()
		AudioDirector.sfx("heal")
		SceneRouter.toast("Rested. Progress saved — this shrine is your checkpoint.", Color("7dffa0"))
		return
	for sign_def in map.get("signs", []):
		var sp := Vector2(int(sign_def["x"]) * TILE + 16, int(sign_def["y"]) * TILE + 16)
		if absf(sp.x - fp.x) < 26 and absf(sp.y - fp.y) < 26:
			diorama.dialogue.open([{"text": String(sign_def["text"])}], Callable())
			return


func _interact_npc(n: Dictionary) -> void:
	var def: Dictionary = n["def"]
	var c: Dictionary = GameState.ch()
	n["dir"] = {"down": "up", "up": "down", "left": "right", "right": "left"}[dir]
	SpriteUtil.apply_frame(n["spr"], String(def["sprite"]), 0, String(n["dir"]))
	var speaker := {"who": String(def.get("name", "???")), "portrait": String(def["sprite"]),
		"color": String(def.get("color", "#b8b0d0"))}
	# quest turn-in
	if def.has("quest") and GameState.quest_ready(String(def["quest"])):
		var q := Db.quest(String(def["quest"]))
		var lines: Array = []
		for txt in q.get("turnin", ["You actually did it. Here — as promised."]):
			lines.append(_line(speaker, String(txt)))
		diorama.dialogue.open(lines, func():
			var r := GameState.turn_in_quest(String(def["quest"]))
			AudioDirector.sfx("level")
			SceneRouter.toast("Quest complete: %s  +%d %s" % [String(q["name"]), int(r.get("gold", 0)), GameState.currency()], Color("7dffa0")))
		return
	# quest offer
	if def.has("quest") and not c["quests"].has(String(def["quest"])):
		var q2 := Db.quest(String(def["quest"]))
		var offer: Array = []
		for txt in q2.get("offer", [String(q2.get("desc", "..."))]):
			offer.append(_line(speaker, String(txt)))
		var qid := String(def["quest"])
		var last: Dictionary = offer[offer.size() - 1]
		last["choices"] = [
			{"label": "Accept — " + String(q2["name"]), "action": func():
				GameState.start_quest(qid)
				AudioDirector.sfx("confirm")
				SceneRouter.toast("Quest started: " + String(q2["name"]), Color("9adcff"))},
			{"label": "Not now", "action": Callable()},
		]
		diorama.dialogue.open(offer, Callable())
		return
	# quest in progress
	if def.has("quest") and c["quests"].has(String(def["quest"])) and not GameState.quest_ready(String(def["quest"])) \
			and not bool(c["quests"][String(def["quest"])].get("done", false)):
		var q3 := Db.quest(String(def["quest"]))
		diorama.dialogue.open([_line(speaker, String(q3.get("mid", "Still on it?")) + "  (" + GameState.quest_progress(String(def["quest"])) + ")")], Callable())
		return
	# hire
	if def.has("hire"):
		var comp_id := String(def["hire"])
		var comp := Db.companion(comp_id)
		if c["party"].has(comp_id):
			var bank := Db.bank(String(comp.get("type", "brute")))
			var idle: Array = bank.get("idle", ["..."])
			diorama.dialogue.open([_line({"who": String(comp["name"]), "portrait": String(comp["sprite"]), "color": "#b8b0d0"},
				String(idle[randi() % idle.size()]))], Callable())
			return
		var cost := int(comp.get("cost", 100))
		var pitch := _line(speaker, String(comp.get("pitch", "Need a hand out there?")))
		pitch["choices"] = [
			{"label": "Hire %s (%d %s)" % [String(comp["name"]), cost, GameState.currency()], "action": func():
				_try_hire(comp_id, cost)},
			{"label": "Just passing through", "action": Callable()},
		]
		diorama.dialogue.open([pitch], Callable())
		return
	# shop
	if def.has("shop"):
		var shop_id := String(def["shop"])
		diorama.dialogue.open([_line(speaker, String(def.get("shop_line", "Take a look. Everything has a price.")))],
			func(): diorama.shop_ui.open(shop_id))
		return
	# plain dialogue
	if def.has("dialog"):
		var variants: Array = Db.dialogues.get(String(def["dialog"]), [])
		var best: Dictionary = {}
		for v in variants:
			if int(c["chapter"]) >= int(v.get("min_chapter", 0)):
				best = v
		var lines2: Array = []
		for txt in best.get("lines", ["…"]):
			lines2.append(_line(speaker, String(txt)))
		diorama.dialogue.open(lines2, Callable())
		return
	diorama.dialogue.open([_line(speaker, "…")], Callable())


func _try_hire(comp_id: String, cost: int) -> void:
	var c: Dictionary = GameState.ch()
	var comp := Db.companion(comp_id)
	if (c["party"] as Array).size() >= 2:
		diorama.dialogue.open([{"text": "Your party is full. (2 companions max — dismiss one in the menu.)"}], Callable())
		return
	if int(c["gold"]) < cost:
		diorama.dialogue.open([_line({"who": String(comp["name"]), "portrait": String(comp["sprite"]), "color": "#b8b0d0"},
			String(comp.get("broke", "Come back when you can pay.")))], Callable())
		return
	c["gold"] = int(c["gold"]) - cost
	c["party"].append(comp_id)
	AudioDirector.sfx("level")
	_rebuild_followers()
	var bank := Db.bank(String(comp.get("type", "brute")))
	var hire_lines: Array = bank.get("hire", ["Deal."])
	diorama.dialogue.open([_line({"who": String(comp["name"]), "portrait": String(comp["sprite"]), "color": "#b8b0d0"},
		String(hire_lines[randi() % hire_lines.size()]))], Callable())


func _line(speaker: Dictionary, text: String) -> Dictionary:
	return {"who": speaker.get("who", ""), "portrait": speaker.get("portrait", ""),
		"color": speaker.get("color", "#b8b0d0"), "text": text}


# ================= npc wandering / marks / chatter =================
func _wander_npcs(delta: float) -> void:
	for n in npcs:
		if bool(n.get("hidden", false)) or bool(n["def"].get("still", false)):
			continue
		n["wander_t"] = float(n["wander_t"]) - delta
		if float(n["wander_t"]) <= 0.0:
			n["wander_t"] = randf_range(2.0, 6.0)
			n["target"] = Vector2(n["home"]) + Vector2(randf_range(-35, 35), randf_range(-35, 35))
		var node: Node2D = n["node"]
		var tgt: Vector2 = n["target"]
		if tgt == Vector2.ZERO:
			continue
		var d := tgt - node.position
		if d.length() > 4.0:
			var step := d.normalized() * 34.0 * delta
			var np := node.position + step
			if not solid_px(np.x, np.y) and np.distance_to(player_pos) > 30.0:
				node.position = np
				n["walking"] = true
				n["dir"] = ("left" if d.x < 0 else "right") if absf(d.x) > absf(d.y) else ("up" if d.y < 0 else "down")
			else:
				n["target"] = Vector2.ZERO
				n["walking"] = false
		else:
			n["walking"] = false
		var frame := (int(Time.get_ticks_msec() / 160.0) % 2 + 1) if bool(n["walking"]) else 0
		SpriteUtil.apply_frame(n["spr"], String(n["def"]["sprite"]), frame, String(n["dir"]))


func _update_npc_marks() -> void:
	var c: Dictionary = GameState.ch()
	for n in npcs:
		var mark: Label = n["mark"]
		var def: Dictionary = n["def"]
		mark.text = ""
		if def.has("quest"):
			var qid := String(def["quest"])
			if not c["quests"].has(qid):
				mark.text = "!"
				mark.add_theme_color_override("font_color", Color("ffd23e"))
			elif GameState.quest_ready(qid):
				mark.text = "?"
				mark.add_theme_color_override("font_color", Color("7dffa0"))


func _update_chatter(delta: float) -> void:
	if chatter_life > 0.0:
		chatter_life -= delta
		if chatter_life <= 0.0 or chatter_follower == null:
			chatter_label.visible = false
		else:
			chatter_label.position = chatter_follower.position + Vector2(-60, -70)
	if diorama != null and diorama.busy():
		return
	chatter_t -= delta
	if chatter_t <= 0.0:
		chatter_t = randf_range(11.0, 24.0)
		var party: Array = GameState.ch().get("party", [])
		if party.is_empty() or followers.is_empty() or randf() > 0.55:
			return
		var i := randi() % followers.size()
		var comp := Db.companion(String(followers[i]["id"]))
		var bank := Db.bank(String(comp.get("type", "brute")))
		var idle: Array = bank.get("idle", [])
		if idle.is_empty():
			return
		chatter_label.text = String(idle[randi() % idle.size()])
		chatter_label.visible = true
		chatter_follower = followers[i]["node"]
		chatter_life = 3.4


# ================= battle re-entry =================
func resume() -> void:
	frozen = false
	AudioDirector.play_theme(String(map.get("music", "title")))
	_rebuild_followers()


func respawn() -> void:
	var c: Dictionary = GameState.ch()
	var cp: Dictionary = c.get("checkpoint", {})
	var s := GameState.hero_stats(hero_key())
	c["hp"] = int(s["hp"] / 2.0)
	c["mp"] = int(s["mp"] / 2.0)
	c["gold"] = maxi(0, int(c["gold"]) - int(float(c["gold"]) * 0.15))
	frozen = true
	SceneRouter.fade_to(func():
		load_map(String(cp.get("map", c["map"])), Vector2i(int(cp.get("x", 2)), int(cp.get("y", 2))))
		SceneRouter.toast("You wake at the last shrine… lighter of purse.", Color("b8b0d0")), 0.8)
