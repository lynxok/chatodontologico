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
  console.log('🔔 notifyNewMessage called', { sender, message });

  // 1. Show internal toast IMMEDIATELY (Fallback)
  try {
    toast.success(`Mensaje de ${sender}`, {
      description: message,
      duration: 5000,
    });
  } catch (e) {
    console.error('Toast failed:', e);
  }

  // 2. Play audio
  try {
    engine.play(tone);
  } catch (e) {
    console.error('Sound failed:', e);
  }

  // 3. Native OS Notification
  // @ts-ignore
  if (window.electron && window.electron.showNotification) {
    // @ts-ignore
    window.electron.showNotification(`Mensaje de ${sender}`, message);
  }

  // 4. Flash Taskbar Icon
  // @ts-ignore
  if (window.electron && window.electron.notifyMessage) {
    // @ts-ignore
    window.electron.notifyMessage();
  }
};
