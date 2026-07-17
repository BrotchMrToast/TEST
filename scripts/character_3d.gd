class_name CharacterSprite3D
extends CharacterBody3D
## Reusable HD-2D character controller for 3-column, 3-row sprite sheets.

@export_category("Character")
@export var sprite_sheet: Texture2D

@export_category("Movement")
@export var input_enabled := true
@export var move_speed := 3.5
@export var run_multiplier := 1.6

@export_category("Animation")
@export var animation_fps := 8.0
@export var sheet_columns := 3
@export var sheet_rows := 3

@onready var sprite: Sprite3D = $Sprite3D

const DIR_ROW := {
	"down": 0,
	"up": 1,
	"side": 2,
}
const IDLE_FRAME := 0
const WALK_FRAMES := [1, 2]

var _facing := "down"
var _animation_time := 0.0
var _gravity: float = float(ProjectSettings.get_setting("physics/3d/default_gravity", 9.8))


func _ready() -> void:
	sprite.texture = sprite_sheet
	sprite.region_enabled = true
	_set_frame(IDLE_FRAME, _facing)


func _physics_process(delta: float) -> void:
	var input_vector := Vector2.ZERO
	if input_enabled:
		input_vector = Input.get_vector("move_left", "move_right", "move_up", "move_down")

	var move_direction := Vector3(input_vector.x, 0.0, input_vector.y)
	var current_speed := move_speed
	if Input.is_action_pressed("run"):
		current_speed *= run_multiplier

	velocity.x = move_direction.x * current_speed
	velocity.z = move_direction.z * current_speed

	if not is_on_floor():
		velocity.y -= _gravity * delta
	else:
		velocity.y = 0.0

	_update_animation(input_vector, delta)
	move_and_slide()


func _update_animation(input_vector: Vector2, delta: float) -> void:
	if input_vector == Vector2.ZERO:
		_animation_time = 0.0
		_set_frame(IDLE_FRAME, _facing)
		return

	if absf(input_vector.x) > absf(input_vector.y):
		_facing = "side"
		sprite.flip_h = input_vector.x < 0.0
	elif input_vector.y < 0.0:
		_facing = "up"
		sprite.flip_h = false
	else:
		_facing = "down"
		sprite.flip_h = false

	_animation_time += delta
	var walk_index := int(_animation_time * animation_fps) % WALK_FRAMES.size()
	_set_frame(WALK_FRAMES[walk_index], _facing)


func _set_frame(frame: int, direction: String) -> void:
	if sprite.texture == null or sheet_columns <= 0 or sheet_rows <= 0:
		return

	var frame_width := sprite.texture.get_width() / sheet_columns
	var frame_height := sprite.texture.get_height() / sheet_rows
	var row: int = int(DIR_ROW.get(direction, 0))
	sprite.region_rect = Rect2(
		frame * frame_width,
		row * frame_height,
		frame_width,
		frame_height
	)
