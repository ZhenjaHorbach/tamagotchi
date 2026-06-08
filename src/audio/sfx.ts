// Tiny chiptune sound-effects engine. Plain module (non-React) so any layer can
// fire a blip on an interaction. Players are created lazily and reused — each
// call just rewinds and replays. All playback is gated by the sound setting.

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { soundEnabled } from '@/state/settings-store';

export type SfxName = 'tap' | 'feed' | 'play' | 'sleep' | 'greet' | 'camera';

const SOURCES: Record<SfxName, number> = {
  tap: require('../../assets/sounds/tap.wav'),
  feed: require('../../assets/sounds/feed.wav'),
  play: require('../../assets/sounds/play.wav'),
  sleep: require('../../assets/sounds/sleep.wav'),
  greet: require('../../assets/sounds/greet.wav'),
  camera: require('../../assets/sounds/camera.wav'),
};

const players: Partial<Record<SfxName, AudioPlayer>> = {};
let audioModeReady = false;

function ensureAudioMode() {
  if (audioModeReady) return;
  audioModeReady = true;
  // SFX should be heard even with the ringer on silent.
  setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});
}

function getPlayer(name: SfxName): AudioPlayer {
  let p = players[name];
  if (!p) {
    p = createAudioPlayer(SOURCES[name]);
    p.volume = 0.7;
    players[name] = p;
  }
  return p;
}

/** Play a one-shot effect (no-op when sound is disabled). */
export function playSfx(name: SfxName): void {
  if (!soundEnabled()) return;
  ensureAudioMode();
  try {
    const p = getPlayer(name);
    p.seekTo(0);
    p.play();
  } catch {
    // a single dropped blip is never worth crashing an interaction over
  }
}
