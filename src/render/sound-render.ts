type SoundEffect = "shoot" | "rock-explosion";

const soundFiles: Record<SoundEffect, string> = {
  shoot: "./sounds/shoot.wav",
  "rock-explosion": "./sounds/rock-explosion.mp3",
};

const audioCache = new Map<SoundEffect, HTMLAudioElement>();

function preloadSounds() {
  for (const [action, url] of Object.entries(soundFiles) as [
    SoundEffect,
    string,
  ][]) {
    const audio = new Audio(url);
    audio.volume = 0.1;
    audio.load();
    audioCache.set(action, audio);
  }
}

preloadSounds();

export function playSound(action: SoundEffect) {
  const source = audioCache.get(action);
  if (!source) return;
  const sound = source.cloneNode(true) as HTMLAudioElement;
  sound.play();
}
