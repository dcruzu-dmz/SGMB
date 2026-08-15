import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private term$ = new BehaviorSubject<string>('');
  readonly term = this.term$.asObservable();

  setTerm(value: string): void {
    this.term$.next(value.trim().toLowerCase());
  }
}
