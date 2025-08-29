import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-product-filters',
  templateUrl: './product-filters.component.html',
  styleUrls: ['./product-filters.component.scss']
})
export class ProductFiltersComponent {
  @Output() filtersChanged = new EventEmitter<any>();

  filters = {
    brands: [] as string[],
    price: { lower: 100, upper: 5000 },
    energyClasses: [] as string[],
    btus: [] as string[]
  };

  onFiltersChanged() {
    this.filtersChanged.emit(this.filters);
  }

  toggleFilter(array: string[], value: string) {
    const index = array.indexOf(value);
    if (index === -1) {
      array.push(value);
    } else {
      array.splice(index, 1);
    }
    this.onFiltersChanged();
  }

  isSelected(array: string[], value: string): boolean {
    return array.includes(value);
  }
}
