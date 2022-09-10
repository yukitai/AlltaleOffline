import { useState } from 'preact/hooks'
import { ExListItemType } from '../types'

export function ExListItem(params: {
  idx: number,
  extension: ExListItemType,
  switchExState: (idx: number) => void,
  setExConfigValue: (idx: number, key: number, value: string) => void,
}) {
  const { idx, extension, switchExState, setExConfigValue } = params
  return (
    <>
      <div class="mb-4 border-l-2 py-2 px-3 border-white hover:bg-white/10">
        <span className={`font-bold ${
          extension.active ? "text-white" : "text-gray-500"
        }`}>{extension.name}</span>
        <a href="javascript:void(0)" class="float-right transition text-white hover:text-pink-500"
          onClick={()=>{switchExState(idx)}}>
          {extension.active ? "disable" : "enable"}
        </a>
        {
          extension.active ? (
            <div>
              <span class="float-right text-sm text-pink-500">Configs of `{extension.name}`</span>
              <div class="w-full text-sm">
                <div class="h-4"></div>
                {extension.config.length > 0 ? extension.config.map(({key, name, value}, cid) => (
                  <div class="clear-right mt-2">
                    <label htmlFor={key}>{name}</label>
                    <input class="px-2 max-w-96 w-64 float-right bg-black/0 border-b rounded-none outline-none" 
                      type="text" name={key} onChange={e => {
                      e.preventDefault()
                      //@ts-ignore
                      setExConfigValue(idx, cid, e.target!.value)
                    }} value={value} />
                  </div>
                )) : (
                  <span class="mt-2 block text-center clear-right text-gray-500">(Empty)</span>
                )}
              </div>
            </div>
          ) : undefined
        }
      </div>
    </>
  )
}