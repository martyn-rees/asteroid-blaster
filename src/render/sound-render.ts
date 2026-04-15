type SoundEffect = "shoot" | "rock-explosion";

export function getSoundForAction(action: SoundEffect): string {
  if (action === "shoot") {
    return "./sounds/shoot.wav";
  } else if (action === "rock-explosion") {
    return "./sounds/rock-explosion.mp3";
  } else {
    console.error(`Sound action ${action} not recognised`);
    return "";
  }
}

export function playSound(soundDescription: SoundEffect) {
  const soundurl: string = getSoundForAction(soundDescription);
  if (soundurl !== "") {
    const sound = new Audio(soundurl);
    sound.volume = 0.1;
    sound.load();
    sound.play();
  }
}
