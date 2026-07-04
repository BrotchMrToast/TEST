extends Control

const VW := 960.0
const VH := 540.0
## Pause menu — Status / Items / Equip / Party / Quests / System tabs.

const TABS := ["Status", "Items", "Equip", "Party", "Quests", "System"]

var tab := 0
var idx := 0
var msg := ""
var _open := false


func _ready() -> void:
	position = Vector2.ZERO
	size = Vector2(VW, VH)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	visible = false


func visible_active() -> bool:
	return _open


func open() -> void:
	_open = true
	visible = true
	tab = 0
	idx = 0
	msg = ""


func close() -> void:
	_open = false
	visible = false


func _process(_delta: float) -> void:
	if not _open:
		return
	queue_redraw()
	if Input.is_action_just_pressed("menu") or Input.is_action_just_pressed("cancel"):
		AudioDirector.sfx("cancel")
		close()
		return
	if Input.is_action_just_pressed("move_left"):
		tab = (tab + TABS.size() - 1) % TABS.size()
		idx = 0
		msg = ""
		AudioDirector.sfx("move")
	if Input.is_action_just_pressed("move_right"):
		tab = (tab + 1) % TABS.size()
		idx = 0
		msg = ""
		AudioDirector.sfx("move")
	var c: Dictionary = GameState.ch()
	var count := _list_size(c)
	if count > 0:
		if Input.is_action_just_pressed("move_up"):
			idx = (idx + count - 1) % count
			AudioDirector.sfx("move")
		if Input.is_action_just_pressed("move_down"):
			idx = (idx + 1) % count
			AudioDirector.sfx("move")
		idx = mini(idx, count - 1)
	if Input.is_action_just_pressed("confirm"):
		_activate(c)


func _list_size(c: Dictionary) -> int:
	match TABS[tab]:
		"Items":
			return _item_list(c).size()
		"Equip":
			return _equip_list(c).size()
		"Party":
			return (c["party"] as Array).size()
		"Quests":
			return maxi(1, GameState.active_quests().size())
		"System":
			return 4
	return 0


func _item_list(c: Dictionary) -> Array:
	var out: Array = []
	for e in GameState.inv_list(c):
		var t := String(e["it"].get("type", ""))
		if t == "consumable" or t == "key":
			out.append(e)
	return out


func _equip_list(c: Dictionary) -> Array:
	var out: Array = []
	for e in GameState.inv_list(c):
		var t := String(e["it"].get("type", ""))
		if t == "weapon" or t == "armor" or t == "acc":
			out.append(e)
	return out


func _activate(c: Dictionary) -> void:
	match TABS[tab]:
		"Items":
			var items := _item_list(c)
			if items.is_empty():
				return
			var e: Dictionary = items[idx]
			var it: Dictionary = e["it"]
			if String(it.get("type", "")) == "consumable":
				var s := GameState.hero_stats(GameState.current)
				if it.has("heal"):
					c["hp"] = mini(int(s["hp"]), int(c["hp"]) + int(it["heal"]))
					GameState.inv_remove(c, String(e["id"]), 1)
					AudioDirector.sfx("heal")
					msg = "Used %s." % String(it["name"])
				elif it.has("mp"):
					c["mp"] = mini(int(s["mp"]), int(c["mp"]) + int(it["mp"]))
					GameState.inv_remove(c, String(e["id"]), 1)
					AudioDirector.sfx("heal")
					msg = "Used %s." % String(it["name"])
				else:
					msg = "Only useful in battle."
			else:
				msg = String(it.get("desc", "A story item."))
		"Equip":
			var gear := _equip_list(c)
			if gear.is_empty():
				return
			var g: Dictionary = gear[idx]
			GameState.equip_item(c, String(g["id"]))
			AudioDirector.sfx("confirm")
			msg = "Equipped %s." % String(g["it"]["name"])
			var s2 := GameState.hero_stats(GameState.current)
			c["hp"] = mini(int(c["hp"]), int(s2["hp"]))
			c["mp"] = mini(int(c["mp"]), int(s2["mp"]))
		"Party":
			var party: Array = c["party"]
			if party.is_empty():
				return
			var comp_id := String(party[idx])
			party.remove_at(idx)
			msg = "%s left the party." % String(Db.companion(comp_id).get("name", comp_id))
			AudioDirector.sfx("cancel")
			var dio = get_parent().get_parent()
			if dio.world_node != null:
				dio.world_node._rebuild_followers()
		"System":
			AudioDirector.sfx("confirm")
			match idx:
				0:
					msg = "Game saved." if GameState.save_game() else "Save failed!"
				1:
					AudioDirector.set_muted(not GameState.muted)
					msg = "Music " + ("off" if GameState.muted else "on")
				2:
					msg = "Z confirm · X cancel · Esc menu · Q/E boost · Shift run"
				3:
					GameState.save_game()
					close()
					SceneRouter.go_select()


func _draw() -> void:
	if not _open:
		return
	var c: Dictionary = GameState.ch()
	var info := GameState.hero_info(GameState.current)
	var font := get_theme_default_font()
	draw_rect(Rect2(0, 0, VW, VH), Color(0.015, 0.012, 0.04, 0.8))
	var panel := Rect2(40, 30, VW - 80, VH - 60)
	draw_rect(panel, Color(0.04, 0.03, 0.08, 0.95))
	draw_rect(panel, Color(info["color"]), false, 2.0)
	for i in range(TABS.size()):
		var x := 70.0 + i * 145.0
		if i == tab:
			draw_rect(Rect2(x - 10, 44, 128, 30), Color(0.14, 0.11, 0.24))
			draw_rect(Rect2(x - 10, 44, 128, 30), Color("ffd23e"), false, 1.5)
		draw_string(font, Vector2(x, 64), TABS[i], HORIZONTAL_ALIGNMENT_LEFT, -1, 15,
			Color("ffd23e") if i == tab else Color("8a82a8"))
	draw_line(Vector2(60, 84), Vector2(VW - 60, 84), Color("3a3454"), 1.5)
	var left := 80.0
	var top := 122.0
	match TABS[tab]:
		"Status":
			var s := GameState.hero_stats(GameState.current)
			var ptex := Db.portrait_tex(String(info["sprite"]))
			if ptex != null:
				draw_texture_rect(ptex, Rect2(left, top - 10, 100, 100), false)
			draw_string(font, Vector2(left + 120, top + 14), "%s %s" % [String(info["name"]), String(info["title"])],
				HORIZONTAL_ALIGNMENT_LEFT, -1, 20, Color(info["color"]))
			var rows := [
				"Level %d   EXP %d/%d" % [int(c["level"]), int(c["exp"]), GameState.exp_for(int(c["level"]))],
				"HP %d/%d    SP %d/%d" % [int(c["hp"]), int(s["hp"]), int(c["mp"]), int(s["mp"])],
				"ATK %d   DEF %d   SPD %d   CRIT %d%%" % [int(s["atk"]), int(s["def"]), int(s["spd"]), int(s["crit"])],
				"%s: %d" % [GameState.currency(), int(c["gold"])],
				"",
				"Weapon: " + _equip_name(c, "weapon"),
				"Armor:  " + _equip_name(c, "armor"),
				"Charm:  " + _equip_name(c, "acc"),
			]
			for i in range(rows.size()):
				draw_string(font, Vector2(left + 120, top + 44 + i * 24), rows[i], HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("e8e4f4"))
			var party: Array = c["party"]
			for i in range(party.size()):
				var comp := Db.companion(String(party[i]))
				var cs := GameState.comp_stats(String(party[i]), int(c["level"]))
				var cy := top + 130 + i * 110
				var ctex := Db.portrait_tex(String(comp.get("sprite", "")))
				if ctex != null:
					draw_texture_rect(ctex, Rect2(left, cy, 70, 70), false)
				draw_string(font, Vector2(left + 84, cy + 24), "%s — %s" % [String(comp["name"]), String(comp["type"])],
					HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("cfc8e8"))
				draw_string(font, Vector2(left + 84, cy + 48), "HP %d  ATK %d  DEF %d  SPD %d" % [int(cs["hp"]), int(cs["atk"]), int(cs["def"]), int(cs["spd"])],
					HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("9a94b8"))
		"Items":
			var items := _item_list(c)
			if items.is_empty():
				draw_string(font, Vector2(left, top), "Empty pockets.", HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("8a82a8"))
			for i in range(mini(items.size(), 13)):
				var e: Dictionary = items[i]
				var col := Color("ffe98a") if i == idx else (Color("c86bff") if String(e["it"].get("type", "")) == "key" else Color("e8e4f4"))
				draw_string(font, Vector2(left, top + i * 26), "%s %s x%d" % ["> " if i == idx else "  ", String(e["it"]["name"]), int(e["n"])],
					HORIZONTAL_ALIGNMENT_LEFT, -1, 15, col)
			if idx < items.size():
				draw_string(font, Vector2(left, VH - 100), String(items[idx]["it"].get("desc", "")),
					HORIZONTAL_ALIGNMENT_LEFT, VW - 200, 13, Color("9a94b8"))
		"Equip":
			var gear := _equip_list(c)
			draw_string(font, Vector2(left, top - 14), "Confirm to equip. Current gear returns to the bag.",
				HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color("9a94b8"))
			if gear.is_empty():
				draw_string(font, Vector2(left, top + 16), "Nothing to equip.", HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("8a82a8"))
			for i in range(mini(gear.size(), 12)):
				var e2: Dictionary = gear[i]
				var it2: Dictionary = e2["it"]
				var stats := ""
				for stat in ["atk", "def", "spd", "hp", "crit"]:
					if it2.has(stat):
						stats += "%s+%d " % [stat.to_upper(), int(it2[stat])]
				draw_string(font, Vector2(left, top + 16 + i * 26),
					"%s [%s] %s x%d  %s" % ["> " if i == idx else "  ", String(it2["type"]), String(it2["name"]), int(e2["n"]), stats],
					HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("ffe98a") if i == idx else Color("e8e4f4"))
		"Party":
			var party2: Array = c["party"]
			draw_string(font, Vector2(left, top - 14), "Companions: %d/2 — confirm to dismiss. Hire in towns." % party2.size(),
				HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color("9a94b8"))
			if party2.is_empty():
				draw_string(font, Vector2(left, top + 20), "You travel alone.", HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("8a82a8"))
			for i in range(party2.size()):
				var comp2 := Db.companion(String(party2[i]))
				var cy2 := top + 20 + i * 120
				var ptex2 := Db.portrait_tex(String(comp2.get("sprite", "")))
				if ptex2 != null:
					draw_texture_rect(ptex2, Rect2(left, cy2, 80, 80), false)
				draw_string(font, Vector2(left + 100, cy2 + 26), "%s%s  (%s)" % ["> " if i == idx else "", String(comp2["name"]), String(comp2["type"])],
					HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("ffe98a") if i == idx else Color("e8e4f4"))
				draw_string(font, Vector2(left + 100, cy2 + 52), String(comp2.get("bio", "")),
					HORIZONTAL_ALIGNMENT_LEFT, 520, 13, Color("9a94b8"))
		"Quests":
			var w := Db.world(String(c.get("world", GameState.current)))
			var chapters: Array = w.get("chapters", [])
			if int(c["chapter"]) < chapters.size():
				draw_string(font, Vector2(left, top), "◆ MAIN: " + String(chapters[int(c["chapter"])].get("goal", "")),
					HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("ffd23e"))
			var qs := GameState.active_quests()
			if qs.is_empty():
				draw_string(font, Vector2(left, top + 40), "No side quests active. Talk to people.",
					HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("8a82a8"))
			for i in range(qs.size()):
				var q := Db.quest(String(qs[i]))
				draw_string(font, Vector2(left, top + 44 + i * 52), "○ " + String(q["name"]),
					HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("ffe98a") if i == idx else Color("9adcff"))
				draw_string(font, Vector2(left, top + 66 + i * 52), "   " + GameState.quest_progress(String(qs[i])),
					HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("9a94b8"))
		"System":
			var opts := ["Save Game", "Music: " + ("OFF" if GameState.muted else "ON"), "Controls", "Return to Character Select"]
			for i in range(opts.size()):
				draw_string(font, Vector2(left, top + i * 30), "%s %s" % ["> " if i == idx else "  ", opts[i]],
					HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("ffe98a") if i == idx else Color("e8e4f4"))
	if msg != "":
		draw_string(font, Vector2(left, VH - 70), msg, HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("7dffa0"))


func _equip_name(c: Dictionary, slot: String) -> String:
	var id := String(c["equip"].get(slot, ""))
	if id == "":
		return "—"
	return String(Db.item(id).get("name", id))
