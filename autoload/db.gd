extends Node
## Db — loads every JSON content file under res://data and exposes typed accessors.
## Content is data-driven: adding a chapter/area = adding JSON files, no code changes.

var items: Dictionary = {}
var enemies: Dictionary = {}
var quests: Dictionary = {}
var shops: Dictionary = {}
var companions: Dictionary = {}
var banks: Dictionary = {}          # companion archetype dialogue banks
var worlds: Dictionary = {}         # world meta (chapters, start, gates)
var maps: Dictionary = {}           # map id -> map def
var cutscenes: Dictionary = {}      # cutscene id -> step array
var dialogues: Dictionary = {}      # npc dialogue id -> lines (array of arrays by chapter or flat)
var sprites: Dictionary = {}        # sprite name -> spec (for reference)

var _tex_cache: Dictionary = {}
var _sfx_cache: Dictionary = {}


func _ready() -> void:
	items = _load_json("res://data/items.json")
	enemies = _load_json("res://data/enemies.json")
	quests = _load_json("res://data/quests.json")
	shops = _load_json("res://data/shops.json")
	companions = _load_json("res://data/companions.json")
	banks = _load_json("res://data/common.json")
	sprites = _load_json("res://data/sprites.json")
	for world_id in ["samurai", "business", "cyber", "convergence"]:
		var base := "res://data/worlds/%s/" % world_id
		var w: Dictionary = _load_json(base + "world.json")
		if w.is_empty():
			continue
		worlds[world_id] = w
		for map_id in w.get("maps", []):
			var m: Dictionary = _load_json(base + "maps/%s.json" % map_id)
			if not m.is_empty():
				maps[map_id] = m
		var cs: Dictionary = _load_json(base + "cutscenes.json")
		for k in cs.keys():
			cutscenes[k] = cs[k]
		var dl: Dictionary = _load_json(base + "dialogue.json")
		for k in dl.keys():
			dialogues[k] = dl[k]


func _load_json(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		return {}
	var text := FileAccess.get_file_as_string(path)
	var parsed: Variant = JSON.parse_string(text)
	if parsed == null:
		push_error("Db: failed to parse " + path)
		return {}
	return parsed


func item(id: String) -> Dictionary:
	return items.get(id, {})


func enemy(id: String) -> Dictionary:
	return enemies.get(id, {})


func map_def(id: String) -> Dictionary:
	return maps.get(id, {})


func world(id: String) -> Dictionary:
	return worlds.get(id, {})


func cutscene(id: String) -> Array:
	return cutscenes.get(id, [])


func quest(id: String) -> Dictionary:
	return quests.get(id, {})


func shop(id: String) -> Dictionary:
	return shops.get(id, {})


func companion(id: String) -> Dictionary:
	return companions.get(id, {})


func bank(archetype: String) -> Dictionary:
	return banks.get(archetype, {})


# ---------- asset accessors ----------
func tex(path: String) -> Texture2D:
	if _tex_cache.has(path):
		return _tex_cache[path]
	var t: Texture2D = load(path)
	_tex_cache[path] = t
	return t


func sprite_tex(name: String) -> Texture2D:
	return tex("res://assets/generated/sprites/%s.png" % name)


func portrait_tex(name: String) -> Texture2D:
	var path := "res://assets/generated/portraits/%s.png" % name
	if not ResourceLoader.exists(path):
		return null
	return tex(path)


func tiles_tex(theme: String) -> Texture2D:
	return tex("res://assets/generated/tiles/%s.png" % theme)


func features_tex(theme: String) -> Texture2D:
	return tex("res://assets/generated/features/%s.png" % theme)


func backdrop_tex(name: String) -> Texture2D:
	var path := "res://assets/generated/backdrops/%s.png" % name
	if not ResourceLoader.exists(path):
		path = "res://assets/generated/backdrops/rift.png"
	return tex(path)


## Frame size for a sprite sheet (sheets are 3 cols x 3 rows).
func sprite_frame_size(name: String) -> Vector2i:
	var t := sprite_tex(name)
	return Vector2i(t.get_width() / 3, t.get_height() / 3)


## Load a generated WAV as an AudioStreamWAV (44-byte canonical header).
func wav(name: String, looped: bool) -> AudioStreamWAV:
	var key := name + ("_loop" if looped else "")
	if _sfx_cache.has(key):
		return _sfx_cache[key]
	var path := "res://assets/generated/audio/%s.wav" % name
	if not FileAccess.file_exists(path):
		return null
	var bytes := FileAccess.get_file_as_bytes(path)
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = 22050
	stream.stereo = false
	stream.data = bytes.slice(44)
	if looped:
		stream.loop_mode = AudioStreamWAV.LOOP_FORWARD
		stream.loop_begin = 0
		stream.loop_end = (bytes.size() - 44) / 2
	_sfx_cache[key] = stream
	return stream
