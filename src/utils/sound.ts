// Gentle synthesized feedback sounds via Web Audio — no audio files needed.
// The AudioContext is created lazily inside a user-gesture handler (button
// tap), which keeps autoplay policies happy on mobile browsers.

let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function playNote(
  audio: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  type: OscillatorType,
  volume: number,
) {
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0, startAt)
  gain.gain.linearRampToValueAtTime(volume, startAt + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(startAt)
  osc.stop(startAt + duration + 0.05)
}

/** Cheerful ascending chime. */
export function playCorrect() {
  const audio = getContext()
  if (!audio) return
  const now = audio.currentTime
  playNote(audio, 523.25, now, 0.15, 'sine', 0.25) // C5
  playNote(audio, 659.25, now + 0.1, 0.15, 'sine', 0.25) // E5
  playNote(audio, 783.99, now + 0.2, 0.25, 'sine', 0.25) // G5
}

/** Soft, non-scary "try again" tone. */
export function playWrong() {
  const audio = getContext()
  if (!audio) return
  const now = audio.currentTime
  playNote(audio, 311.13, now, 0.2, 'triangle', 0.2) // Eb4
  playNote(audio, 233.08, now + 0.15, 0.3, 'triangle', 0.2) // Bb3
}
