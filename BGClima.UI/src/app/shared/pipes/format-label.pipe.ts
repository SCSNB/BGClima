import { Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';

@Pipe({
  name: 'formatLabel',
  standalone: true
})
export class FormatLabelPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    // Check if we're on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    
    if (!isMobile) {
      // For desktop, return the value as is (on one line)
      return value;
    }
    
    // For mobile, split the text and parentheses
    const parts = value.split('(');
    
    if (parts.length === 1) {
      return value; // No parentheses found
    }
    
    const beforeParen = parts[0].trim();
    const afterParen = value.substring(value.indexOf('('));
    
    return `${beforeParen}<br><span class="parenthetical">${afterParen}</span>`;
  }
}
