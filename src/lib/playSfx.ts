/**
 * Central hook for future UI / gameplay SFX (Web Audio or asset playback).
 * Call from gameplay or UI when you add sound; no-op until wired.
 */
export function playSfx(_kind: string, _opts?: { volume?: number }): void {
  void _kind;
  void _opts;
}
