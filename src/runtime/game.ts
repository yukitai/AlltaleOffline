import config from '../config'
import { SpListItemType } from '../types'
import Canvas from './canvas'
import { Controll } from './controll'

enum NoteType {
  Tap, Drag, Hold, Delta, Beat, Revolve, Spacing, K
}

type Note = {
  type: NoteType,
  loc: string,
  ts: number,
  te: number,
  y: number,
  hit: boolean,
  htype: HitType,
  frame: number,
  _f: number,
}

enum HitType {
  Pure, Good, Miss, Unknown
}

type HitEffectType = HitType

type HitEffect = {
  type: HitEffectType,
  x: number,
  y: number,
  _f: number,
  size: number,
  frame: number,
}

type GameState = {
  truck_spacing: number,
  to_truck_spacing: number,
  direction: number,
  to_direction: number,
  beat_animate: number,
  truck_x: number,
  to_truck_x: number,
  line_y: number,
  to_line_y: number,
  truck_count: number,
  truck_x2: number,
}

class ScoreBoard {
  acc: number
  pure: number
  good: number
  miss: number
  combo: number
  max_combo: number
  note_count: number
  hit_note: number
  score: number
  constructor () {
    this.acc = 1
    this.pure = 0
    this.good = 0
    this.miss = 0
    this.combo = 0
    this.max_combo = 0
    this.note_count = 0
    this.score = 0
    this.hit_note = 0
  }
  hit (type: HitType) {
    if (type === HitType.Miss) {
      this.combo = 0
      ++this.miss
    } else if (type === HitType.Pure) {
      if (++this.combo > this.max_combo) {
        this.max_combo = this.combo
      }
      ++this.pure
    } else if (type === HitType.Good) {
      if (++this.combo > this.max_combo) {
        this.max_combo = this.combo
      }
      ++this.good
    } else {}
    const weight = config.player.weight
    this.acc = (weight[0] * this.pure + weight[1] * this.good + weight[2] * this.miss) / ++this.hit_note
    this.updateScore()
  }
  updateNoteCount (spec: SpListItemType) {
    let count = 0
    for (let loc of spec.spectrum.loc) {
      loc = loc.toLowerCase()
      if (loc[0] === 'd' && '01234567890'.indexOf(loc[1]) !== -1 || '01234567890'.indexOf(loc[0]) !== -1) {
        ++count
      }
    }
    this.note_count = count
  }
  updateScore () {
    this.score = Math.round(
      10_0000 * this.max_combo / this.note_count + 
      90_0000 * this.acc * this.hit_note / this.note_count
    )
  }
}

class Game {
  ts: number
  dt: number
  t_scale: number
  last_t: number
  dlc: number
  nlc: number
  spec: SpListItemType
  gameloop: number
  notes: Note[]
  hit_effects: HitEffect[]
  state: GameState
  canvas: Canvas
  game_state: boolean
  scoreboard: ScoreBoard
  controller: Controll
  constructor (spec: SpListItemType, canvas: HTMLCanvasElement) {
    this.ts = 0
    this.dt = 0
    this.last_t = (new Date()).getTime()
    this.dlc = 0
    this.nlc = 0
    this.spec = spec
    this.gameloop = -1
    this.notes = []
    this.hit_effects = []
    this.t_scale = 1
    this.state = {
      truck_spacing: 0,
      to_truck_spacing: 100,
      direction: -.2,
      to_direction: 0,
      beat_animate: 0,
      truck_x: 0,
      to_truck_x: 0,
      truck_x2: 0,
      line_y: -80,
      to_line_y: -80,
      truck_count: 4,
    }
    this.game_state = true
    this.canvas = new Canvas(canvas)
    this.scoreboard = new ScoreBoard()
    this.controller = new Controll(config.player.key)
  }
  _preMovement (from_ts: number, frame: number, direction: number): number {
    let line_height = 0, dlc = this.dlc
    for (let i = 0; i < frame; ++i) {
      let sp_ts = this.spec.speedList.ts[dlc + 1]
      if (sp_ts && from_ts + i / config.player.fps - 1 > sp_ts) {
        ++dlc
      }
      line_height += direction * config.player.speed * this.spec.speedList.speed[dlc]
    }
    return line_height
  }
  createNote (type: NoteType, loc: string, ts: number, te: number) {
    let line_height = this._preMovement(ts, config.player.fps, 1)
    let hold_height = 0
    if (type === NoteType.Hold) {
      hold_height = this._preMovement(ts + 1, config.player.fps * (te - ts), 1)
    }
    const note = {
      type: type,
      loc, ts, te: hold_height, _f : 0, y: line_height,
      frame: config.player.fps, hit: false,
      htype: HitType.Unknown,
    }
    this.notes.push(note)
  }
  refreshHitEffects (w: (x: number) => number, h: (x: number) => number) {
    let delete_list: number[] = []
    for (const id in this.hit_effects) {
      const hit_effect = this.hit_effects[id]
      if (hit_effect.type === HitType.Miss || hit_effect.type === HitType.Unknown) continue
      hit_effect.size += .08 * (160 - hit_effect.size)
      this.canvas.save()
      this.canvas.global_alpha(1 - hit_effect._f / hit_effect.frame)
      this.canvas.rect_center(w(hit_effect.x), h(hit_effect.y), hit_effect.size, hit_effect.size, 
        -this.state.direction, hit_effect.type === HitType.Pure ? "#ffff77" : "#7777ff", 6)
      this.canvas.restore()
      ++hit_effect._f
      if (hit_effect._f > hit_effect.frame) {
        delete_list.push(id as unknown as number)
      }
    }
    for (let i = delete_list.length - 1; i >= 0; --i) {
      this.hit_effects.splice(delete_list[i], 1)
    }
  }
  refresh () {
    const w = this.canvas.w()
    const h = this.canvas.h()
    this.canvas.clear()
    this.canvas.save()
    this.canvas.rotate(this.state.direction)
    this.canvas.rect_center(w(this.state.truck_x), h(this.state.line_y), this.canvas._w * 4, 0, this.state.beat_animate, "#ffffff", 3)
    for (let i = 0; i < this.state.truck_count; ++i) {
      this.canvas.rect_center(
        w(this.state.truck_x + this.state.truck_x2 + (.5 + i) * this.state.truck_spacing), 
        h(this.state.line_y), 0, this.canvas._h * 4, this.state.beat_animate, "#ffffff", 3
      )
    }
    for (const note of this.notes) {
      //console.log(note.type, NoteType.Tap)
      if (note.type === NoteType.Tap) {
        this.canvas.rect(
          w(this.state.truck_x + this.state.truck_x2 + (-.5 + parseInt(note.loc)) * this.state.truck_spacing), 
          h(this.state.line_y + note.y), 60, 10, 0, "#7777ff", 3
          )
      } else if (note.type === NoteType.Drag) {
        this.canvas.rect(
          w(this.state.truck_x + this.state.truck_x2 + (-.5 + parseInt(note.loc[1])) * this.state.truck_spacing), 
          h(this.state.line_y + note.y), 60, 10, 0, "#ffff77", 3
          )
      } else if (note.type === NoteType.Hold) {
        this.canvas.save()
        if (note.htype === HitType.Miss) {
          this.canvas.global_alpha(.5)
        }
        this.canvas.rect(
          w(this.state.truck_x + this.state.truck_x2 + (-.5 + parseInt(note.loc)) * this.state.truck_spacing), 
          h(this.state.line_y + note.y), 60, note.te / 360 * this.canvas._h, 0, "#7777ff", 3
          )
        this.canvas.restore()
      }
    }
    this.refreshHitEffects(w, h)
    this.canvas.restore()
    this.refreshMenu()
  }
  refreshMenu () {
    this.canvas.font("700 40px monospace")
    let color = "#ffffff"
    if (this.scoreboard.miss > 0) {
      color = "#ff7777"
    } else if (this.scoreboard.good > 0) {
      color = "#7777ff"
    }
    this.canvas.text(`${this.scoreboard.score}`, 
      this.canvas._w / 2, 60, .5, color)
    this.canvas.font("400 15px monospace")
    this.canvas.text(`Max Combo ${this.scoreboard.max_combo}`, 
      this.canvas._w / 2, 85, .5, "#ffffff")
    this.canvas.text(`Combo ${this.scoreboard.combo}`, 
      this.canvas._w / 2, 100, .5, "#ffffff")
    this.canvas.text(`Acc ${Math.round(this.scoreboard.acc * 1_0000) / 100}%`, 
      this.canvas._w - 20, 35, 1, "#ffffff")
    this.canvas.text(`Pure ${this.scoreboard.pure}`, 
      this.canvas._w - 20, 55, 1, "#ffff77")
    this.canvas.text(`Good ${this.scoreboard.good}`, 
      this.canvas._w - 20, 75, 1, "#7777ff")
    this.canvas.text(`Miss ${this.scoreboard.miss}`, 
      this.canvas._w - 20, 95, 1, "#aaaaaa")
    this.canvas.text(`Note ${this.scoreboard.hit_note} of ${this.scoreboard.note_count}`, 
      this.canvas._w - 20, 115, 1, "#ffffff")
    if (config.debug) {
      this.canvas.text(`Debug ${config.debug}`, 
        this.canvas._w - 20, 135, 1, "#ff77ff")
      this.canvas.text(`Real FPS ${Math.round(1 / this.dt)}`, 
        this.canvas._w - 20, 155, 1, "#ff77ff")
    } 
  }
  _getLocParams (loc: string) {
    return loc.split("[")[1].slice(0, -1).split(",")
  }
  createHitEffect (x: number, y: number, type: HitEffectType, frame: number) {
    this.hit_effects.push({
      x, y, type, frame, _f: 0, size: 0,
    })
  }
  _getLoc (loc: string) {
    loc = loc.toLowerCase()
    if (loc[0] === "d") return parseInt(loc[1])
    return parseInt(loc)
  }
  getHitType (ts: number, hit_t: number) {
    return Math.abs(ts - hit_t + 1) < 80/1000 ? HitType.Pure : HitType.Good
  }
  updateNote (id: number): boolean {
    const note = this.notes[id]
    ++note._f
    if (note.type === NoteType.K) {
      this.state.truck_count = parseInt(note.loc[1])
      this.notes.splice(id, 1)
      return false
    } else if (note.type === NoteType.Beat) {
      this.state.beat_animate = Math.PI / 30
      this.notes.splice(id, 1)
      return false
    } else if (note.type === NoteType.Spacing) {
      this.state.to_truck_spacing = parseInt(this._getLocParams(note.loc)[0]) / this.canvas._w * this.canvas._h * 4/3
      //console.log(this.state.to_truck_spacing)
      this.notes.splice(id, 1)
      return false
    } else if (note.type === NoteType.Revolve) {
      this.state.to_direction = (parseInt(this._getLocParams(note.loc)[0]) - 90) / 180 * Math.PI
      //console.log(this.state.to_direction)
      this.notes.splice(id, 1)
      return false
    } else if (note.type === NoteType.Delta) {
      this.state.to_truck_x = parseInt(this._getLocParams(note.loc)[0])
      //console.log(this.state.to_truck_x)
      this.notes.splice(id, 1)
      return false
    } else {
      const hit = (ntype: NoteType, htype: HitEffectType) => {
        note.y = 0
        this.scoreboard.hit(htype)
        if (htype === HitType.Miss || htype === HitType.Unknown) return
        this.createHitEffect(
          this.state.truck_x + this.state.truck_x2 + (-.5 + this._getLoc(note.loc)) * this.state.truck_spacing, 
          this.state.line_y + note.y, htype, Math.floor(config.player.fps / 2)
        )
        if (ntype === NoteType.Drag) {
          config.sound.drag_hit.currentTime = 0
          config.sound.drag_hit.play()
        } else {
          config.sound.tap_hit.currentTime = 0
          config.sound.tap_hit.play()
        }
      }
      const hit_hold = (_f: number, htype: HitEffectType) => {
        if (_f % 4 === 0) this.createHitEffect(
          this.state.truck_x + this.state.truck_x2 + (-.5 + this._getLoc(note.loc)) * this.state.truck_spacing, 
          this.state.line_y + note.y, htype, Math.floor(config.player.fps / 2)
        )
      }
      if (this.ts - note.ts - 1 > -160/1000) {
				if (note.type === NoteType.Hold) {
          if (note.y <= 0) {
            note.y = 0;
            note.te -=
              this.t_scale *
              config.player.speed *
              this.spec.speedList.speed[this.dlc];
          } else {
            note.y -=
							this.t_scale *
							config.player.speed *
							this.spec.speedList.speed[this.dlc];
          }
					if (!note.hit) {
						if (this.controller.is_press_once(this._getLoc(note.loc) - 1)) {
							note.hit = !note.hit;
							note.htype = this.getHitType(note.ts, this.ts);
							config.sound.tap_hit.currentTime = 0;
							config.sound.tap_hit.play();
						} else if (this.ts - note.ts - 1 > 0.5) {
							note.hit = !note.hit;
							note.htype = HitType.Miss;
						}
					} else if (!this.controller.is_press(this._getLoc(note.loc) - 1)) {
						note.htype = HitType.Miss;
					}
					if (note.te <= 0) {
						hit(note.type, note.htype);
						return true;
					}
					hit_hold(note._f, note.htype);
					return false;
				} else {
          if (note.htype !== HitType.Unknown) {
            if (note.y <= 0) {
              hit(note.type, note.htype);
              return true;
            } else {
              note.y -=
								this.t_scale *
								config.player.speed *
								this.spec.speedList.speed[this.dlc];
            }
          } else if (
						(note.type === NoteType.Tap &&
							this.controller.is_press_once(this._getLoc(note.loc) - 1))
					) {
						note.htype = this.getHitType(note.ts, this.ts);
						hit(note.type, note.htype);
						return true;
					} else if (
            (note.type === NoteType.Drag &&
							this.controller.is_press(this._getLoc(note.loc) - 1))
          ) {
            note.htype = HitType.Pure;
            this.controller.clear_once(this._getLoc(note.loc) - 1);
            return false;
          }
				}
			}
      note.y -= this.t_scale * config.player.speed * this.spec.speedList.speed[this.dlc]
    }
    if (this.ts - note.ts - 1 > 160/1000) {
			this.scoreboard.hit(HitType.Miss);
			return true;
		}
    return false
  }
  updateNotes () {
    let delete_list: number[] = []
    for (const id in this.notes) {
      if (this.updateNote(id as unknown as number)) {
        delete_list.push(id as unknown as number)
      }
    }
    for (let i = delete_list.length - 1; i >= 0; --i) {
      this.notes.splice(delete_list[i], 1)
    }
  }
  _getTypeOfNote(loc: string, ts: number, te: number): NoteType {
    loc = loc.toLowerCase()
    if (te !== ts) return NoteType.Hold
    if (loc === "beat") return NoteType.Beat
    if (loc.indexOf("revolve") !== -1) return NoteType.Revolve
    if (loc.indexOf("spacing") !== -1) return NoteType.Spacing
    if (loc.indexOf('delta') !== -1) return NoteType.Delta
    if (loc[0] === "k") return NoteType.K
    if (loc[0] === "d") return NoteType.Drag
    return NoteType.Tap
  }
  createNotes () {
    while (this.ts >= this.spec.spectrum.ts[this.nlc]) {
      this.createNote(this._getTypeOfNote(
        this.spec.spectrum.loc[this.nlc],
        this.spec.spectrum.ts[this.nlc],
        this.spec.spectrum.te[this.nlc],
      ), this.spec.spectrum.loc[this.nlc], 
         this.spec.spectrum.ts[this.nlc], 
         this.spec.spectrum.te[this.nlc])
      ++this.nlc
    }
  }
  updateState () {
    this.state.truck_x2 += .08 * (/*-this.state.truck_count / 2*/-2 * this.state.truck_spacing - this.state.truck_x2)
    this.state.beat_animate += .08 * (0 - this.state.beat_animate)
    this.state.line_y += .08 * (this.state.to_line_y - this.state.line_y)
    this.state.direction += .08 * (this.state.to_direction - this.state.direction)
    this.state.truck_spacing += .08 * (this.state.to_truck_spacing - this.state.truck_spacing)
    this.state.truck_x += .08 * (this.state.to_truck_x - this.state.truck_x)
    let sp_ts = this.spec.speedList.ts[this.dlc + 1]
    if (sp_ts && this.ts - 1 > sp_ts) {
      ++this.dlc
    }
  }
  tick () {
    let new_t = (new Date()).getTime()
    this.dt = (new_t - this.last_t) / 1000
    this.last_t = new_t
    this.t_scale = this.dt * config.player.fps
    this.ts += this.dt
    this.createNotes()
    this.updateNotes()
    this.updateState()
    this.refresh()
    if (this.game_state && this.nlc >= this.spec.spectrum.loc.length && this.notes.length === 0) {
      this.end()
    }
  }
  start () {
    this.scoreboard.updateNoteCount(this.spec)
    setTimeout(() => this.spec.audio.play(), 1000)
    setTimeout(() => {
      this.gameloop = setInterval(() => this.tick(), 1000 / config.player.fps)
    }, 0)
    return this.canvas;
  }
  end () {
    if (this.gameloop === -1) return
    this.game_state = false
    setTimeout(() => {
      clearInterval(this.gameloop)
      alert("Game Over")
    }, 1000)
    /** @todo handle score board */
    
  }
}

export {
  Game
}