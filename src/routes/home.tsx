import { ExListItem } from '../components/extensionListItem'
import { SpListItem } from '../components/spectrumListItem'
import { loadSpectrum, loadExtension } from '../loader'
import { spListHook, exListHook } from '../app'
import config from '../config'

export function Home(params: {path: string}) {
  
  const [spList, addSpectrum, removeSpectrum] = spListHook
  const [exList, switchExState, setExConfigValue, addExtension, removeExtension] = exListHook
  return (
    <>
      <div class="p-10 h-screen overflow-y-scroll">
        <div class="w-96">
          <div class="mb-4">
            <h1 class="inline text-xl font-bold mr-4">Uploaded Spectrums</h1>
            <a href="javascript:void(0)"
              class="float-right p-1.5 border border-white rounded-lg hover:border-pink-500 hover:text-pink-500"
              onClick={() => {
                document.getElementById("spectrum")!.click()
              }}>Upload</a>
          </div>
          <div class="p-2">
            {spList.map((item, id) => <SpListItem id={id} spectrum={item} />)}
          </div>
        </div>
        <div class="w-96 mt-10">
          <div class="mb-4">
            <h1 class="inline text-xl font-bold mr-4">Uploaded Extensions</h1>
            <a href="javascript:void(0)"
              class="float-right p-1.5 border border-white rounded-lg hover:border-pink-500 hover:text-pink-500"
              onClick={() => {
                document.getElementById("extension")!.click()
              }}>Upload</a>
          </div>
          <div class="p-2">
            {exList.map((item, idx) => <ExListItem extension={item}
              idx={idx} switchExState={switchExState} setExConfigValue={setExConfigValue}/>)}
          </div>
        </div>
      </div>
      <span class="absolute bottom-2 right-3 text-gray-700 font-bold">
        Release {config.release} (c) Alltale Team by 9,18 2022
      </span>
      <input multiple class="hidden" type="file" id="spectrum" accept=".zip" onChange={e => {
        loadSpectrum(e, addSpectrum)
        loadExtension(e, addExtension)
      }} />
      <input multiple class="hidden" type="file" id="extension" accept=".zip" onChange={e => {
        loadSpectrum(e, addSpectrum)
        loadExtension(e, addExtension)
      }} />
    </>
  )
}
