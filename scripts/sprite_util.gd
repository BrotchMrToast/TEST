class_name SpriteUtil
## Helpers for slicing the generated 3x3 sprite sheets.
## Sheet layout: columns = frames (idle, walk1, walk2), rows = down / up / side.

const DIR_ROW := {"down": 0, "up": 1, "side": 2, "left": 2, "right": 2}


static func frame_atlas(sprite_name: String, frame: int, dir: String) -> AtlasTexture:
	var tex := Db.sprite_tex(sprite_name)
	var fw := int(tex.get_width() / 3.0)
	var fh := int(tex.get_height() / 3.0)
	var at := AtlasTexture.new()
	at.atlas = tex
	at.region = Rect2(frame * fw, DIR_ROW.get(dir, 0) * fh, fw, fh)
	return at


static func apply_frame(sprite: Sprite2D, sprite_name: String, frame: int, dir: String) -> void:
	var tex := Db.sprite_tex(sprite_name)
	var fw := int(tex.get_width() / 3.0)
	var fh := int(tex.get_height() / 3.0)
	sprite.texture = tex
	sprite.region_enabled = true
	sprite.region_rect = Rect2(frame * fw, DIR_ROW.get(dir, 0) * fh, fw, fh)
	sprite.flip_h = (dir == "left")
	sprite.offset = Vector2(0, -fh / 2.0)
