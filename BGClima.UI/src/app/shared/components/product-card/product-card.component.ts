import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ProductDto } from 'src/app/services/product.service';
import { CompareService } from 'src/app/services/compare.service';

type Badge = { bg: string; color: string; text: string };
type Spec = { icon: string; label: string; value: string };

export interface ProductCard extends ProductDto {
  badges?: Badge[];
  specs?: Spec[];
  priceEur?: number | null;
  oldPriceEur?: number | null;
}

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() product!: ProductCard;
  @Output() compareClick = new EventEmitter<{event: MouseEvent, product: ProductCard}>();
  
  isInCompareList = false;
  
  constructor(private compareService: CompareService) {}
  
  ngOnInit() {
    if (this.product?.id) {
      this.isInCompareList = this.compareService.isInCompareList(this.product.id);
    }
  }

  onCompareClick(event: MouseEvent, product: ProductCard): void {
    event.preventDefault();
    event.stopPropagation();
    this.compareService.toggleCompare(product);
    this.isInCompareList = this.compareService.isInCompareList(product.id);
    this.compareClick.emit({event, product});
  }
}
