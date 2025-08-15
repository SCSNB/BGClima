import { Component, OnInit } from '@angular/core';
import { ProductDto, ProductService } from '../../services/product.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersComponent implements OnInit {
  featured: Array<{
    id: number;
    image: string;
    title: string;
    priceBgn: number;
    priceEur: number;
    oldPriceBgn?: number | null;
    oldPriceEur?: number | null;
    brandText: string;
    badges: { text: string; bg: string; color: string }[];
    specs: { label: string; value: string; icon: string }[];
  }> = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((products) => {
      const items = products.filter(p => !!p.isFeatured);
      const top = items.slice(0, 8);
      this.featured = top.map(p => this.mapToCard(p));
    });
  }

  private mapToCard(p: ProductDto) {
    const bgn = p.price ?? 0;
    const eur = this.toEur(bgn);
    const oldBgn = p.oldPrice ?? null;
    const oldEur = oldBgn != null ? this.toEur(oldBgn) : null;

    const getAttr = (key: string): string => {
      const found = (p.attributes || []).find(a => (a.attributeKey || '').trim().toLowerCase() === key.toLowerCase());
      return (found?.attributeValue ?? '0').toString();
    };

    const hasWifi = (p.attributes || []).some(a => (a.attributeKey + ' ' + a.attributeValue).toLowerCase().includes('wifi'));
    const badges: { text: string; bg: string; color: string }[] = [];
    if (p.isNew) badges.push({ text: 'НОВО', bg: '#F54387', color: '#fff' });
    if (p.isOnSale) badges.push({ text: 'ПРОМО', bg: '#E6003E', color: '#fff' });
    if (hasWifi) badges.push({ text: 'WiFi', bg: '#3B82F6', color: '#fff' });

    return {
      id: p.id,
      image: p.imageUrl || 'assets/solar-panel-placeholder.jpg',
      title: p.name,
      priceBgn: bgn,
      priceEur: eur,
      oldPriceBgn: oldBgn,
      oldPriceEur: oldEur,
      brandText: p.brand?.name || '',
      badges,
      specs: [
        { label: 'Мощност', value: getAttr('Мощност'), icon: 'bolt' },
        { label: 'Клас', value: p.energyClass?.class || getAttr('Клас') || 'A+', icon: 'eco' },
        { label: 'Охлаждане', value: getAttr('Охлаждане'), icon: 'ac_unit' },
        { label: 'Отопление', value: getAttr('Отопление'), icon: 'wb_sunny' }
      ]
    };
  }

  private toEur(amountBgn: number): number {
    const rate = 1.95583;
    return Math.round((amountBgn / rate) * 100) / 100;
  }
}
