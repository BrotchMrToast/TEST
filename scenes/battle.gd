extends Node2D
## Battle — real-time round-based (ATB "active" mode) combat with Boost Points.
## opts: {enemies:[ids], bg, boss, music, scripted, stop_at, party, on_win}

const ALLY_POS := [Vector2(720, 320), Vector2(790, 400), Vector2(650, 410)]
const FOE_POS_SINGLE := [Vector2(240, 360)]
const FOE_POS := [Vector2(210, 320), Vector2(290, 400), Vector2(150, 410), Vector2(330, 300)]

const HERO_SKILLS := {
	"samurai": [
		{"lv": 1, "name": "Crimson Slash", "mp": 6, "pow": 1.6, "type": "attack", "status": "bleed", "sfx": "slash", "desc": "Heavy cut that leaves foes bleeding"},
		{"lv": 4, "name": "Iaijutsu", "mp": 10, "pow": 2.1, "type": "attack", "crit": 35, "sfx": "slash", "desc": "One breath. One draw. High crit"},
		{"lv": 8, "name": "Whirlwind Cut", "mp": 15, "pow": 1.1, "type": "aoe", "sfx": "slash", "desc": "Strike every enemy"},
	],
	"business": [
		{"lv": 1, "name": "Hostile Takeover", "mp": 6, "pow": 1.4, "type": "attack", "status": "atkDn", "sfx": "hit", "desc": "Strike that saps enemy attack"},
		{"lv": 4, "name": "Expense Account", "mp": 10, "pow": 0.35, "type": "healself", "sfx": "heal", "desc": "Recover 35% HP. It is deductible"},
		{"lv": 8, "name": "Severance Package", "mp": 15, "pow": 1.1, "type": "aoe", "sfx": "gun", "desc": "Everyone gets a pink slip"},
	],
	"cyber": [
		{"lv": 1, "name": "Burst Fire", "mp": 6, "pow": 0.65, "hits": 3, "type": "attack", "sfx": "gun", "desc": "Three rounds, center mass"},
		{"lv": 4, "name": "EMP Round", "mp": 10, "pow": 1.4, "type": "attack", "status": "stun", "sfx": "laser", "desc": "Damage + chance to stun"},
		{"lv": 8, "name": "Railstorm", "mp": 22, "pow": 1.5, "type": "aoe", "sfx": "laser", "desc": "Saturation fire on all enemies"},
	],
	"divine": [
		{"lv": 1, "name": "Blade of Eras", "mp": 12, "pow": 2.2, "type": "attack", "sfx": "slash", "desc": "Three lifetimes in one stroke"},
		{"lv": 1, "name": "Sundering Light", "mp": 24, "pow": 1.6, "type": "aoe", "sfx": "laser", "desc": "Burn away the dark, everywhere"},
		{"lv": 1, "name": "Restore Timeline", "mp": 20, "pow": 0.5, "type": "healself", "sfx": "heal", "desc": "Rewind your wounds. 50% HP"},
		{"lv": 1, "name": "Zenith", "mp": 45, "pow": 4.2, "type": "attack", "sfx": "explode", "desc": "The hour of the god of hours"},
	],
}
const COMP_SKILLS := {
	"brute": [
		{"name": "Crush", "mp": 8, "pow": 2.0, "type": "attack", "sfx": "crit", "desc": "A very simple plan, executed hard"},
		{"name": "War Roar", "mp": 6, "type": "taunt", "sfx": "boost", "desc": "Taunt enemies, raise own DEF"},
	],
	"tactician": [
		{"name": "Analyze", "mp": 5, "type": "debuff", "status": "defDn", "sfx": "confirm", "desc": "Expose a weakness: lower enemy DEF"},
		{"name": "Rally", "mp": 10, "type": "partybuff", "sfx": "boost", "desc": "Raise party ATK"},
	],
	"thief": [
		{"name": "Backstab", "mp": 7, "pow": 1.7, "crit": 30, "type": "attack", "sfx": "slash", "desc": "Strike from a place of dishonesty"},
		{"name": "Pickpocket", "mp": 4, "type": "steal", "sfx": "gold", "desc": "Steal gold mid-fight"},
	],
	"gambler": [
		{"name": "Dice Roll", "mp": 6, "type": "gamble", "sfx": "hit", "desc": "Damage x0.2 to x3.5. Feeling lucky?"},
		{"name": "All In", "mp": 12, "pow": 3.2, "type": "allin", "sfx": "crit", "desc": "Huge damage, 30% self-burn"},
	],
	"tech": [
		{"name": "Repair Drone", "mp": 10, "pow": 0.35, "type": "heal", "sfx": "heal", "desc": "Heal an ally for 35%"},
		{"name": "Shock Grid", "mp": 14, "pow": 1.0, "type": "aoe", "status": "stun", "sfx": "laser", "desc": "AoE with stun chance"},
	],
}

var diorama: Node3D
var opts: Dictionary = {}
var allies: Array = []
var foes: Array = []
var state := "intro"
var t := 0.0
var intro_t := 0.0
var win_t := 0.0
var lose_t := 0.0
var hit_stop := 0.0
var popups: Array = []
var sparks: Array = []
var barks: Array = []
var reward_exp := 0
var reward_gold := 0
var reward_items: Array = []
var is_boss := false
var scripted_stop := false
var menu: Dictionary = {}
var anim: Dictionary = {}
var leveled := false


func _ready() -> void:
	var bg := Sprite2D.new()
	bg.texture = Db.backdrop_tex(String(opts.get("bg", "rift")))
	bg.centered = false
	bg.z_index = -10
	add_child(bg)
	_build_party()
	_build_foes()
	is_boss = bool(opts.get("boss", false))
	for f in foes:
		if bool(f.get("boss", false)):
			is_boss = true
	state = "intro"
	var talker := _first_companion()
	if not talker.is_empty() and randf() < 0.7:
		_comp_bark(talker, "battle")


func _build_party() -> void:
	var key := GameState.current
	if opts.has("party"):
		key = String(opts["party"])
		var u := _mk_hero_unit(key, false)
		allies.append(u)
	else:
		allies.append(_mk_hero_unit(key, true))
		var c: Dictionary = GameState.ch()
		for comp_id in c.get("party", []):
			allies.append(_mk_comp_unit(String(comp_id)))
	for i in range(allies.size()):
		_place(allies[i], ALLY_POS[i], true)


func _mk_hero_unit(key: String, is_active_hero: bool) -> Dictionary:
	var c: Dictionary = GameState.convergence if key == "convergence" else GameState.chars[key]
	var world := GameState.hero_world(key)
	var info: Dictionary = GameState.HERO_INFO[world]
	var s := GameState.hero_stats(key)
	var hp := int(c["hp"]) if is_active_hero else int(s["hp"])
	if hp <= 0:
		hp = int(s["hp"])
	var skills: Array = []
	for sk in HERO_SKILLS.get(world, []):
		if int(c["level"]) >= int(sk.get("lv", 1)):
			skills.append(sk)
	return {
		"name": String(info["name"]), "sprite": String(info["sprite"]), "is_hero": is_active_hero,
		"side": "ally", "world": world, "scale": 3.0,
		"maxhp": int(s["hp"]), "hp": mini(hp, int(s["hp"])), "maxmp": int(s["mp"]),
		"mp": mini(int(c["mp"]) if is_active_hero else int(s["mp"]), int(s["mp"])),
		"atk": int(s["atk"]), "def": int(s["def"]), "spd": int(s["spd"]), "crit": int(s["crit"]),
		"skills": skills, "atb": 0.3 + randf() * 0.3, "bp": 1, "statuses": {},
		"color": Color(info["color"]),
	}


func _mk_comp_unit(comp_id: String) -> Dictionary:
	var comp := Db.companion(comp_id)
	var s := GameState.comp_stats(comp_id, int(GameState.ch()["level"]))
	return {
		"name": String(comp["name"]), "sprite": String(comp.get("sprite", "goro")), "comp_id": comp_id,
		"type": String(comp["type"]), "side": "ally", "scale": 3.0,
		"maxhp": int(s["hp"]), "hp": int(s["hp"]), "maxmp": int(s["mp"]), "mp": int(s["mp"]),
		"atk": int(s["atk"]), "def": int(s["def"]), "spd": int(s["spd"]), "crit": int(s["crit"]),
		"skills": COMP_SKILLS.get(String(comp["type"]), []),
		"atb": randf() * 0.4, "bp": 1, "statuses": {}, "color": Color("b8b0d0"),
	}


func _build_foes() -> void:
	var ids: Array = opts.get("enemies", [])
	var positions := FOE_POS_SINGLE if ids.size() == 1 else FOE_POS
	for i in range(ids.size()):
		var id := String(ids[i])
		var d := Db.enemy(id)
		if d.is_empty():
			push_error("Battle: missing enemy " + id)
			continue
		var u := {
			"name": String(d["name"]), "sprite": String(d.get("sprite", id)), "enemy_id": id,
			"side": "foe", "boss": bool(d.get("boss", false)), "scale": float(d.get("scale", 3.0)),
			"maxhp": int(d["hp"]), "hp": int(d["hp"]), "maxmp": 99, "mp": 99,
			"atk": int(d["atk"]), "def": int(d["def"]), "spd": int(d["spd"]), "crit": 5,
			"ai": d.get("skills", [{"name": "Attack", "pow": 1.0, "type": "attack", "w": 1}]),
			"exp": int(d.get("exp", 0)), "gold": int(d.get("gold", 0)), "drops": d.get("drops", []),
			"atb": randf() * 0.5, "bp": 0, "statuses": {}, "color": Color("ff6a6a"),
			"barks": d.get("barks", {}),
		}
		_place(u, positions[i % positions.size()], false)
		foes.append(u)


func _place(u: Dictionary, pos: Vector2, face_left: bool) -> void:
	u["home"] = pos
	var spr := Sprite2D.new()
	SpriteUtil.apply_frame(spr, String(u["sprite"]), 0, "side")
	spr.flip_h = face_left
	spr.scale = Vector2(float(u["scale"]) / 2.0, float(u["scale"]) / 2.0)
	spr.position = pos
	add_child(spr)
	u["node"] = spr


func alive(list: Array) -> Array:
	var out: Array = []
	for u in list:
		if int(u["hp"]) > 0 and not bool(u.get("dead", false)) and float(u.get("dying", 0.0)) <= 0.0:
			out.append(u)
	return out


# ================= flow =================
func _process(delta: float) -> void:
	t += delta
	queue_redraw()
	if hit_stop > 0.0:
		hit_stop -= delta
		return
	_tick_fx(delta)
	_tick_units(delta)
	match state:
		"intro":
			intro_t += delta
			if intro_t > 0.7:
				state = "flow"
		"win":
			win_t += delta
			if win_t > 1.0 and Input.is_action_just_pressed("confirm"):
				_finish_win()
		"fled":
			win_t += delta
			if win_t > 0.6:
				diorama.end_battle("fled")
		"lose":
			lose_t += delta
			if lose_t > 1.6:
				_finish_lose()
		"anim":
			_tick_anim(delta)
		"menu", "flow":
			_tick_atb(delta)
			if state == "menu":
				_tick_menu()
			else:
				var ready_foe := _first_ready(foes)
				if not ready_foe.is_empty():
					_foe_act(ready_foe)
					return
				var ready_ally := _first_ready(allies)
				if not ready_ally.is_empty():
					_open_menu(ready_ally)


func _first_ready(list: Array) -> Dictionary:
	for u in alive(list):
		if float(u["atb"]) >= 1.0:
			return u
	return {}


func _tick_atb(delta: float) -> void:
	for u in alive(allies) + alive(foes):
		if state == "menu" and not menu.is_empty() and menu.get("unit") == u:
			continue
		var haste := 1.5 if u["statuses"].has("haste") else 1.0
		u["atb"] = minf(1.0, float(u["atb"]) + delta * (float(u["spd"]) + 18.0) / 110.0 * haste)


func _tick_units(delta: float) -> void:
	for u in allies + foes:
		if float(u.get("hurt_t", 0.0)) > 0.0:
			u["hurt_t"] = float(u["hurt_t"]) - delta
		if float(u.get("dying", 0.0)) > 0.0:
			u["dying"] = float(u["dying"]) - delta * (0.4 if bool(u.get("boss", false)) else 1.0)
			var node: Sprite2D = u["node"]
			node.modulate.a = clampf(float(u["dying"]) / 0.6, 0.0, 1.0)
			if float(u["dying"]) <= 0.0:
				u["dead"] = true
				node.visible = false
		else:
			var node2: Sprite2D = u["node"]
			var flick: bool = float(u.get("hurt_t", 0.0)) > 0.0 and int(t * 30.0) % 2 == 0
			node2.modulate.a = 0.4 if flick else 1.0
			var frame := 1 if (not anim.is_empty() and anim.get("actor") == u and int(anim.get("phase", 0)) < 2) else (int(t * 3.0 + u["home"].x) % 2)
			SpriteUtil.apply_frame(node2, String(u["sprite"]), frame, "side")
			node2.flip_h = u["side"] == "ally"
			node2.position.y = u["home"].y + sin(t * 2.2 + u["home"].x * 0.1) * 3.0
			if anim.is_empty() or anim.get("actor") != u:
				node2.position.x = u["home"].x


func _tick_fx(delta: float) -> void:
	var keep: Array = []
	for p in popups:
		p["t"] = float(p["t"]) + delta
		if float(p["t"]) < 1.0:
			keep.append(p)
	popups = keep
	var keep2: Array = []
	for s in sparks:
		s["t"] = float(s["t"]) + delta
		s["pos"] += s["vel"] * delta
		s["vel"] = Vector2(s["vel"]) + Vector2(0, 400) * delta
		if float(s["t"]) < float(s["life"]):
			keep2.append(s)
	sparks = keep2
	var keep3: Array = []
	for b in barks:
		b["t"] = float(b["t"]) + delta
		if float(b["t"]) < 2.8:
			keep3.append(b)
	barks = keep3


# ================= actions =================
func _open_menu(unit: Dictionary) -> void:
	menu = {"unit": unit, "mode": "root", "idx": 0, "boost": 0, "target_idx": 0, "pending": {}, "items": []}
	state = "menu"


func _root_items(u: Dictionary) -> Array:
	var out := [{"k": "attack", "label": "Attack"}, {"k": "skill", "label": "Ability" if u.has("comp_id") else "Skill"},
		{"k": "item", "label": "Item"}, {"k": "defend", "label": "Defend"}]
	if not bool(opts.get("scripted", false)) and not is_boss:
		out.append({"k": "flee", "label": "Flee"})
	return out


func _tick_menu() -> void:
	var u: Dictionary = menu["unit"]
	if int(u["hp"]) <= 0:
		menu = {}
		state = "flow"
		return
	if Input.is_action_just_pressed("boost_up") and int(menu["boost"]) < mini(3, int(u["bp"])):
		menu["boost"] = int(menu["boost"]) + 1
		AudioDirector.sfx("boost")
	if Input.is_action_just_pressed("boost_dn") and int(menu["boost"]) > 0:
		menu["boost"] = int(menu["boost"]) - 1
		AudioDirector.sfx("cancel")
	var mode := String(menu["mode"])
	if mode == "root":
		var items := _root_items(u)
		_nav(items.size())
		if Input.is_action_just_pressed("confirm"):
			AudioDirector.sfx("confirm")
			match String(items[int(menu["idx"])]["k"]):
				"attack":
					menu["pending"] = {"kind": "attack"}
					menu["mode"] = "target"
					menu["targets"] = alive(foes)
					menu["target_idx"] = 0
				"defend":
					_commit({"kind": "defend"})
				"flee":
					_commit({"kind": "flee"})
				"skill":
					menu["mode"] = "skill"
					menu["idx"] = 0
				"item":
					menu["items"] = _usable_items()
					if (menu["items"] as Array).is_empty():
						SceneRouter.toast("No usable items!", Color("ff8080"))
					else:
						menu["mode"] = "item"
						menu["idx"] = 0
	elif mode == "skill":
		var sks: Array = u.get("skills", [])
		if sks.is_empty():
			menu["mode"] = "root"
			return
		_nav(sks.size())
		if Input.is_action_just_pressed("cancel"):
			menu["mode"] = "root"
			menu["idx"] = 0
			AudioDirector.sfx("cancel")
			return
		if Input.is_action_just_pressed("confirm"):
			var sk: Dictionary = sks[int(menu["idx"])]
			if int(u["mp"]) < int(sk.get("mp", 0)):
				AudioDirector.sfx("cancel")
				SceneRouter.toast("Not enough SP!", Color("ff8080"))
				return
			AudioDirector.sfx("confirm")
			var sk_type := String(sk.get("type", "attack"))
			if sk_type == "heal":
				menu["pending"] = {"kind": "skill", "skill": sk}
				menu["mode"] = "target"
				menu["targets"] = alive(allies)
				menu["target_idx"] = 0
			elif sk_type in ["healself", "buffself", "taunt", "partybuff", "aoe"]:
				_commit({"kind": "skill", "skill": sk})
			else:
				menu["pending"] = {"kind": "skill", "skill": sk}
				menu["mode"] = "target"
				menu["targets"] = alive(foes)
				menu["target_idx"] = 0
	elif mode == "item":
		var items2: Array = menu["items"]
		_nav(items2.size())
		if Input.is_action_just_pressed("cancel"):
			menu["mode"] = "root"
			menu["idx"] = 0
			AudioDirector.sfx("cancel")
			return
		if Input.is_action_just_pressed("confirm"):
			AudioDirector.sfx("confirm")
			menu["pending"] = {"kind": "item", "item": String(items2[int(menu["idx"])]["id"])}
			menu["mode"] = "target"
			menu["targets"] = allies.filter(func(a): return float(a.get("dying", 0.0)) <= 0.0)
			menu["target_idx"] = 0
	elif mode == "target":
		var ts: Array = menu.get("targets", [])
		ts = ts.filter(func(x): return int(x["hp"]) > 0 or _is_revive_pending())
		if ts.is_empty():
			menu["mode"] = "root"
			return
		if Input.is_action_just_pressed("move_left") or Input.is_action_just_pressed("move_up"):
			menu["target_idx"] = (int(menu["target_idx"]) + ts.size() - 1) % ts.size()
			AudioDirector.sfx("move")
		if Input.is_action_just_pressed("move_right") or Input.is_action_just_pressed("move_down"):
			menu["target_idx"] = (int(menu["target_idx"]) + 1) % ts.size()
			AudioDirector.sfx("move")
		menu["target_idx"] = mini(int(menu["target_idx"]), ts.size() - 1)
		if Input.is_action_just_pressed("cancel"):
			menu["mode"] = "root"
			AudioDirector.sfx("cancel")
			return
		if Input.is_action_just_pressed("confirm"):
			AudioDirector.sfx("confirm")
			var action: Dictionary = (menu["pending"] as Dictionary).duplicate()
			action["target"] = ts[int(menu["target_idx"])]
			_commit(action)


func _is_revive_pending() -> bool:
	var pending: Dictionary = menu.get("pending", {})
	if String(pending.get("kind", "")) != "item":
		return false
	return Db.item(String(pending.get("item", ""))).has("revive")


func _usable_items() -> Array:
	var out: Array = []
	for e in GameState.inv_list(GameState.ch(), "consumable"):
		out.append(e)
	return out


func _nav(count: int) -> void:
	if count <= 0:
		return
	if Input.is_action_just_pressed("move_up"):
		menu["idx"] = (int(menu["idx"]) + count - 1) % count
		AudioDirector.sfx("move")
	if Input.is_action_just_pressed("move_down"):
		menu["idx"] = (int(menu["idx"]) + 1) % count
		AudioDirector.sfx("move")
	menu["idx"] = mini(int(menu["idx"]), count - 1)


func _commit(action: Dictionary) -> void:
	action["actor"] = menu["unit"]
	action["boost"] = int(menu["boost"]) if String(action.get("kind", "")) in ["attack", "skill"] else 0
	menu = {}
	_execute(action)


func _foe_act(foe: Dictionary) -> void:
	var pool: Array = foe["ai"]
	var total := 0.0
	for s in pool:
		total += float(s.get("w", 1))
	var r := randf() * total
	var pick: Dictionary = pool[0]
	for s in pool:
		r -= float(s.get("w", 1))
		if r <= 0.0:
			pick = s
			break
	if bool(foe.get("boss", false)) and float(foe["hp"]) / float(foe["maxhp"]) < 0.45 and not bool(foe.get("raged", false)):
		foe["raged"] = true
		_apply_status(foe, "atkUp")
		var rage := String((foe.get("barks", {}) as Dictionary).get("rage", ""))
		if rage != "":
			barks.append({"unit": foe, "text": rage, "t": 0.0})
	var taunter: Dictionary = {}
	for a in alive(allies):
		if a["statuses"].has("taunt"):
			taunter = a
	var target: Dictionary = taunter if not taunter.is_empty() else alive(allies)[randi() % alive(allies).size()]
	_execute({"kind": "ai", "actor": foe, "ai_skill": pick, "target": target})


func _execute(action: Dictionary) -> void:
	var a: Dictionary = action["actor"]
	a["defending"] = false
	if a["statuses"].has("bleed") or a["statuses"].has("poison"):
		var dot := int(float(a["maxhp"]) * 0.06)
		a["hp"] = maxi(0, int(a["hp"]) - dot)
		_popup(Vector2(a["home"]) + Vector2(0, -70), "-%d" % dot, Color("c86bff"))
		if int(a["hp"]) <= 0:
			_kill(a)
			_end_action(a)
			return
	for key in ["atkUp", "atkDn", "defUp", "defDn", "taunt", "haste", "bleed", "poison"]:
		if a["statuses"].has(key):
			a["statuses"][key] = int(a["statuses"][key]) - 1
			if int(a["statuses"][key]) <= 0:
				a["statuses"].erase(key)
	if a["statuses"].has("stun"):
		a["statuses"].erase("stun")
		_popup(Vector2(a["home"]) + Vector2(0, -70), "STUNNED", Color("77ffff"))
		_end_action(a)
		return
	a["bp"] = mini(3, int(a.get("bp", 0)) + 1)
	if int(action.get("boost", 0)) > 0:
		a["bp"] = int(a["bp"]) - int(action["boost"])
		AudioDirector.sfx("boost")
	state = "anim"
	anim = {"action": action, "actor": a, "phase": 0, "t": 0.0}


func _tick_anim(delta: float) -> void:
	anim["t"] = float(anim["t"]) + delta
	var a: Dictionary = anim["actor"]
	var node: Sprite2D = a["node"]
	var dir := -1.0 if a["side"] == "ally" else 1.0
	var phase := int(anim["phase"])
	var at := float(anim["t"])
	if phase == 0:
		node.position.x = u_home_x(a) + dir * minf(1.0, at / 0.12) * 46.0
		if at >= 0.12:
			anim["phase"] = 1
			anim["t"] = 0.0
			_perform(anim["action"])
	elif phase == 1:
		if at >= 0.22:
			anim["phase"] = 2
			anim["t"] = 0.0
	else:
		node.position.x = u_home_x(a) + dir * (1.0 - minf(1.0, at / 0.15)) * 46.0
		if at >= 0.15:
			node.position.x = u_home_x(a)
			_end_action(a)


func u_home_x(u: Dictionary) -> float:
	return Vector2(u["home"]).x


func _end_action(a: Dictionary) -> void:
	a["atb"] = 0.35 if a["statuses"].has("haste") else 0.0
	anim = {}
	state = "flow"
	_check_end()


func _foes_of(u: Dictionary) -> Array:
	return alive(foes) if u["side"] == "ally" else alive(allies)


func _perform(action: Dictionary) -> void:
	var a: Dictionary = action["actor"]
	var boost := int(action.get("boost", 0))
	var target: Dictionary = action.get("target", {})
	if not target.is_empty() and (int(target["hp"]) <= 0 or float(target.get("dying", 0.0)) > 0.0):
		var pool := _foes_of(a)
		target = pool[0] if not pool.is_empty() else {}
	match String(action["kind"]):
		"attack":
			var hits := 1 + boost
			for h in range(hits):
				if target.is_empty() or int(target["hp"]) <= 0:
					var pool2 := _foes_of(a)
					if pool2.is_empty():
						break
					target = pool2[0]
				_deal_damage(a, target, 1.0, 0)
			AudioDirector.sfx("gun" if String(a.get("world", "")) == "cyber" else ("hit" if String(a.get("world", "")) == "business" else "slash"))
		"skill":
			_perform_skill(a, action["skill"], target, boost)
		"item":
			_perform_item(a, String(action["item"]), target)
		"defend":
			a["defending"] = true
			_popup(Vector2(a["home"]) + Vector2(0, -60), "GUARD", Color("9adcff"))
		"flee":
			if not is_boss and randf() < 0.7:
				state = "fled"
				win_t = 0.0
				SceneRouter.toast("Got away…", Color("b8b0d0"))
			else:
				_popup(Vector2(a["home"]) + Vector2(0, -60), "CAN'T ESCAPE", Color("ff8080"))
		"ai":
			var sk: Dictionary = action["ai_skill"]
			match String(sk.get("type", "attack")):
				"aoe":
					for t2 in alive(allies):
						_deal_damage(a, t2, float(sk.get("pow", 1.0)), 0)
				"heal":
					_heal(a, float(a["maxhp"]) * 0.25)
				"buff":
					_apply_status(a, "atkUp")
					_popup(Vector2(a["home"]) + Vector2(0, -60), "ENRAGED", Color("ff4a4a"))
				_:
					if not target.is_empty():
						_deal_damage(a, target, float(sk.get("pow", 1.0)), 0)
						if sk.has("status") and int(target["hp"]) > 0 and randf() < 0.4:
							_apply_status(target, String(sk["status"]))
			if sk.has("sfx"):
				AudioDirector.sfx(String(sk["sfx"]))


func _perform_skill(a: Dictionary, sk: Dictionary, target: Dictionary, boost: int) -> void:
	a["mp"] = int(a["mp"]) - int(sk.get("mp", 0))
	AudioDirector.sfx(String(sk.get("sfx", "hit")))
	match String(sk.get("type", "attack")):
		"attack":
			var hits := int(sk.get("hits", 1))
			for h in range(hits):
				if target.is_empty() or int(target["hp"]) <= 0:
					var pool := _foes_of(a)
					if pool.is_empty():
						return
					target = pool[0]
				_deal_damage(a, target, float(sk.get("pow", 1.0)), boost, int(sk.get("crit", 0)))
			if not target.is_empty() and int(target["hp"]) > 0 and sk.has("status"):
				_apply_status(target, String(sk["status"]))
		"aoe":
			for f in _foes_of(a):
				_deal_damage(a, f, float(sk.get("pow", 1.0)), boost)
				if int(f["hp"]) > 0 and sk.has("status") and randf() < 0.5:
					_apply_status(f, String(sk["status"]))
		"healself":
			_heal(a, float(a["maxhp"]) * float(sk.get("pow", 0.35)) * (1.0 + boost * 0.3))
		"heal":
			var tgt := target if (not target.is_empty() and target["side"] == "ally") else a
			_heal(tgt, float(tgt["maxhp"]) * float(sk.get("pow", 0.35)) * (1.0 + boost * 0.3))
		"buffself":
			_apply_status(a, "atkUp")
			_apply_status(a, "haste")
			_popup(Vector2(a["home"]) + Vector2(0, -60), "OVERCLOCK", Color("c86bff"))
		"taunt":
			_apply_status(a, "taunt")
			_apply_status(a, "defUp")
			_popup(Vector2(a["home"]) + Vector2(0, -60), "TAUNT", Color("ffd23e"))
		"debuff":
			if not target.is_empty():
				_apply_status(target, "defDn")
				_popup(Vector2(target["home"]) + Vector2(0, -60), "DEF DOWN", Color("9adcff"))
		"partybuff":
			for u in alive(allies):
				_apply_status(u, "atkUp")
			_popup(Vector2(a["home"]) + Vector2(0, -60), "RALLY", Color("7dffa0"))
		"steal":
			var amt := 20 + randi() % 40 + int(GameState.ch()["level"]) * 3
			reward_gold += amt
			if not target.is_empty():
				_popup(Vector2(target["home"]) + Vector2(0, -60), "+%d stolen!" % amt, Color("ffd23e"))
		"gamble":
			var mult: float = [0.2, 0.6, 1.0, 1.5, 2.2, 3.5][randi() % 6]
			_popup(Vector2(a["home"]) + Vector2(0, -80), "x%.1f" % mult, Color("ffd23e") if mult >= 2.0 else Color("b8b0d0"), mult >= 2.0)
			if not target.is_empty():
				_deal_damage(a, target, mult, boost)
		"allin":
			if not target.is_empty():
				_deal_damage(a, target, float(sk.get("pow", 3.2)), boost)
			if randf() < 0.3:
				var self_dmg := int(float(a["maxhp"]) * 0.2)
				a["hp"] = maxi(1, int(a["hp"]) - self_dmg)
				_popup(Vector2(a["home"]) + Vector2(0, -60), "-%d" % self_dmg, Color("ff8080"))


func _perform_item(a: Dictionary, item_id: String, target: Dictionary) -> void:
	var it := Db.item(item_id)
	GameState.inv_remove(GameState.ch(), item_id, 1)
	var tgt := target if not target.is_empty() else a
	if it.has("heal"):
		_heal(tgt, float(it["heal"]))
	if it.has("mp"):
		tgt["mp"] = mini(int(tgt["maxmp"]), int(tgt["mp"]) + int(it["mp"]))
		_popup(Vector2(tgt["home"]) + Vector2(0, -60), "+%d SP" % int(it["mp"]), Color("9adcff"))
		AudioDirector.sfx("heal")
	if it.has("revive") and int(tgt["hp"]) <= 0:
		tgt["hp"] = int(float(tgt["maxhp"]) * float(it["revive"]))
		tgt["dying"] = 0.0
		tgt["dead"] = false
		var node: Sprite2D = tgt["node"]
		node.visible = true
		_popup(Vector2(tgt["home"]) + Vector2(0, -60), "REVIVED", Color("ffe98a"))


func _deal_damage(src: Dictionary, tgt: Dictionary, pow_: float, boost: int, bonus_crit := 0) -> void:
	var boost_mult := 1.0 + boost * 0.5
	var dmg := int(maxf(1.0, float(src["atk"]) * pow_ * boost_mult * randf_range(0.9, 1.1) - float(tgt["def"]) * 0.85))
	if tgt["statuses"].has("defDn"):
		dmg = int(dmg * 1.35)
	if tgt["statuses"].has("defUp"):
		dmg = int(dmg * 0.65)
	if src["statuses"].has("atkUp"):
		dmg = int(dmg * 1.3)
	if src["statuses"].has("atkDn"):
		dmg = int(dmg * 0.7)
	if bool(tgt.get("defending", false)):
		dmg = int(dmg * 0.5)
	var crit := randf() * 100.0 < float(src["crit"] + bonus_crit)
	if crit:
		dmg = int(dmg * 1.6)
	tgt["hp"] = maxi(0, int(tgt["hp"]) - dmg)
	_popup(Vector2(tgt["home"]) + Vector2(0, -60), str(dmg),
		Color("ffd23e") if crit else (Color("ff8080") if tgt["side"] == "ally" else Color.WHITE), crit)
	_spark(Vector2(tgt["home"]) + Vector2(0, -40), Color("ffd23e") if crit else Color.WHITE, 18 if crit else 10)
	diorama.shake(9.0 if crit else minf(7.0, 3.0 + dmg / 30.0), 0.22)
	hit_stop = 0.1 if crit else 0.06
	AudioDirector.sfx("crit" if crit else "hit")
	tgt["hurt_t"] = 0.25
	if int(tgt["hp"]) <= 0:
		_kill(tgt)


func _kill(u: Dictionary) -> void:
	u["dying"] = 0.6
	AudioDirector.sfx("die")
	if u["side"] == "foe":
		reward_exp += int(u.get("exp", 0))
		reward_gold += int(u.get("gold", 0))
		for d in u.get("drops", []):
			if randf() < float(d.get("chance", 0.0)):
				reward_items.append(String(d["id"]))
		if u.has("enemy_id"):
			GameState.notify_kill(String(u["enemy_id"]))


func _heal(u: Dictionary, amount: float) -> void:
	var n := int(amount)
	u["hp"] = mini(int(u["maxhp"]), int(u["hp"]) + n)
	_popup(Vector2(u["home"]) + Vector2(0, -60), "+%d" % n, Color("7dffa0"))
	_spark(Vector2(u["home"]) + Vector2(0, -40), Color("7dffa0"), 8)
	AudioDirector.sfx("heal")


func _apply_status(u: Dictionary, key: String) -> void:
	u["statuses"][key] = 1 if key == "stun" else 3
	var names := {"bleed": "BLEED", "poison": "POISON", "stun": "STUN", "atkUp": "ATK UP",
		"atkDn": "ATK DOWN", "defUp": "DEF UP", "defDn": "DEF DOWN", "taunt": "TAUNT", "haste": "HASTE"}
	_popup(Vector2(u["home"]) + Vector2(0, -78), String(names.get(key, key)), Color("c86bff"))


func _popup(pos: Vector2, text: String, color: Color, big := false) -> void:
	popups.append({"pos": pos, "text": text, "col": color, "t": 0.0, "big": big})


func _spark(pos: Vector2, color: Color, n: int) -> void:
	for i in range(n):
		var ang := randf() * TAU
		var speed := randf_range(60.0, 260.0)
		sparks.append({"pos": pos, "vel": Vector2(cos(ang), sin(ang)) * speed + Vector2(0, -60),
			"t": 0.0, "life": randf_range(0.4, 0.7), "col": color})


func _comp_bark(unit: Dictionary, context: String) -> void:
	var bank := Db.bank(String(unit.get("type", "")))
	var lines: Array = bank.get(context, [])
	if not lines.is_empty():
		barks.append({"unit": unit, "text": String(lines[randi() % lines.size()]), "t": 0.0})


func _first_companion() -> Dictionary:
	for a in allies:
		if a.has("comp_id"):
			return a
	return {}


# ================= end states =================
func _check_end() -> void:
	var stop_at := float(opts.get("stop_at", 0.0))
	if stop_at > 0.0 and not foes.is_empty():
		var main_foe: Dictionary = foes[0]
		if float(main_foe["hp"]) / float(main_foe["maxhp"]) <= stop_at:
			state = "win"
			win_t = 0.0
			scripted_stop = true
			return
		var hero: Dictionary = allies[0]
		if float(hero["hp"]) / float(hero["maxhp"]) <= 0.2:
			hero["hp"] = int(float(hero["maxhp"]) * 0.3)
	if alive(foes).is_empty() and state != "win":
		state = "win"
		win_t = 0.0
		var talker := _first_companion()
		if not talker.is_empty() and randf() < 0.6:
			_comp_bark(talker, "win")
	elif alive(allies).is_empty() and state != "lose":
		state = "lose"
		lose_t = 0.0


func _finish_win() -> void:
	var c: Dictionary = GameState.ch()
	if not scripted_stop:
		c["gold"] = int(c["gold"]) + reward_gold
		for id in reward_items:
			GameState.inv_add(c, id, 1)
			SceneRouter.toast("Got " + String(Db.item(id).get("name", id)), Color("ffd23e"))
		if GameState.gain_exp(GameState.current, reward_exp):
			SceneRouter.toast("LEVEL UP! %s is now Lv %d" % [String(GameState.hero_info(GameState.current)["name"]), int(c["level"])], Color("7dffa0"))
			AudioDirector.sfx("level")
	for u in allies:
		if bool(u.get("is_hero", false)):
			c["hp"] = maxi(1, int(u["hp"]))
			c["mp"] = int(u["mp"])
	diorama.end_battle("win")


func _finish_lose() -> void:
	if bool(opts.get("scripted", false)):
		# scripted fights can't be lost — retry
		var saved := opts
		var dio := diorama
		dio.end_battle("retry")
		dio.start_battle(saved)
		return
	diorama.end_battle("lose")


# ================= drawing =================
func _draw() -> void:
	var font := ThemeDB.fallback_font
	if state == "intro":
		draw_rect(Rect2(0, 0, 960, 540), Color(1, 1, 1, maxf(0.0, 0.6 - intro_t)))
	# boss hp bars
	for u in foes:
		if bool(u.get("boss", false)) and int(u["hp"]) > 0:
			var w := 160.0
			var hx := Vector2(u["home"]).x - w / 2.0
			var hy := Vector2(u["home"]).y - float(u["scale"]) * 34.0 - 26.0
			draw_rect(Rect2(hx, hy, w, 10), Color(0, 0, 0, 0.6))
			draw_rect(Rect2(hx + 1, hy + 1, (w - 2) * float(u["hp"]) / float(u["maxhp"]), 8), Color("c43a3a"))
	for s in sparks:
		var col: Color = s["col"]
		col.a = 1.0 - float(s["t"]) / float(s["life"])
		draw_rect(Rect2(Vector2(s["pos"]) - Vector2(2, 2), Vector2(4, 4)), col)
	for p in popups:
		var dy := -float(p["t"]) * 46.0
		var fsize := 30 if bool(p["big"]) else 20
		var alpha := 1.0 if float(p["t"]) < 0.7 else (1.0 - float(p["t"])) / 0.3
		var pos := Vector2(p["pos"]) + Vector2(0, dy)
		var col2: Color = p["col"]
		col2.a = clampf(alpha, 0.0, 1.0)
		var shadow := Color(0, 0, 0, col2.a)
		draw_string(font, pos + Vector2(2, 2), String(p["text"]), HORIZONTAL_ALIGNMENT_CENTER, 200, fsize, shadow)
		draw_string(font, pos, String(p["text"]), HORIZONTAL_ALIGNMENT_CENTER, 200, fsize, col2)
	for b in barks:
		var u2: Dictionary = b["unit"]
		var tw := font.get_string_size(String(b["text"]), HORIZONTAL_ALIGNMENT_LEFT, -1, 13).x + 18.0
		var bx := clampf(Vector2(u2["home"]).x - tw / 2.0, 8.0, 960.0 - tw - 8.0)
		var by := Vector2(u2["home"]).y - 150.0 - (60.0 if bool(u2.get("boss", false)) else 0.0)
		var alpha2: float = clampf((2.8 - float(b["t"])) / 0.5, 0.0, 1.0) if float(b["t"]) > 2.3 else 0.95
		draw_rect(Rect2(bx, by, tw, 26), Color(0.08, 0.06, 0.13, alpha2))
		draw_rect(Rect2(bx, by, tw, 26), Color(u2["color"], alpha2), false, 1.5)
		draw_string(font, Vector2(bx + 9, by + 18), String(b["text"]), HORIZONTAL_ALIGNMENT_LEFT, tw - 12, 13, Color(0.91, 0.89, 0.96, alpha2))
	_draw_party_panel(font)
	if state == "menu" and not menu.is_empty():
		_draw_menu(font)
	if state == "win":
		_draw_win(font)
	if state == "lose":
		draw_rect(Rect2(0, 0, 960, 540), Color(0.24, 0.0, 0.04, minf(0.8, lose_t)))
		draw_string(font, Vector2(0, 270), "THE TIMELINE REJECTS THIS END" if bool(opts.get("scripted", false)) else "YOU FELL…",
			HORIZONTAL_ALIGNMENT_CENTER, 960, 34, Color("ff8080"))


func _draw_party_panel(font: Font) -> void:
	var ph := 26.0 + allies.size() * 34.0
	var px := 960.0 - 320.0 - 14.0
	var py := 540.0 - ph - 12.0
	draw_rect(Rect2(px, py, 320, ph), Color(0.04, 0.03, 0.08, 0.92))
	draw_rect(Rect2(px, py, 320, ph), Color("8878c8"), false, 2.0)
	for i in range(allies.size()):
		var u: Dictionary = allies[i]
		var y := py + 24.0 + i * 34.0
		var name_col := Color("664444") if int(u["hp"]) <= 0 else (Color("ffe98a") if (not menu.is_empty() and menu.get("unit") == u) else Color("e8e4f4"))
		draw_string(font, Vector2(px + 12, y), String(u["name"]).substr(0, 9), HORIZONTAL_ALIGNMENT_LEFT, -1, 13, name_col)
		draw_rect(Rect2(px + 96, y - 10, 92, 9), Color("2a2440"))
		var frac := clampf(float(u["hp"]) / float(u["maxhp"]), 0.0, 1.0)
		draw_rect(Rect2(px + 96, y - 10, 92 * frac, 9), Color("7dffa0") if frac > 0.3 else Color("ff8080"))
		draw_string(font, Vector2(px + 98, y - 1), "%d/%d" % [int(u["hp"]), int(u["maxhp"])], HORIZONTAL_ALIGNMENT_LEFT, -1, 9, Color("9a94b8"))
		draw_rect(Rect2(px + 194, y - 10, 40, 9), Color("2a2440"))
		draw_rect(Rect2(px + 194, y - 10, 40 * clampf(float(u["mp"]) / float(u["maxmp"]), 0.0, 1.0), 9), Color("9adcff"))
		draw_rect(Rect2(px + 240, y - 10, 46, 9), Color("2a2440"))
		var atb_col := (Color("ffe98a") if int(t * 6.0) % 2 == 0 else Color.WHITE) if float(u["atb"]) >= 1.0 else Color("c86bff")
		draw_rect(Rect2(px + 240, y - 10, 46 * clampf(float(u["atb"]), 0.0, 1.0), 9), atb_col)
		for b in range(3):
			draw_circle(Vector2(px + 294 + b * 9, y - 6), 3.5, Color("ffd23e") if b < int(u["bp"]) else Color("3a3454"))


func _draw_menu(font: Font) -> void:
	var u: Dictionary = menu["unit"]
	var mh := 190.0
	var mx := 14.0
	var my := 540.0 - mh - 12.0
	var mw := 260.0
	draw_rect(Rect2(mx, my, mw, mh), Color(0.04, 0.03, 0.08, 0.94))
	draw_rect(Rect2(mx, my, mw, mh), Color(u["color"]), false, 2.0)
	draw_string(font, Vector2(mx + 14, my + 22), "▸ " + String(u["name"]), HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color(u["color"]))
	draw_string(font, Vector2(mx + 128, my + 22), "BOOST(Q/E):", HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color("9a94b8"))
	for b in range(3):
		var col := Color("ffd23e") if b < int(menu["boost"]) else (Color("6a6288") if b < int(u["bp"]) else Color("2a2440"))
		draw_circle(Vector2(mx + 226 + b * 10, my + 18), 4.0, col)
	var mode := String(menu["mode"])
	if mode == "root":
		var items := _root_items(u)
		for i in range(items.size()):
			_menu_row(font, mx, my, i, String(items[i]["label"]))
	elif mode == "skill":
		var sks: Array = u.get("skills", [])
		for i in range(sks.size()):
			_menu_row(font, mx, my, i, "%s %dsp" % [String(sks[i]["name"]), int(sks[i].get("mp", 0))])
		if int(menu["idx"]) < sks.size():
			draw_string(font, Vector2(mx + 14, my + mh - 12), String(sks[int(menu["idx"])].get("desc", "")),
				HORIZONTAL_ALIGNMENT_LEFT, mw - 24, 10, Color("9a94b8"))
	elif mode == "item":
		var items2: Array = menu["items"]
		for i in range(mini(items2.size(), 5)):
			_menu_row(font, mx, my, i, "%s x%d" % [String(items2[i]["it"]["name"]), int(items2[i]["n"])])
	elif mode == "target":
		draw_string(font, Vector2(mx + 14, my + 52), "Choose target…", HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("9a94b8"))
		var ts: Array = (menu.get("targets", []) as Array).filter(func(x): return int(x["hp"]) > 0 or _is_revive_pending())
		if int(menu["target_idx"]) < ts.size():
			var tgt: Dictionary = ts[int(menu["target_idx"])]
			var bob := sin(t * 8.0) * 5.0
			var top := Vector2(tgt["home"]) + Vector2(0, -float(tgt["scale"]) * 34.0 - 40.0 + bob)
			draw_string(font, top + Vector2(-100, 0), "▼", HORIZONTAL_ALIGNMENT_CENTER, 200, 26, Color("ffe98a"))
			draw_string(font, top + Vector2(-100, -22), String(tgt["name"]), HORIZONTAL_ALIGNMENT_CENTER, 200, 14, Color("ffe98a"))


func _menu_row(font: Font, mx: float, my: float, i: int, label: String) -> void:
	var sel := i == int(menu["idx"])
	draw_string(font, Vector2(mx + 14, my + 52 + i * 24), ("> " if sel else "  ") + label,
		HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("ffe98a") if sel else Color("cfc8e8"))


func _draw_win(font: Font) -> void:
	var alpha := minf(1.0, win_t * 2.0)
	var rect := Rect2(480 - 220, 100, 440, 90 if scripted_stop else 170)
	draw_rect(rect, Color(0.04, 0.03, 0.08, 0.94 * alpha))
	draw_rect(rect, Color("ffd23e", alpha), false, 2.0)
	draw_string(font, Vector2(0, 138), "ENOUGH—" if scripted_stop else "VICTORY", HORIZONTAL_ALIGNMENT_CENTER, 960, 24, Color("ffd23e", alpha))
	if not scripted_stop:
		draw_string(font, Vector2(0, 172), "EXP +%d    %s +%d" % [reward_exp, GameState.currency(), reward_gold],
			HORIZONTAL_ALIGNMENT_CENTER, 960, 15, Color("e8e4f4", alpha))
		var names := ""
		for id in reward_items:
			names += String(Db.item(id).get("name", id)) + ", "
		draw_string(font, Vector2(0, 198), ("Spoils: " + names.trim_suffix(", ")) if names != "" else "No spoils this time.",
			HORIZONTAL_ALIGNMENT_CENTER, 960, 15, Color("e8e4f4", alpha))
	if win_t > 1.0:
		draw_string(font, Vector2(0, 168 if scripted_stop else 244), "— confirm —", HORIZONTAL_ALIGNMENT_CENTER, 960, 15, Color("9a94b8", alpha))
