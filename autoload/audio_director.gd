extends Node
## AudioDirector — plays the generated chiptune theme loops and SFX bank.

var _music: AudioStreamPlayer
var _sfx_players: Array[AudioStreamPlayer] = []
var _current_theme := ""


func _ready() -> void:
	_music = AudioStreamPlayer.new()
	_music.bus = "Master"
	_music.volume_db = -8.0
	add_child(_music)
	for i in range(6):
		var p := AudioStreamPlayer.new()
		p.bus = "Master"
		p.volume_db = -5.0
		add_child(p)
		_sfx_players.append(p)


func play_theme(name: String) -> void:
	if name == _current_theme and _music.playing:
		return
	_current_theme = name
	if GameState.muted:
		return
	var stream := Db.wav("theme_" + name, true)
	if stream == null:
		return
	_music.stream = stream
	_music.play()


func stop_music() -> void:
	_music.stop()
	_current_theme = ""


func set_muted(m: bool) -> void:
	GameState.muted = m
	if m:
		_music.stop()
	elif _current_theme != "":
		var t := _current_theme
		_current_theme = ""
		play_theme(t)


func sfx(name: String) -> void:
	if GameState.muted:
		return
	var stream := Db.wav("sfx_" + name, false)
	if stream == null:
		return
	for p in _sfx_players:
		if not p.playing:
			p.stream = stream
			p.play()
			return
	_sfx_players[0].stream = stream
	_sfx_players[0].play()
