import Router from 'preact-router'
import AsyncRoute from 'preact-async-route'
import { Home } from './routes/home'
import { Player } from './routes/player'
import { NotFound } from './routes/404'
import { spectrumHook, extensionHook, spHookType, exHookType } from './states'

let spListHook: spHookType, exListHook: exHookType

export { spListHook, exListHook }


export function App() {
  spListHook = spectrumHook()
  exListHook = extensionHook()
  return (
    <>
      <div class="-z-50 absolute flex flex-col justify-center items-center w-screen h-screen">
        <h1 class="text-7xl text-gray-500/20 font-bold text-shadow-lg">Alltale II System</h1>
      </div>
      <Router>
        <NotFound default />
        <Home path="/" />
        <Player path="/spec/:id" />
      </Router>
    </>
  )
}
