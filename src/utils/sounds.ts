import { Howl } from 'howler';

export const SOUNDS = {
  correct: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'], volume: 0.5 }),
  incorrect: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2959/2959-preview.mp3'], volume: 0.5 }),
  click: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'], volume: 0.5 })
};

export function playSound(key: keyof typeof SOUNDS) {
  const isMuted = localStorage.getItem('quiz_muted') === 'true';
  if (isMuted) return;
  SOUNDS[key].play();
}
