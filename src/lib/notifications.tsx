import { toast } from 'sonner';

type ToneType = 'grave' | 'media' | 'aguda';

class SoundEngine {
  private audioCtx: AudioContext | null = null;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  play(tone: ToneType = 'media') {
    try {
      this.init();
      if (!this.audioCtx) return;

      const oscillator = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      oscillator.type = 'sine';
      
      // Set frequency based on preference
      switch (tone) {
        case 'grave':
          oscillator.frequency.setValueAtTime(220, this.audioCtx.currentTime); // A3
          break;
        case 'aguda':
          oscillator.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5
          break;
        case 'media':
        default:
          oscillator.frequency.setValueAtTime(440, this.audioCtx.currentTime); // A4
          break;
      }

      gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      oscillator.start();
      oscillator.stop(this.audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  }
}

const engine = new SoundEngine();

export const notifyNewMessage = (sender: string, message: string, tone: ToneType = 'media') => {
  // 1. Play premium audio synthesis
  engine.play(tone);

  // 2. Show glassmorphism toast
  toast.success(`Mensaje de ${sender}`, {
    description: message,
    duration: 5000,
  });
};
