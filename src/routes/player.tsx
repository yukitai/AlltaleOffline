import { spListHook, exListHook } from '../app'
import { Game } from '../runtime/game'


export function Player(params: {id: number, path: string}) {

  const [spList] = spListHook
  const [exList] = exListHook
  const id = params.id
  setTimeout(() => {
    const game = new Game(spList[id], document.getElementById("game-canvas")! as HTMLCanvasElement)
    game.start()
  }, 1000)
  return (
    <>
      <div class="w-full h-full">
        <canvas id="game-canvas" class="w-full h-full" width={document.body.offsetWidth} height={document.body.offsetHeight}></canvas>
        <span class="absolute bottom-2 right-3 text-gray-700 font-bold">Alltale Player by Alltale Team</span>
      </div>
    </>
  )
}
