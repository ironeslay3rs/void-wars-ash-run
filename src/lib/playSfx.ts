/**
 * Lightweight UI SFX via Web Audio. Fails quietly if AudioContext is unavailable or blocked.
 */

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC =
      window.AudioContext ??
      (
        window as unknown as {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (!AC) return null;
    sharedCtx ??= new AC();
    void sharedCtx.resume().catch(() => {});
    return sharedCtx;
  } catch {
    return null;
  }
}

function beep(
  ctx: AudioContext,
  freq: number,
  durationSec: number,
  volume: number,
  when: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  const v = Math.min(0.25, Math.max(0, volume));
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(v, when + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + durationSec);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + durationSec + 0.02);
}

export function playSfx(kind: string, opts?: { volume?: number }): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const baseVol = opts?.volume ?? 0.1;
  const t = ctx.currentTime;
  try {
    if (kind === "folio_unlock") {
      beep(ctx, 523.25, 0.07, baseVol, t);
      beep(ctx, 659.25, 0.09, baseVol * 0.95, t + 0.08);
    } else if (kind === "personal_best") {
      beep(ctx, 880, 0.1, baseVol * 1.1, t);
      beep(ctx, 1174.66, 0.08, baseVol * 0.85, t + 0.09);
    }
  } catch {
    /* ignore */
  }
}
