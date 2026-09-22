import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

class HapticManager {
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cardcount_haptics');
      if (stored !== null) {
        this.enabled = stored === 'true';
      }
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('cardcount_haptics', String(val));
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public async impactLight() {
    if (!this.enabled) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  }

  public async impactMedium() {
    if (!this.enabled) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(25);
      }
    }
  }

  public async notificationSuccess() {
    if (!this.enabled) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([15, 50, 20]);
      }
    }
  }

  public async notificationError() {
    if (!this.enabled) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 40, 50]);
      }
    }
  }
}

export const haptics = new HapticManager();
