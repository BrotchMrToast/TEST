extends Control
## Shop — buy/sell overlay driven by data/shops.json.

var shop_id := ""
var mode := "buy"
var idx := 0
var msg := ""
var _open := false


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	visible = false


func visible_active() -> bool:
	return _open


func open(id: String) -> void:
	shop_id = id
	mode = "buy"
	idx = 0
	msg = ""
	_open = true
	visible = true


func close() -> void:
	_open = false
	visible = false


func _entries() -> Array:
	var c: Dictionary = GameState.ch()
	if mode == "buy":
		var out: Array = []
		for id in Db.shop(shop_id).get("items", []):
			var it := Db.item(String(id))
			if not it.is_empty():
				out.append({"id": String(id), "it": it, "n": 0})
		return out
	var sellable: Array = []
	for e in GameState.inv_list(c):
		if int(e["it"].get("price", 0)) > 0 and String(e["it"].get("type", "")) != "key":
			sellable.append(e)
	return sellable


func _process(_delta: float) -> void:
	if not _open:
		return
	queue_redraw()
	if Input.is_action_just_pressed("cancel") or Input.is_action_just_pressed("menu"):
		AudioDirector.sfx("cancel")
		close()
		return
	if Input.is_action_just_pressed("move_left") or Input.is_action_just_pressed("move_right"):
		mode = "sell" if mode == "buy" else "buy"
		idx = 0
		msg = ""
		AudioDirector.sfx("move")
	var list := _entries()
	if not list.is_empty():
		if Input.is_action_just_pressed("move_up"):
			idx = (idx + list.size() - 1) % list.size()
			AudioDirector.sfx("move")
		if Input.is_action_just_pressed("move_down"):
			idx = (idx + 1) % list.size()
			AudioDirector.sfx("move")
		idx = mini(idx, list.size() - 1)
	if Input.is_action_just_pressed("confirm") and not list.is_empty():
		var c: Dictionary = GameState.ch()
		var e: Dictionary = list[idx]
		var price := int(e["it"].get("price", 0))
		if mode == "buy":
			if int(c["gold"]) >= price:
				c["gold"] = int(c["gold"]) - price
				GameState.inv_add(c, String(e["id"]), 1)
				AudioDirector.sfx("gold")
				msg = "Bought %s." % String(e["it"]["name"])
			else:
				AudioDirector.sfx("cancel")
				msg = "Not enough %s!" % GameState.currency()
		else:
			var value := int(price / 2.0)
			GameState.inv_remove(c, String(e["id"]), 1)
			c["gold"] = int(c["gold"]) + value
			AudioDirector.sfx("gold")
			msg = "Sold %s for %d." % [String(e["it"]["name"]), value]


func _draw() -> void:
	if not _open:
		return
	var c: Dictionary = GameState.ch()
	var font := get_theme_default_font()
	draw_rect(Rect2(0, 0, size.x, size.y), Color(0.015, 0.012, 0.04, 0.7))
	var panel := Rect2(120, 50, size.x - 240, size.y - 120)
	draw_rect(panel, Color(0.04, 0.03, 0.08, 0.96))
	draw_rect(panel, Color("ffd23e"), false, 2.0)
	draw_string(font, Vector2(150, 86), String(Db.shop(shop_id).get("name", "Shop")),
		HORIZONTAL_ALIGNMENT_LEFT, -1, 19, Color("ffd23e"))
	draw_string(font, Vector2(150, 114), "< %s >      %s: %d" % [mode.to_upper(), GameState.currency(), int(c["gold"])],
		HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("9a94b8"))
	var list := _entries()
	if list.is_empty():
		draw_string(font, Vector2(150, 160), "Sold out." if mode == "buy" else "Nothing to sell.",
			HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("8a82a8"))
	for i in range(mini(list.size(), 10)):
		var e: Dictionary = list[i]
		var price := int(e["it"].get("price", 0)) if mode == "buy" else int(int(e["it"].get("price", 0)) / 2.0)
		var owned := GameState.inv_count(c, String(e["id"]))
		var name_txt := String(e["it"]["name"])
		if mode == "sell":
			name_txt += " x%d" % int(e["n"])
		elif owned > 0:
			name_txt += " (own %d)" % owned
		var col := Color("ffe98a") if i == idx else Color("e8e4f4")
		if mode == "buy" and int(c["gold"]) < price:
			col = Color("6a6288") if i != idx else Color("aa9a6a")
		draw_string(font, Vector2(150, 152 + i * 27), "%s %s" % ["> " if i == idx else "  ", name_txt],
			HORIZONTAL_ALIGNMENT_LEFT, -1, 15, col)
		draw_string(font, Vector2(size.x - 220, 152 + i * 27), str(price), HORIZONTAL_ALIGNMENT_LEFT, -1, 15, col)
	if idx < list.size():
		var it: Dictionary = list[idx]["it"]
		var stats := ""
		for stat in ["atk", "def", "spd", "hp", "crit"]:
			if it.has(stat):
				stats += "%s+%d " % [stat.to_upper(), int(it[stat])]
		draw_string(font, Vector2(150, size.y - 130), stats + ("— " + String(it.get("desc", "")) if it.has("desc") else ""),
			HORIZONTAL_ALIGNMENT_LEFT, size.x - 320, 13, Color("9a94b8"))
	if msg != "":
		draw_string(font, Vector2(150, size.y - 86), msg, HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("7dffa0"))
