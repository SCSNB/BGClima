import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss']
})
export class FilterDialogComponent {
  @Input() isMobile = false;
  @Input() showClearButton = true;
  @Input() title = 'Филтри';

  @Output() apply = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onApply() {
    this.apply.emit();
  }

  onClear() {
    this.clear.emit();
  }

  onClose() {
    this.close.emit();
  }
}
