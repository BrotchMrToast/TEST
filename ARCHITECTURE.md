# TRINITY RIFT — Architecture

## The HD-2D approach (decision + justification)

The brief offered two options: (A) TileMap ground rendered onto a slightly tilted 3D
plane, or (B) Sprite3D billboards over a GridMap. **This project implements option A**,
in its most robust form: the *entire* 2D game world — TileMapLayer ground, y-sorted
feature/character sprites, particles — renders into a `SubViewport`, whose texture is
mapped onto a `QuadMesh` tilted −9° on X inside a minimal 3D scene (`scenes/diorama.gd`).

Why A over B:

- **Authoring stays 2D.** Maps are ASCII-grid JSON; collision is simple tile math;
  y-sorting is a one-flag solution. Option B moves collision, navigation, and sorting
  into 3D space and triples the authoring surface — poison for a data-driven pipeline
  where content must be verifiable by a validator script without opening the editor.
- **The HD-2D signature effects live in 3D where they're cheap and native.** The tilted
  quad + `CameraAttributesPractical` near/far DOF produces the tilt-shift diorama look
  exactly; `WorldEnvironment` supplies glow/bloom and per-world `adjustment_*` color
  grading (see `Diorama.GRADES`). None of that needs per-sprite 3D placement.
- **Failure isolation.** If a rendering feature is unavailable (e.g. the compatibility
  renderer lacks DOF), the game inside the viewport is untouched — the shell degrades
  gracefully.

Cost acknowledged: sprites don't individually parallax against the ground the way
Octopath's Sprite3D billboards do. For a prototype the tilt+DOF+glow reads correctly;
per-sprite depth is a listed future upgrade (swap the quad for a GridMap floor and
re-parent entity sprites to Sprite3D billboards — entity code already isolates position
via a single `home`/`position` field per unit).

Crisp UI (dialogue, HUD, menus) draws on a `CanvasLayer` *above* the 3D view, outside
the DOF/glow path.

## Scene & autoload graph

```
Autoloads (project.godot):
  Db             loads data/*.json + per-world content; texture/wav caches
  GameState      3 timeline profiles + convergence profile; stats/leveling;
                 inventory/equipment; quest state machine; save/load user://
  AudioDirector  theme loops + sfx bank (generated 16-bit WAVs, header-stripped
                 into AudioStreamWAV at runtime; loop points set for themes)
  SceneRouter    registers keyboard+gamepad InputMap at boot; fade transitions;
                 toasts; title/select/world routing; battle hand-off

Scene flow:
  title.tscn -> character_select.tscn -> diorama.tscn
                                          ├─ SubViewport
                                          │   └─ overworld.gd  (or battle.gd)
                                          ├─ QuadMesh + Camera3D(DOF) + WorldEnvironment
                                          └─ CanvasLayer: hud, dialogue_box,
                                             pause_menu, shop, cutscene overlay
```

Battles swap scenes *inside* the viewport: `diorama.start_battle()` detaches the live
overworld node (state intact), attaches a `battle.gd` instance, and reverses on end —
so returning from combat restores exact world state, matching the reference prototype.

## Data-driven content

Everything a chapter needs is JSON under `data/`:

| File | Contents |
|---|---|
| `items.json` | full equipment/consumable catalog (all 5 tiers × 3 worlds + divine) |
| `enemies.json` | stats, AI skill tables (weighted), drops, boss rage barks |
| `quests.json` | kill/collect/flag stages, offer/mid/turn-in dialogue, rewards |
| `shops.json`, `companions.json`, `common.json` | stores, hireables, archetype banks |
| `sprites.json` | parametric sprite specs consumed by `tools/gen_assets.py` |
| `worlds/<w>/world.json` | chapter goals, start position, map list, planned chapters |
| `worlds/<w>/maps/*.json` | ASCII rows + legend entities (npcs/chests/exits/triggers) |
| `worlds/<w>/cutscenes.json` | step arrays: say/battle/chapter/give/gold/heal/tp/… |
| `worlds/<w>/dialogue.json` | NPC lines, selected by highest `min_chapter` ≤ chapter |

Cutscene steps are the whole story engine: `{"battle": {...}}` suspends the runner
until the fight resolves (scripted fights retry on loss; `stop_at` implements the
mirror-duel "stop at 45% HP" beats), `{"rift": true}` closes a timeline,
`{"unify": true}` performs the divine fusion, `{"credits": true}` rolls credits.

## Combat model

Active-mode ATB: gauges fill in real time even while a menu is open (FFVII "Active").
Each turn a unit gains 1 Boost Point (cap 3); spending BP multiplies attack/skill power
(and adds hits to basic attacks). Statuses tick on the owner's turn. Enemy AI picks
weighted skills; bosses enter a rage phase (+atk, bark) below 45% HP. The damage formula
and stat growth live in data-friendly constants (`GameState.HERO_BASE`,
`battle.gd::_deal_damage`) and are exercised by the headless tests.

## Verification strategy (and the environment constraint)

The project was authored by an agent whose sandbox **egress policy blocks the Godot
binary hosts** (GitHub releases, downloads.godotengine.org, tuxfamily — all 403; Ubuntu
apt only carries Godot 3.5). Per that policy, the block was not routed around. The
verification pyramid is therefore split:

- **In the build environment (ran on every milestone)** — `tools/check.sh`:
  - `gdparse` (gdtoolkit 4.5): every script parsed against the real GDScript 4 grammar;
  - `tools/validate_project.py`: JSON integrity; enemy/item/quest/shop/companion/
    sprite/dialogue/cutscene cross-references; per-map walkability, spawn validity,
    BFS reachability of every NPC/chest/exit/trigger, exit bounce-loop detection;
    every `res://` path referenced by scenes/scripts exists;
  - asset generator determinism (CRC-seeded, byte-identical re-runs).
- **On a normal dev machine (one command)** — `tools/bootstrap.sh`: downloads Godot
  4.4.1, `--import`, engine `--check-only` on every script, `tools/run_tests.gd`
  headless unit tests (leveling, inventory/equip, quests, save/load), and Xvfb
  screenshot capture (`tools/screenshot.gd`) into `docs/screenshots/`.

Anything the engine layer flags lands in normal Godot territory: the scripts are plain,
conservative GDScript 4 (no plugins, no GDExtension, no editor-only features).

## Known gaps / next steps

- Engine-level smoke test and screenshots pending first `bootstrap.sh` run (env limit).
- Water/shrine animation is a two-frame tile/region swap; a shader pass would be nicer.
- Per-sprite 3D parallax (see decision section) is the flagship visual upgrade.
- Chapters 2–5 content: authored and proven in `web-prototype/` (full JS version);
  porting them is data entry per README's "Authoring a new chapter".
