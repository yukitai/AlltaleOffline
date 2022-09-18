import { useState } from "preact/hooks"
import { ExListItemType, SpListItemType } from "./types"

type spHookType = [
  SpListItemType[],
  (sp: SpListItemType) => void,
  (idx: number) => void,
]

type exHookType = [
  ExListItemType[], 
  (idx: number) => void,
  (idx: number, key: number, value: string) => void,
  (ex: ExListItemType) => void,
  (idx: number) => void,
]

export const spectrumHook = (): spHookType => {
  let [spList, setSpList] = useState<SpListItemType[]>([])
  function addSpectrum(sp: SpListItemType) {
    let spListNew = [
      ...spList, sp
    ]
    setSpList(spListNew)
    spList = spListNew
  }
  function removeSpectrum(idx: number) {
    let spListNew = [...spList]
    spListNew.splice(idx, 1)
    setSpList(spListNew)
    spList = spListNew
  }
  return [spList, addSpectrum, removeSpectrum]
}

export const extensionHook = (): exHookType => {
  let [exList, setExList] = useState<ExListItemType[]>([])
  const switchExState = (idx: number) => {
    let exListNew = [...exList]
    exListNew[idx].active = !exList[idx].active
    setExList(exListNew)
  }
  const setExConfigValue = (idx: number, cid: number, value: string) => {
    let exListNew = [...exList]
    exListNew[idx].config[cid].value = value
    setExList(exListNew)
  }
  function addExtension(ex: ExListItemType) {
    let exListNew = [
      ...exList, ex
    ]
    setExList(exListNew)
    exList = exListNew
  }
  function removeExtension(idx: number) {
    let spListNew = [...exList]
    spListNew.splice(idx, 1)
    setExList(spListNew)
  }
  return [exList, switchExState, setExConfigValue, addExtension, removeExtension]
}

export { type exHookType, type spHookType }