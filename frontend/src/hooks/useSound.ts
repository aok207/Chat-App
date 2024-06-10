export default function useSound(path: string): HTMLAudioElement {
  const audio = new Audio(path);
  audio.volume = 0.3;
  return audio;
}
