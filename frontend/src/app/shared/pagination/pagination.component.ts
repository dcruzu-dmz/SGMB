import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Output() pageChange = new EventEmitter<number>();

  protected readonly Math = Math;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  goTo(p: number): void {
    const clamped = Math.min(Math.max(1, p), this.totalPages);
    if (clamped !== this.page) this.pageChange.emit(clamped);
  }
}
