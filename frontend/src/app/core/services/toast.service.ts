import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  toasts = signal<Toast[]>([]);

  success(message: string): void {
    this.push('success', message, 3500);
  }

  error(message: string): void {
    this.push('error', message, 5000);
  }

  info(message: string): void {
    this.push('info', message, 3500);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private push(type: ToastType, message: string, duration: number): void {
    const id = this.nextId++;
    this.toasts.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}
