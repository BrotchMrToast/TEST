# TRINITY RIFT — Godot 4 HD-2D RPG prototype

**Three Lives. One Soul. Zero Time.** A 2.5D HD-2D-style RPG vertical slice built as a
proper **Godot 4.4** project: three selectable protagonists in three timelines (Sengoku
Japan / present-day Tokyo / cyberpunk 2087), FFVII-style active ATB combat with a Boost
system, equipment, shops, chests, quests, hireable companions with personality archetypes,
and a convergence finale where the three heroes discover they are one splintered
time-traveler and face the demon god **Kuroyami**.

Every sprite, tile, backdrop, and music track is **generated procedurally** by
`tools/gen_assets.py` — no downloaded art, audio, or fonts anywhere in the project.

> There is also a complete, playable **HTML5 prototype** of the full 5-chapter story in
> [`web-prototype/`](web-prototype/) — open `web-prototype/index.html` in a browser. It
> doubles as the design reference for this engine port (its screenshots show the target
> look).

## Run it

```sh
# one command: downloads Godot 4.4.1 into tools/, imports, checks, tests, screenshots
./tools/bootstrap.sh

# then play:
./tools/godot --path .
# …or open the folder in the Godot 4.4+ editor and press F5.
```

| Input | Action |
|-------|--------|
| Arrows / WASD / left stick | Move |
| Z / Enter / Space / ⓐ | Confirm · Interact · Advance dialogue |
| X / Backspace / ⓑ | Cancel |
| Esc / Start | Pause menu (Status · Items · Equip · Party · Quests · System/Save) |
| Q / E / shoulder buttons | Spend Boost Points in battle |
| Shift / ⓧ | Run (raises encounter rate) |
| M | Toggle music |

Shrines (the glowing obelisks) heal, save, and set your respawn checkpoint.

## What's in the vertical slice

**Every system, one chapter of content per timeline** (the architecture is data-driven —
chapters 2–5 plug in as JSON, see below):

- **Three playable openings** ending at their time rifts: Kenji's bloody village revenge
  (Ashen Village + province overworld), Daiki's forced yakuza "onboarding" (Shinjuku
  offices + Greater Tokyo), Vex's bazaar war (Neon Bazaar + the sprawl).
- **The Convergence**: after all three rifts — mirror duels between the protagonists
  (playable, scripted stop), the Kuroyami reveal, unification into the divine Tokihito,
  and a two-phase demon-god finale with credits.
- **ATB battles** (active mode): boost pips, per-hero skill books, statuses (bleed, stun,
  poison, buffs/debuffs), boss rage barks, hit-stop/shake/damage pop-ups, flee, items,
  rewards with drop tables and level-ups.
- **Overworlds with locked gates** to areas 2–5 showing each future chapter's goal text.
- **Companions**: hire Goro (brute), Ryo (gambler), or Bit (tech-genius) — all five
  archetypes (brute/tactician/thief/gambler/tech) are implemented with their own combat
  skills and ambient dialogue banks; the other six named companions ship in
  `data/companions.json` ready for their chapters.
- **Quests** (kill/collect), shops (buy/sell), chests, save/load to `user://`.
- **HD-2D presentation**: the 2D world renders in a SubViewport mapped onto a tilted 3D
  quad; a Camera3D with practical DOF produces the tilt-shift, WorldEnvironment adds
  glow and per-world color grading, GPUParticles2D supply falling ash / rain / neon rain
  / sakura petals / void motes per biome. See `ARCHITECTURE.md` for the reasoning.

## Verification

Two layers, because this project was authored by an agent in an environment whose egress
policy blocks the Godot binary hosts (github releases / downloads.godotengine.org — 403):

1. **Engine-free (ran in CI/build env)** — `./tools/check.sh`:
   `gdparse` (gdtoolkit's real GDScript 4 grammar) over every script · full content/map
   validator (`tools/validate_project.py`: JSON integrity, cross-references, walkability,
   BFS reachability, exit bounce-loops, broken `res://` paths) · asset-generator
   determinism.
2. **Engine (run on your machine)** — `./tools/bootstrap.sh`:
   `--import`, per-script `--check-only` with the real engine, headless unit tests
   (`tools/run_tests.gd`: leveling, inventory/equipment, quest flow, save/load
   roundtrip), and Xvfb gameplay screenshots into `docs/screenshots/`.

## Project layout

```
project.godot            Godot 4.4 project (autoloads, display, rendering)
autoload/                Db · GameState · AudioDirector · SceneRouter
scenes/                  title, character_select, diorama (HD-2D shell),
                         overworld, battle, credits, ui/ (dialogue, hud, pause, shop)
scripts/                 sprite_util, cutscene runner
data/                    ALL game content as JSON (see ARCHITECTURE.md)
  worlds/<world>/        world.json · maps/*.json · cutscenes.json · dialogue.json
assets/generated/        procedural sprites/tiles/backdrops/audio (committed)
tools/                   gen_assets.py · validate_project.py · run_tests.gd ·
                         screenshot.gd · bootstrap.sh · check.sh
docs/screenshots/        filled by bootstrap.sh
web-prototype/           the complete HTML5 version (full 5-chapter story)
```

## Authoring a new chapter (no code changes)

1. Add `data/worlds/<world>/maps/<map>.json` — ASCII rows (legend in
   `scenes/overworld.gd`: `#` wall, `T` tree, `~` water, `,` hostile, `+` shrine,
   `B` hi-rise, `%` bamboo …), spawn, exits, npcs, chests, triggers, encounter groups.
2. Register the map in `world.json` `maps`, append the chapter goal, and lower/raise the
   overworld gate's `req_chapter`.
3. Add story beats to `cutscenes.json` (steps: say/battle/chapter/give/tp/rift/…) and
   NPC lines to `dialogue.json`; new enemies/items/quests to the top-level catalogs.
4. New characters? Add a spec to `data/sprites.json`, run `python3 tools/gen_assets.py`.
5. `./tools/check.sh` — the validator will catch unreachable chests, bounce-loop exits,
   missing refs, and solid spawns before you ever launch the editor.

## Exporting

Standard Godot flow: Editor → Project → Export → add a preset (Linux/Windows/macOS/Web),
or `./tools/godot --headless --path . --export-release <preset> build/game`
after configuring presets. No plugins or native extensions are used.
