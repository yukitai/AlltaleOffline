import { useState } from 'preact/hooks'
import { SpListItemType } from '../types'

export function SpListItem(params: { spectrum: SpListItemType }) {
  const spectrum = params.spectrum
  return (
    <>
      <a href={`/play`} class="block mb-4 border-l-2 py-2 px-3 border-white hover:bg-white/10">
        <span class="font-bold">{spectrum.name}</span>
        <div class="text-sm">
          <span class="float-right text-pink-500">Informations of `{spectrum.name}`</span>
          <div class="clear-right mt-5"></div>
          <div>
            <span>BPM</span>
            <span class="text-gray-500 float-right">{spectrum.bpm}</span>
          </div>
        </div>
      </a>
    </>
  )
}
