enum HookType {
  "BeforeLoadExtension", 
  "BeforeInitExtension",
  "ExtensionOnload",
  "BeforePlayerInit",
  "OnPlayerStart",
  "OnNoteUpdate",
  "OnHitNote",
  "OnGameOver",
  "OnRedirect",
}

type Hook = {
  T: HookType,
  F: (args: any[]) => void
}

function getHook(H: Hook[], T: HookType): [ number, Hook ] | undefined {
  for (let i = 0; i < H.length; ++i) {
    if (H[i].T === T) {
      return [i, H[i]]
    }
  }
  return
}

const util = {
  _hooks: [] as Hook[],
  onload: function () {},
  ondisable: function () {},
  onenable: function () {},
  hook (hookType: HookType, func: (args: any[]) => void) {
    let hook = getHook(this._hooks, hookType)
    if (hook) {
      hook[1].F = func
      return
    }
    this._hooks.push({
      T: hookType,
      F: func,
    })
  },
  $hook (hookType: HookType) {
    let hook = getHook(this._hooks, hookType)
    if (hook) {
      this._hooks.splice(hook[0], 1)
      return
    }
  }
}

export {HookType, type Hook, util}