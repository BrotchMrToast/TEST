extends SceneTree
## Screenshot harness — drives the game and captures PNGs into docs/screenshots/.
## Needs a rendering context (NOT --headless):
##   xvfb-run -a ./tools/godot --path . --rendering-driver opengl3 \
##       --script tools/screenshot.gd
## (bootstrap.sh wires this up.)

const OUT := "res://docs/screenshots"


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(OUT))
	var gs = root.get_node("/root/GameState")
	var router = root.get_node("/root/SceneRouter")

	await _settle(1.2)
	await _shot("01-title")

	router.go_select()
	await _settle(1.4)
	await _shot("02-select")

	router.enter_world("samurai")
	await _settle(2.0)
	# skip through intro dialogue
	for i in range(14):
		_press("confirm")
		await _settle(0.3)
	await _shot("03-village")

	# walk around a bit
	Input.action_press("move_down")
	await _settle(0.8)
	Input.action_release("move_down")
	await _shot("04-village-walk")

	# battle
	var dio = current_scene
	if dio != null and dio.has_method("start_battle"):
		dio.start_battle({"enemies": ["sam_bandit", "sam_wolf"], "bg": "ashvillage"})
		await _settle(2.0)
		await _shot("05-battle")
	print("screenshots written to docs/screenshots/")
	quit(0)


func _press(action: String) -> void:
	Input.action_press(action)
	await physics_frame
	Input.action_release(action)


func _settle(secs: float) -> void:
	var timer := root.get_tree().create_timer(secs)
	await timer.timeout


func _shot(name: String) -> void:
	await process_frame
	await process_frame
	var img := root.get_viewport().get_texture().get_image()
	img.save_png(ProjectSettings.globalize_path(OUT + "/" + name + ".png"))
	print("  captured ", name)
