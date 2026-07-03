extends Node
## GameState — per-timeline hero profiles, flags, inventory/equipment,
## stats & leveling, quest state, save/load to user://.

const SAVE_PATH := "user://trinity_rift_save.json"

const HERO_BASE := {
	"samurai": {"hp": 95, "mp": 24, "atk": 12, "def": 7, "spd": 9, "ghp": 14, "gmp": 3.0, "gatk": 2.4, "gdef": 1.5, "gspd": 0.8},
	"business": {"hp": 105, "mp": 28, "atk": 10, "def": 8, "spd": 8, "ghp": 15, "gmp": 3.4, "gatk": 2.1, "gdef": 1.7, "gspd": 0.7},
	"cyber": {"hp": 88, "mp": 30, "atk": 13, "def": 6, "spd": 11, "ghp": 13, "gmp": 3.6, "gatk": 2.5, "gdef": 1.3, "gspd": 1.0},
	"divine": {"hp": 600, "mp": 120, "atk": 60, "def": 34, "spd": 16, "ghp": 0, "gmp": 0.0, "gatk": 0.0, "gdef": 0.0, "gspd": 0.0},
}
const COMP_BASE := {
	"brute": {"hp": 1.25, "mp": 0.6, "atk": 1.15, "def": 1.2, "spd": 0.7},
	"tactician": {"hp": 0.85, "mp": 1.4, "atk": 0.8, "def": 0.9, "spd": 1.0},
	"thief": {"hp": 0.8, "mp": 0.9, "atk": 1.0, "def": 0.7, "spd": 1.5},
	"gambler": {"hp": 0.9, "mp": 1.0, "atk": 1.05, "def": 0.8, "spd": 1.1},
	"tech": {"hp": 0.8, "mp": 1.5, "atk": 0.75, "def": 0.85, "spd": 0.95},
}
const HERO_INFO := {
	"samurai": {"name": "Kenji", "title": "the Broken Blade", "sprite": "kenji", "color": Color("c43a3a")},
	"business": {"name": "Daiki", "title": "the Caged Suit", "sprite": "daiki", "color": Color("3a7bc4")},
	"cyber": {"name": "Vex", "title": "the Unchained Gun", "sprite": "vex", "color": Color("b229c9")},
	"divine": {"name": "Tokihito", "title": "the Timeless One", "sprite": "divine", "color": Color("ffe98a")},
}

var current: String = ""            # samurai | business | cyber | convergence
var chars: Dictionary = {}          # per-timeline profiles
var convergence: Dictionary = {}
var muted := false


func _ready() -> void:
	reset_all()
	load_game()


func reset_all() -> void:
	chars = {
		"samurai": new_char("samurai"),
		"business": new_char("business"),
		"cyber": new_char("cyber"),
	}
	convergence = new_char("convergence")
	convergence["unlocked"] = false
	convergence["done"] = false
	current = ""


func new_char(world: String) -> Dictionary:
	return {
		"world": world, "started": false, "chapter": 0, "rift_reached": false,
		"level": 1, "exp": 0, "gold": 120, "hp": 0, "mp": 0,
		"inv": {}, "equip": {"weapon": "", "armor": "", "acc": ""},
		"party": [], "flags": {}, "quests": {}, "kills": {},
		"map": "", "x": 0.0, "y": 0.0,
		"checkpoint": {},
	}


func ch() -> Dictionary:
	if current == "convergence":
		return convergence
	return chars.get(current, {})


func hero_world(key: String) -> String:
	return "divine" if key == "convergence" else key


func hero_info(key: String) -> Dictionary:
	return HERO_INFO[hero_world(key)]


# ---------- stats & leveling ----------
func exp_for(level: int) -> int:
	return int(55.0 * pow(float(level), 1.85))


func hero_stats(key: String) -> Dictionary:
	var c: Dictionary = convergence if key == "convergence" else chars[key]
	var b: Dictionary = HERO_BASE[hero_world(key)]
	var lv: int = int(c["level"]) - 1
	var s := {
		"hp": int(b["hp"] + b["ghp"] * lv), "mp": int(b["mp"] + b["gmp"] * lv),
		"atk": int(b["atk"] + b["gatk"] * lv), "def": int(b["def"] + b["gdef"] * lv),
		"spd": int(b["spd"] + b["gspd"] * lv), "crit": 6,
	}
	for slot in ["weapon", "armor", "acc"]:
		var id: String = c["equip"].get(slot, "")
		if id == "":
			continue
		var it: Dictionary = Db.item(id)
		for stat in ["atk", "def", "spd", "hp", "crit"]:
			if it.has(stat):
				s[stat] = int(s[stat]) + int(it[stat])
	return s


func comp_stats(comp_id: String, hero_level: int) -> Dictionary:
	var comp: Dictionary = Db.companion(comp_id)
	var m: Dictionary = COMP_BASE[comp.get("type", "brute")]
	var lv := hero_level - 1
	return {
		"hp": int((80 + 12 * lv) * m["hp"]), "mp": int((22 + 3 * lv) * m["mp"]),
		"atk": int((10 + 2.1 * lv) * m["atk"]), "def": int((7 + 1.4 * lv) * m["def"]),
		"spd": int((9 + 0.8 * lv) * m["spd"]),
		"crit": 14 if comp.get("type", "") == "thief" else 6,
	}


## Returns true if a level-up happened (restores hp/mp fully).
func gain_exp(key: String, amount: int) -> bool:
	var c: Dictionary = convergence if key == "convergence" else chars[key]
	c["exp"] = int(c["exp"]) + amount
	var leveled := false
	while int(c["exp"]) >= exp_for(int(c["level"])):
		c["exp"] = int(c["exp"]) - exp_for(int(c["level"]))
		c["level"] = int(c["level"]) + 1
		leveled = true
	if leveled:
		var s := hero_stats(key)
		c["hp"] = s["hp"]
		c["mp"] = s["mp"]
	return leveled


# ---------- inventory / equipment ----------
func inv_add(c: Dictionary, id: String, n: int = 1) -> void:
	c["inv"][id] = int(c["inv"].get(id, 0)) + n


func inv_remove(c: Dictionary, id: String, n: int = 1) -> bool:
	if int(c["inv"].get(id, 0)) < n:
		return false
	c["inv"][id] = int(c["inv"][id]) - n
	if int(c["inv"][id]) <= 0:
		c["inv"].erase(id)
	return true


func inv_count(c: Dictionary, id: String) -> int:
	return int(c["inv"].get(id, 0))


func inv_list(c: Dictionary, type_filter: String = "") -> Array:
	var out: Array = []
	for id in c["inv"].keys():
		var it: Dictionary = Db.item(id)
		if it.is_empty():
			continue
		if type_filter != "" and it.get("type", "") != type_filter:
			continue
		out.append({"id": id, "n": int(c["inv"][id]), "it": it})
	out.sort_custom(func(a, b): return String(a["id"]) < String(b["id"]))
	return out


func equip_item(c: Dictionary, id: String) -> void:
	var it: Dictionary = Db.item(id)
	if it.is_empty():
		return
	var slot: String = "weapon"
	if it.get("type", "") == "armor":
		slot = "armor"
	elif it.get("type", "") == "acc":
		slot = "acc"
	var prev: String = c["equip"].get(slot, "")
	if prev != "":
		inv_add(c, prev, 1)
	c["equip"][slot] = id
	inv_remove(c, id, 1)


# ---------- quests ----------
func quest_state(c: Dictionary, id: String) -> Dictionary:
	return c["quests"].get(id, {})


func start_quest(id: String) -> void:
	var c := ch()
	if c["quests"].has(id):
		return
	c["quests"][id] = {"stage": 0, "count": 0, "done": false}


func quest_ready(id: String) -> bool:
	var c := ch()
	var q := Db.quest(id)
	var st: Dictionary = c["quests"].get(id, {})
	if q.is_empty() or st.is_empty() or bool(st.get("done", false)):
		return false
	return int(st["stage"]) >= (q["stages"] as Array).size()


func check_quest_stage(id: String) -> void:
	var c := ch()
	var q := Db.quest(id)
	var st: Dictionary = c["quests"].get(id, {})
	if q.is_empty() or st.is_empty() or bool(st.get("done", false)):
		return
	var stages: Array = q["stages"]
	if int(st["stage"]) >= stages.size():
		return
	var stg: Dictionary = stages[int(st["stage"])]
	var ok := false
	match String(stg.get("type", "")):
		"kill":
			ok = int(st["count"]) >= int(stg["n"])
		"item":
			ok = inv_count(c, String(stg["target"])) >= int(stg["n"])
		"flag":
			ok = c["flags"].has(String(stg["target"]))
	if ok:
		st["stage"] = int(st["stage"]) + 1
		st["count"] = 0


func turn_in_quest(id: String) -> Dictionary:
	var c := ch()
	if not quest_ready(id):
		return {}
	var q := Db.quest(id)
	c["quests"][id]["done"] = true
	var r: Dictionary = q.get("reward", {})
	c["gold"] = int(c["gold"]) + int(r.get("gold", 0))
	for entry in r.get("items", []):
		inv_add(c, String(entry["id"]), int(entry.get("n", 1)))
	for stg in q["stages"]:
		if String(stg.get("type", "")) == "item":
			inv_remove(c, String(stg["target"]), int(stg["n"]))
	if r.has("exp"):
		gain_exp(current, int(r["exp"]))
	return r


func notify_kill(enemy_id: String) -> void:
	var c := ch()
	c["kills"][enemy_id] = int(c["kills"].get(enemy_id, 0)) + 1
	for id in c["quests"].keys():
		var q := Db.quest(id)
		var st: Dictionary = c["quests"][id]
		if q.is_empty() or bool(st.get("done", false)):
			continue
		var stages: Array = q["stages"]
		if int(st["stage"]) >= stages.size():
			continue
		var stg: Dictionary = stages[int(st["stage"])]
		if String(stg.get("type", "")) == "kill" and String(stg["target"]) == enemy_id:
			st["count"] = int(st["count"]) + 1
			check_quest_stage(id)


func active_quests() -> Array:
	var c := ch()
	var out: Array = []
	for id in c["quests"].keys():
		if not bool(c["quests"][id].get("done", false)) and not Db.quest(id).is_empty():
			out.append(id)
	return out


func quest_progress(id: String) -> String:
	var c := ch()
	var q := Db.quest(id)
	var st: Dictionary = c["quests"].get(id, {})
	if q.is_empty() or st.is_empty():
		return ""
	if bool(st.get("done", false)):
		return "Complete"
	var stages: Array = q["stages"]
	if int(st["stage"]) >= stages.size():
		return "Return to " + String(q.get("giver", "the quest giver"))
	var stg: Dictionary = stages[int(st["stage"])]
	var extra := ""
	if String(stg.get("type", "")) == "kill":
		extra = " (%d/%d)" % [int(st["count"]), int(stg["n"])]
	elif String(stg.get("type", "")) == "item":
		extra = " (%d/%d)" % [inv_count(c, String(stg["target"])), int(stg["n"])]
	return String(stg.get("text", "")) + extra


# ---------- convergence gate ----------
func maybe_unlock_convergence() -> void:
	if bool(convergence.get("unlocked", false)):
		return
	for k in ["samurai", "business", "cyber"]:
		if not bool(chars[k]["rift_reached"]):
			return
	convergence["unlocked"] = true
	save_game()


func currency() -> String:
	match current:
		"samurai":
			return "mon"
		"business":
			return "yen-k"
		"cyber":
			return "eddies"
	return "shards"


# ---------- save / load ----------
func save_game() -> bool:
	var data := {
		"current": current, "chars": chars, "convergence": convergence, "muted": muted,
	}
	var f := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if f == null:
		return false
	f.store_string(JSON.stringify(data))
	return true


func load_game() -> bool:
	if not FileAccess.file_exists(SAVE_PATH):
		return false
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(SAVE_PATH))
	if parsed == null or not (parsed is Dictionary):
		return false
	var data: Dictionary = parsed
	for k in ["samurai", "business", "cyber"]:
		if data.get("chars", {}).has(k):
			var merged := new_char(k)
			merged.merge(data["chars"][k], true)
			chars[k] = merged
	if data.has("convergence"):
		var merged_c := new_char("convergence")
		merged_c.merge(data["convergence"], true)
		convergence = merged_c
	muted = bool(data.get("muted", false))
	return true


func wipe_save() -> void:
	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(SAVE_PATH))
	reset_all()
