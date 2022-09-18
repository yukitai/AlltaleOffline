type Key = string
type KeySettings = Key[]
type KeyStates = {
  press: boolean,
  once: boolean,
  _timer: number,
}[]

class Controll {
  key: KeySettings
  state: KeyStates
  constructor (key: KeySettings) {
    this.key = key
    this.state = [
      {press: false, once: false, _timer: 0},
      {press: false, once: false, _timer: 0},
      {press: false, once: false, _timer: 0},
      {press: false, once: false, _timer: 0},
    ]
    document.body.onkeydown = e => {
      const idx = this.key.indexOf(e.key)
      if (idx !== -1) {
        this.state[idx].press = true
        this.state[idx].once = true
        this.state[idx]._timer = (new Date()).getTime() + 20
      }
    }
    document.body.onkeyup = e => {
      const idx = this.key.indexOf(e.key)
      if (idx !== -1) {
        this.state[idx].press = false
        this.state[idx].once = false
      }
    }
  }
  check_once (idx: number) {
    if ((new Date()).getTime() >= this.state[idx]._timer) {
      this.state[idx].once = false
    }
  }
  is_press (idx: number) {
    return this.state[idx].press
  }
  is_press_once (idx: number) {
    this.check_once(idx)
    if (this.state[idx].once) {
      this.state[idx].once = false
      return true
    }
    return false
  }
  clear_once (idx: number) {
    this.state[idx].once = false
  }
}

export {
  Controll
}