import { toast } from 'sonner';

export const playNotificationSound = (tone: 'low' | 'mid' | 'high') => {
  const frequencies = {
    low: 261.63, // C4
    mid: 440.00, // A4
    high: 880.00 // A5
  };

  const context = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequencies[tone], context.currentTime);
  
  gainNode.gain.setValueAtTime(0, context.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.2);
};

export const showNewMessageToast = (sender: string, message: string, tone: 'low' | 'mid' | 'high' = 'mid') => {
  playNotificationSound(tone);
  
  toast.custom(() => (
    <div className="bg-white border-2 border-tiffany-green p-4 rounded-2xl shadow-xl flex items-center gap-4 max-w-sm animate-in slide-in-from-right-8">
      <div className="w-10 h-10 rounded-full bg-tiffany-soft flex items-center justify-center text-tiffany-green font-bold shrink-0">
        {sender.charAt(0)}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-xs font-bold text-tiffany-green uppercase tracking-wider">{sender}</p>
        <p className="text-sm text-text-primary truncate">{message}</p>
      </div>
    </div>
  ), {
    duration: 4000,
  });
};
