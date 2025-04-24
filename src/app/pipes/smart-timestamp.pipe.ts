import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'smartTimestamp',
  standalone: true
})
export class SmartTimestampPipe implements PipeTransform {
  transform(value: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(value).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;

    return new Date(value).toLocaleString(); // fallback: date and time
  }
}
