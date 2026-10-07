import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'sgmb-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  dark = signal<boolean>(this.readStored());

  constructor() {
    effect(() => {
      const isDark = this.dark();
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      try {
        localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
      } catch {
        // localStorage puede fallar en modo privado; el tema simplemente no persiste
      }
    });
  }

  toggle(): void {
    this.dark.set(!this.dark());
  }

  private readStored(): boolean {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'dark') return true;
      if (localStorage.getItem(STORAGE_KEY) === 'light') return false;
    } catch {
      // ignorar, usar prefers-color-scheme como respaldo
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
