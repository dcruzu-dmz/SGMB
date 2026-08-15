import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'label',
  standalone: true,
})
export class LabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
