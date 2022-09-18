/* async function loadAudio(path: string) {
  return new Promise<HTMLAudioElement>((resolve, reject) => {
    let audio = new Audio()
    audio.onload = () => {
      resolve(audio)
    }
    audio.onerror = e => {
      reject(e)
    }
    audio.src = path
  })
} */

function loadAudio(path: string) {  
  let audio = new Audio()
  audio.src = path
  return audio
}

const config = {
  debug: false,
  release: "1.2.0",
  player: {
    fps: 60,
    speed: 8,
    key : ["d", "f", "j", "k"],
    weight: [1.0, 0.8, 0.0]
  },
  sound: {
    tap_hit: loadAudio("/tap_hit.wav"),
    drag_hit: loadAudio("/drag_hit.wav"),
  },
}

export default config