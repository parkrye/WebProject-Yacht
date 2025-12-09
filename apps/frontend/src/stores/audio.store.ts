import { create } from 'zustand';
import { audioService, type SoundEffect, type BGMTrack } from '../services/audio.service';

interface AudioStore {
  // 상태
  bgmVolume: number;
  sfxVolume: number;
  bgmMuted: boolean;
  sfxMuted: boolean;
  initialized: boolean;

  // 초기화
  init: () => void;

  // 효과음 재생
  playSfx: (sound: SoundEffect) => void;

  // BGM 제어
  playBGM: (track: BGMTrack) => void;
  stopBGM: () => void;
  pauseBGM: () => void;
  resumeBGM: () => void;

  // 볼륨 제어
  setBgmVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;

  // 음소거 토글
  toggleBgmMute: () => void;
  toggleSfxMute: () => void;
}

export const useAudioStore = create<AudioStore>((set, get) => {
  // 초기 설정 로드
  const initialSettings = audioService.getSettings();

  return {
    bgmVolume: initialSettings.bgmVolume,
    sfxVolume: initialSettings.sfxVolume,
    bgmMuted: initialSettings.bgmMuted,
    sfxMuted: initialSettings.sfxMuted,
    initialized: false,

    init: () => {
      if (get().initialized) return;
      audioService.init();
      set({ initialized: true });
    },

    playSfx: (sound: SoundEffect) => {
      // 초기화 안 됐으면 자동 초기화
      if (!get().initialized) {
        get().init();
      }
      audioService.playSfx(sound);
    },

    playBGM: (track: BGMTrack) => {
      if (!get().initialized) {
        get().init();
      }
      audioService.playBGM(track);
    },

    stopBGM: () => {
      audioService.stopBGM();
    },

    pauseBGM: () => {
      audioService.pauseBGM();
    },

    resumeBGM: () => {
      audioService.resumeBGM();
    },

    setBgmVolume: (volume: number) => {
      audioService.setBgmVolume(volume);
      set({ bgmVolume: volume });
    },

    setSfxVolume: (volume: number) => {
      audioService.setSfxVolume(volume);
      set({ sfxVolume: volume });
    },

    toggleBgmMute: () => {
      const muted = audioService.toggleBgmMute();
      set({ bgmMuted: muted });
    },

    toggleSfxMute: () => {
      const muted = audioService.toggleSfxMute();
      set({ sfxMuted: muted });
    },
  };
});
