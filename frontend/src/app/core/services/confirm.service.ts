import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  state = signal<ConfirmState | null>(null);

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise(resolve => {
      this.state.set({ ...options, resolve });
    });
  }

  respond(value: boolean): void {
    const current = this.state();
    if (!current) return;
    this.state.set(null);
    current.resolve(value);
  }
}
