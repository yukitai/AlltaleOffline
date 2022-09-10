import { Hook, util } from './api/util'

export type SpListItemType = {
  name: string,
  bpm: number,
  // @ts-ignore
  audio: Audio,
  speedList: {
    ts: number[],
    speed: number[],
  },
  spectrum: {
    loc: string[],
    ts: number[],
    te: number[],
  },
}

export type ExListItemType = {
  active: boolean,
  util: typeof util,
  hook: Hook[],
  name: string,
  source: string,
  config: {
    key: string,
    name: string,
    value: string,
  }[]
}