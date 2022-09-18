class Canvas {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  _w: number
  _h: number
  constructor (canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d")!
    this._w = this.canvas.width
    this._h = this.canvas.height
  }
  clear () {
    this.ctx.clearRect(0, 0, this._w, this._h)
  }
  w () {
    return (x: number) => (x + 240) / 480 * this._w
  }
  h () {
    return (x: number) => (180 - x) / 360 * this._h
  }
  rotate (dir: number) {
    this.ctx.translate(this._w / 2, this._h / 2)
    this.ctx.rotate(dir)
    this.ctx.translate(-this._w / 2, -this._h / 2)
  }
  rect (x: number, y: number, w: number, h: number, dir: number, color: string, line_width: number) {
    this.ctx.save()
    this.ctx.translate(x, y)
    this.ctx.rotate(dir)
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = line_width
    this.ctx.strokeRect(-1/2*w, -h, w, h)
    this.ctx.restore()
  }
  rect_center (x: number, y: number, w: number, h: number, dir: number, color: string, line_width: number) {
    this.ctx.save()
    this.ctx.translate(x, y)
    this.ctx.rotate(dir)
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = line_width
    this.ctx.strokeRect(-1/2*w, -1/2*h, w, h)
    this.ctx.restore()
  }
  font (font: string) {
    this.ctx.font = font
  }
  text (text: string, x: number, y: number, align: number, color: string) {
    this.ctx.save()
    this.ctx.fillStyle = color
    this.ctx.fillText(text, x - align * this.ctx.measureText(text).width, y)
    this.ctx.restore()
  }
  global_alpha (alpha: number) {
    this.ctx.globalAlpha = alpha
  }
  save () {
    this.ctx.save()
  }
  restore () {
    this.ctx.restore()
  }
}

export default Canvas