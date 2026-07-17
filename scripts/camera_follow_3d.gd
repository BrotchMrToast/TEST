extends Node3D
## Keeps a fixed 3D camera rig offset while smoothly following its target.

@export_node_path("Node3D") var target_path: NodePath
@export var follow_speed := 8.0

var _target: Node3D
var _target_offset := Vector3.ZERO


func _ready() -> void:
	_target = get_node_or_null(target_path) as Node3D
	if _target != null:
		_target_offset = global_position - _target.global_position


func _process(delta: float) -> void:
	if not is_instance_valid(_target):
		return

	var desired_position := _target.global_position + _target_offset
	var weight := 1.0 - exp(-follow_speed * delta)
	global_position = global_position.lerp(desired_position, weight)
