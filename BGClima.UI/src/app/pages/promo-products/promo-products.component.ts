import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductDto, ProductService } from '../../services/product.service';

interface Badge { bg: string; color: string; text: string }
interface Spec { icon: string; label: string; value: string }

type ProductCard = ProductDto & {
  badges?: Badge[];
  specs?: Spec[];
  priceEur?: number | null;
  oldPriceEur?: number | null;
};

@Component({
  selector: 'app-promo-products',
  templateUrl: './promo-products.component.html',
  styleUrls: ['./promo-products.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule]
})
export class PromoProductsComponent implements OnInit {
  title = 'ПРОМО оферти';
  loading = true;
  products: ProductCard[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadPromoProducts();
  }

  private toEur(bgn?: number | null): number | null {
    if (bgn === undefined || bgn === null) return null;
    const rate = 1.95583; // BGN -> EUR фиксиран курс
    return +(bgn / rate).toFixed(2);
  }

  private loadPromoProducts(): void {
    this.productService.getProducts().subscribe({
      next: (all) => {
        const filtered = (all || []).filter(p => !!p.isOnSale);
        this.products = filtered.map(p => {
          const priceEur = this.toEur(p.price);
          const oldPriceEur = this.toEur(p.oldPrice ?? undefined);

          // WiFi badge detection (same as Offers)
          const hasWifi = (p.attributes || []).some(a => {
            const key = (a.attributeKey || '').toLowerCase();
            const value = (a.attributeValue || '').toString().toLowerCase().trim();
            return (key.includes('wi-fi') || key.includes('wifi') || key.includes('wi fi')) &&
                   key.includes('модул') &&
                   (value === 'да' || value === 'da' || value === 'yes' || value === 'true');
          });

          const badges: Badge[] = [];
          if (p.isNew) badges.push({ text: 'НОВО', bg: '#F54387', color: '#fff' });
          if (p.isOnSale) badges.push({ text: 'ПРОМО', bg: '#E6003E', color: '#fff' });
          if (hasWifi) badges.push({ text: 'WiFi', bg: '#3B82F6', color: '#fff' });

          const btuStr = (this.getAttrFormatted(p, 'BTU') || '').toString();
          const btuThousands = parseInt(btuStr.replace(/\D+/g, ''), 10) || 0;

          const specs: Spec[] = [
            { icon: 'bolt', label: 'Мощност', value: btuThousands > 0 ? String(btuThousands) : '' },
            { icon: 'eco', label: 'Клас', value: p.energyClass?.class || this.getAttrFormatted(p, 'Клас') || '' },
            { icon: 'ac_unit', label: 'Охлаждане', value: this.getAttrFormatted(p, 'Охлаждане') || '' },
            { icon: 'wb_sunny', label: 'Отопление', value: this.getAttrFormatted(p, 'Отопление') || '' },
          ];

          return { ...p, badges, specs, priceEur, oldPriceEur } as ProductCard;
        });
        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.loading = false;
      }
    });
  }

  // Mirror OffersComponent attribute parsing
  private getAttrFormatted(p: ProductDto, key: string): string {
    const normalizedKey = key.trim().toLowerCase();

    if (normalizedKey === 'btu') {
      if (p.btu?.value) {
        const btuMatch = p.btu.value.toString().match(/(\d+(\.\d+)?)/);
        if (btuMatch) {
          const btuValue = parseFloat(btuMatch[0]);
          return Math.round(btuValue / 1000).toString();
        }
        return p.btu.value.toString();
      }
      const btuAttr = (p.attributes || []).find(a => {
        const attrKey = (a.attributeKey || '').trim().toLowerCase();
        return attrKey === 'btu' || attrKey === 'btu/h' || attrKey === 'btu\/h' || attrKey.includes('btu');
      });
      if (btuAttr?.attributeValue) {
        const attrValue = btuAttr.attributeValue.toString();
        const btuMatch = attrValue.match(/(\d+(\.\d+)?)/);
        if (btuMatch) {
          const btuValue = parseFloat(btuMatch[0]);
          return Math.round(btuValue / 1000).toString();
        }
        return attrValue;
      }
      return '';
    }

    if (normalizedKey === 'охлаждане' || normalizedKey === 'отопление') {
      const attrKey = normalizedKey === 'охлаждане'
        ? 'Отдавана мощност на охлаждане (Мин./Ном./Макс)'
        : 'Отдавана мощност на отопление (Мин./Ном./Макс)';

      const found = (p.attributes || []).find(a => (a.attributeKey || '').trim() === attrKey);
      if (found?.attributeValue) {
        const value = found.attributeValue.toString();
        const matches = value.match(/(\d+[\.,]?\d*)/g);
        if (matches && matches.length >= 3) {
          const values = matches.map(v => parseFloat(v.replace(',', '.')));
          const max = Math.max(...values);
          return max.toFixed(1).replace(/\.?0+$/, '').replace('.', ',');
        }
        return value;
      }
      return '';
    }

    const found = (p.attributes || []).find(a => (a.attributeKey || '').trim().toLowerCase() === normalizedKey);
    return (found?.attributeValue || '').toString();
  }
}
