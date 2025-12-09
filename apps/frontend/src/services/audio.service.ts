// 오디오 타입 정의
export type SoundEffect =
  | 'dice-roll'      // 주사위 굴리기
  | 'dice-keep'      // 주사위 킵
  | 'score-select'   // 점수 선택
  | 'button-click'   // 버튼 클릭
  | 'game-start'     // 게임 시작
  | 'game-end'       // 게임 종료
  | 'turn-change'    // 턴 변경
  | 'yacht';         // 야찌!

export type BGMTrack = 'main' | 'game' | 'result';

// localStorage 키
const STORAGE_KEY_BGM_VOLUME = 'yacht_bgm_volume';
const STORAGE_KEY_SFX_VOLUME = 'yacht_sfx_volume';
const STORAGE_KEY_BGM_MUTED = 'yacht_bgm_muted';
const STORAGE_KEY_SFX_MUTED = 'yacht_sfx_muted';

// 기본값
const DEFAULT_BGM_VOLUME = 0.3;
const DEFAULT_SFX_VOLUME = 0.5;

class AudioService {
  private bgmAudio: HTMLAudioElement | null = null;
  private sfxCache: Map<string, HTMLAudioElement[]> = new Map();

  private bgmVolume: number = DEFAULT_BGM_VOLUME;
  private sfxVolume: number = DEFAULT_SFX_VOLUME;
  private bgmMuted: boolean = false;
  private sfxMuted: boolean = false;

  private currentBGM: BGMTrack | null = null;
  private initialized: boolean = false;

  constructor() {
    this.loadSettings();
  }

  // localStorage에서 설정 불러오기
  private loadSettings(): void {
    try {
      const bgmVol = localStorage.getItem(STORAGE_KEY_BGM_VOLUME);
      const sfxVol = localStorage.getItem(STORAGE_KEY_SFX_VOLUME);
      const bgmMute = localStorage.getItem(STORAGE_KEY_BGM_MUTED);
      const sfxMute = localStorage.getItem(STORAGE_KEY_SFX_MUTED);

      if (bgmVol !== null) this.bgmVolume = parseFloat(bgmVol);
      if (sfxVol !== null) this.sfxVolume = parseFloat(sfxVol);
      if (bgmMute !== null) this.bgmMuted = bgmMute === 'true';
      if (sfxMute !== null) this.sfxMuted = sfxMute === 'true';
    } catch (e) {
      console.warn('오디오 설정 로드 실패:', e);
    }
  }

  // 설정 저장
  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY_BGM_VOLUME, this.bgmVolume.toString());
      localStorage.setItem(STORAGE_KEY_SFX_VOLUME, this.sfxVolume.toString());
      localStorage.setItem(STORAGE_KEY_BGM_MUTED, this.bgmMuted.toString());
      localStorage.setItem(STORAGE_KEY_SFX_MUTED, this.sfxMuted.toString());
    } catch (e) {
      console.warn('오디오 설정 저장 실패:', e);
    }
  }

  // 오디오 파일 경로 반환
  private getSfxPath(sound: SoundEffect): string {
    return `/audio/sfx/${sound}.mp3`;
  }

  private getBgmPath(track: BGMTrack): string {
    return `/audio/bgm/${track}.mp3`;
  }

  // 효과음 미리 로드 (풀링)
  private preloadSfx(sound: SoundEffect, poolSize: number = 3): void {
    const path = this.getSfxPath(sound);
    const pool: HTMLAudioElement[] = [];

    for (let i = 0; i < poolSize; i++) {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = this.sfxMuted ? 0 : this.sfxVolume;
      pool.push(audio);
    }

    this.sfxCache.set(sound, pool);
  }

  // 초기화 (사용자 인터랙션 후 호출)
  init(): void {
    if (this.initialized) return;

    // 주요 효과음 미리 로드
    const sounds: SoundEffect[] = [
      'dice-roll',
      'dice-keep',
      'score-select',
      'button-click',
      'game-start',
      'game-end',
      'turn-change',
      'yacht'
    ];

    sounds.forEach(sound => this.preloadSfx(sound));
    this.initialized = true;
  }

  // 효과음 재생
  playSfx(sound: SoundEffect): void {
    if (this.sfxMuted) return;

    // 캐시된 오디오가 없으면 새로 로드
    if (!this.sfxCache.has(sound)) {
      this.preloadSfx(sound, 1);
    }

    const pool = this.sfxCache.get(sound);
    if (!pool || pool.length === 0) return;

    // 재생 가능한 오디오 찾기
    const audio = pool.find(a => a.paused || a.ended) || pool[0];
    audio.currentTime = 0;
    audio.volume = this.sfxVolume;
    audio.play().catch(err => {
      // 자동 재생 차단 등의 에러 무시
      console.debug('효과음 재생 실패:', err);
    });
  }

  // BGM 재생
  playBGM(track: BGMTrack): void {
    // 같은 트랙이면 무시
    if (this.currentBGM === track && this.bgmAudio && !this.bgmAudio.paused) {
      return;
    }

    // 기존 BGM 정지
    this.stopBGM();

    const path = this.getBgmPath(track);
    this.bgmAudio = new Audio(path);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this.bgmMuted ? 0 : this.bgmVolume;
    this.currentBGM = track;

    this.bgmAudio.play().catch(err => {
      console.debug('BGM 재생 실패:', err);
    });
  }

  // BGM 정지
  stopBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.bgmAudio = null;
    }
    this.currentBGM = null;
  }

  // BGM 일시정지
  pauseBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  // BGM 재개
  resumeBGM(): void {
    if (this.bgmAudio && this.currentBGM) {
      this.bgmAudio.play().catch(() => {});
    }
  }

  // BGM 볼륨 설정
  setBgmVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmAudio && !this.bgmMuted) {
      this.bgmAudio.volume = this.bgmVolume;
    }
    this.saveSettings();
  }

  // 효과음 볼륨 설정
  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.sfxCache.forEach(pool => {
      pool.forEach(audio => {
        if (!this.sfxMuted) {
          audio.volume = this.sfxVolume;
        }
      });
    });
    this.saveSettings();
  }

  // BGM 음소거 토글
  toggleBgmMute(): boolean {
    this.bgmMuted = !this.bgmMuted;
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmMuted ? 0 : this.bgmVolume;
    }
    this.saveSettings();
    return this.bgmMuted;
  }

  // 효과음 음소거 토글
  toggleSfxMute(): boolean {
    this.sfxMuted = !this.sfxMuted;
    this.sfxCache.forEach(pool => {
      pool.forEach(audio => {
        audio.volume = this.sfxMuted ? 0 : this.sfxVolume;
      });
    });
    this.saveSettings();
    return this.sfxMuted;
  }

  // BGM 음소거 상태 설정
  setBgmMuted(muted: boolean): void {
    this.bgmMuted = muted;
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmMuted ? 0 : this.bgmVolume;
    }
    this.saveSettings();
  }

  // 효과음 음소거 상태 설정
  setSfxMuted(muted: boolean): void {
    this.sfxMuted = muted;
    this.sfxCache.forEach(pool => {
      pool.forEach(audio => {
        audio.volume = this.sfxMuted ? 0 : this.sfxVolume;
      });
    });
    this.saveSettings();
  }

  // 현재 설정 가져오기
  getSettings() {
    return {
      bgmVolume: this.bgmVolume,
      sfxVolume: this.sfxVolume,
      bgmMuted: this.bgmMuted,
      sfxMuted: this.sfxMuted,
    };
  }

  // 현재 BGM 가져오기
  getCurrentBGM(): BGMTrack | null {
    return this.currentBGM;
  }
}

// 싱글톤 인스턴스 export
export const audioService = new AudioService();
