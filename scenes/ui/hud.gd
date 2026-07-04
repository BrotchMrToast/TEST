extends Control

const VW := 960.0
const VH := 540.0
## Overworld HUD — hero vitals, gold, and the current chapter objective.

var dio = null   # untyped: script-defined diorama shell, dynamic access


func _ready() -> void:
	position = Vector2.ZERO
	size = Vector2(VW, VH)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	dio = get_parent().get_parent()


func _process(_delta: float) -> void:
	queue_redraw()


func _draw() -> void:
	if GameState.current == "":
		return
	if dio != null and (dio.cutscene.active or dio.battle_node != null):
		return
	var c: Dictionary = GameState.ch()
	if c.is_empty():
		return
	var info := GameState.hero_info(GameState.current)
	var s := GameState.hero_stats(GameState.current)
	var font := get_theme_default_font()
	draw_rect(Rect2(10, 10, 240, 64), Color(0.03, 0.02, 0.06, 0.8))
	draw_rect(Rect2(10, 10, 240, 64), Color("8878c8"), false, 2.0)
	draw_string(font, Vector2(22, 30), "%s  Lv%d" % [String(info["name"]), int(c["level"])],
		HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color(info["color"]))
	draw_rect(Rect2(22, 38, 150, 10), Color("2a2440"))
	var hp_frac := clampf(float(c["hp"]) / maxf(1.0, float(s["hp"])), 0.0, 1.0)
	draw_rect(Rect2(22, 38, 150 * hp_frac, 10), Color("7dffa0") if hp_frac > 0.3 else Color("ff8080"))
	draw_rect(Rect2(22, 52, 90, 8), Color("2a2440"))
	var mp_frac := clampf(float(c["mp"]) / maxf(1.0, float(s["mp"])), 0.0, 1.0)
	draw_rect(Rect2(22, 52, 90 * mp_frac, 8), Color("9adcff"))
	draw_string(font, Vector2(178, 47), "%d/%d" % [int(c["hp"]), int(s["hp"])], HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color("e8e4f4"))
	draw_string(font, Vector2(178, 60), "%d %s" % [int(c["gold"]), GameState.currency()], HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color("ffd23e"))
	# objective
	var w: Dictionary = Db.world(String(c.get("world", GameState.current)))
	var chapters: Array = w.get("chapters", [])
	var chapter := int(c["chapter"])
	if chapter < chapters.size():
		var goal := "◆ " + String(chapters[chapter].get("goal", ""))
		var tw := font.get_string_size(goal, HORIZONTAL_ALIGNMENT_LEFT, -1, 13).x + 24.0
		draw_rect(Rect2(VW - tw - 10, 10, tw, 30), Color(0.03, 0.02, 0.06, 0.75))
		draw_rect(Rect2(VW - tw - 10, 10, tw, 30), Color("3a3454"), false, 1.5)
		draw_string(font, Vector2(VW - tw + 2, 30), goal, HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color("9adcff"))
