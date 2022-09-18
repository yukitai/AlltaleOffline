import JSZip from 'jszip'
import { ExListItemType, SpListItemType } from './types'
import { Hook, HookType, util as U } from './api/util'

async function loadFile(file: JSZip.JSZipObject) {
  return new Promise<string>((resolve, reject) => {
    file.async("blob").then(async blob => {
      const reader = new FileReader()
      //const blob = new Blob([file])
      reader.onload = function () {
        // @ts-ignore
        resolve(this.result)
      }
      reader.onerror = reject
      reader.readAsText(blob)
    }).catch(reject)
  })
}

function parseFloatList(list: string[]): number[] {
  let res = []
  for (const item of list) {
    res.push(parseFloat(item))
  }
  return res
}

function parseSpeedList(list: string[]): {ts: number[], speed: number[]} {
  let res: {ts: number[], speed: number[]} = { ts: [], speed: [] }
  for (let i = 0; i < list.length; i += 2) {
    res.ts.push(parseFloat(list[i]))
    res.speed.push(parseFloat(list[i + 1]))
  }
  return res
}

function loadSpectrum(e: Event, 
  addSpectrum: (sp: SpListItemType) => void
) {
  const ele = e.target!
  // @ts-ignore
  for (const i in ele.files) {
    load(i as unknown as number)
  }
  function load(i: number) {
    // @ts-ignore
    if (ele.files && typeof ele.files[i] === "object") {
    const reader = new FileReader()
    reader.onload = function () {
      JSZip.loadAsync(this.result).then(async zip => {
        if (zip.files[".mp3"] && zip.files["ts"] && zip.files["te"]
         && zip.files["config"] && zip.files["loc"]) {
          let config = (await loadFile(zip.files["config"])).split("\r\n")
          let ts = (await loadFile(zip.files["ts"])).split("\r\n")
          let te = (await loadFile(zip.files["te"])).split("\r\n")
          let loc = (await loadFile(zip.files["loc"])).split("\r\n")
          let spl
          if (zip.files["spl"]) {
            spl = (await loadFile(zip.files["spl"])).split("\r\n")
          } else {
            spl = ["0", "1"]
          }
          //console.log(config, loc, ts, te)
          let sp: SpListItemType = {
            name: config[0],
            bpm: parseInt(config[1]),
            audio: await (async () => {
              const audio = new Audio()
              audio.src = `data:audio/mp3;base64,${await zip.files[".mp3"].async("base64")}`
              return audio
            })(),
            speedList: parseSpeedList(spl),
            spectrum: {
              loc: loc,
              ts: parseFloatList(ts),
              te: parseFloatList(te),
            }
          }
          addSpectrum(sp)
        }
      })
    }
    // @ts-ignore
    reader.readAsBinaryString(ele.files[i])
    }
  }
}

function loadExtension(e: Event, 
  addExtension: (ex: ExListItemType) => void) {
  const ele = e.target!
  // @ts-ignore
  for (const i in ele.files) {
    load(i as unknown as number)
  }
  function load(i: number) {
    // @ts-ignore
    if (ele.files && typeof ele.files[i] === "object") {
      const reader = new FileReader()
      reader.onload = function () {
        JSZip.loadAsync(this.result).then(async zip => {
          if (zip.files["config.json"] && zip.files["index.js"]) {
            let config = JSON.parse(await loadFile(zip.files["config.json"]))
            let exBody = await loadFile(zip.files["index.js"])
            let hook: Hook[] = []
            let util = {...U, _hooks: hook}
            util = eval(`(function(Util){"use strict";${exBody};return Util;})`)(util)
            //console.log(config, loc, ts, te)
            let ex: ExListItemType = {
              active: true,
              name: config.name,
              util,
              hook,
              source: exBody,
              config: config.params
            }
            addExtension(ex)
          }
        })
      }
      // @ts-ignore
      reader.readAsBinaryString(ele.files[i])
    }
  }
}

export {
  loadSpectrum,
  loadExtension,
}