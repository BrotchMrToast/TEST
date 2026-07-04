extends Control
## Ending credits crawl.

const VW := 960.0
const VH := 540.0

const LINES := [
	"#TRINITY RIFT",
	"Three Lives. One Soul. Zero Time.",
	"",
	"#THE THREE",
	"Kenji Arakawa — the Broken Blade",
	"Mori Daiki — the Caged Suit",
	"Vex Kurono — the Unchained Gun",
	"Tokihito — the Timeless One",
	"",
	"#THE FALLEN",
	"Kuroyami, Demon God of the Hour Between Hours",
	"",
	"#THE COMPANIONS",
	"Goro · Kiku · Sadao",
	"Ryo · Keiko · Big Sho",
	"Bit · Dice · Nyx",
	"",
	"#IN MEMORY",
	"Senator Ren Osei, who voted no",
	"The mother of the Arakawa children",
	"",
	"#AN HD-2D PROTOTYPE",
	"every sprite, tile, note and word: procedural",
	"no assets were downloaded in the making",
	"",
	"#THANK YOU FOR PLAYING",
	"confirm — return to title",
]

var t := 0.0


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	AudioDirector.play_theme("divine")


func _process(delta: float) -> void:
	t += delta
	queue_redraw()
	if t > 4.0 and Input.is_action_just_pressed("confirm"):
		SceneRouter.go_title()
	if t > LINES.size() * 1.6 + 8.0:
		SceneRouter.go_title()


func _draw() -> void:
	draw_rect(Rect2(0, 0, VW, VH), Color("06040c"))
	var font := get_theme_default_font()
	var rng := RandomNumberGenerator.new()
	rng.seed = 4
	for i in range(90):
		var col := Color("cfd4ff")
		col.a = 0.25 + sin(t + i) * 0.2
		draw_rect(Rect2(rng.randf() * VW, rng.randf() * VH, 2, 2), col)
	var scroll := t * 34.0
	for i in range(LINES.size()):
		var y := VH + 40.0 + i * 44.0 - scroll
		if y < -40.0 or y > VH + 40.0:
			continue
		var line := String(LINES[i])
		var is_heading := line.begins_with("#")
		draw_string(font, Vector2(0, y), line.trim_prefix("#"), HORIZONTAL_ALIGNMENT_CENTER, VW,
			26 if is_heading else 16, Color("ffe98a") if is_heading else Color("cfc8e8"))
