import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ProductDto } from 'src/app/services/product.service';
import { ProductCard } from '../product-card/product-card.component';
import { CompareService } from 'src/app/services/compare.service';

type Badge = { bg: string; color: string; text: string };
type Spec = { icon: string; label: string; value: string };

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.scss']
})
export class ProductGridComponent {
  @Input() products: ProductDto[] | null = [];
  @Output() productClick = new EventEmitter<ProductDto>();

  constructor(private router: Router, private compareService: CompareService) { }

  transformProduct(product: ProductDto): ProductCard {
    if (!product) {
      throw new Error('Product cannot be null or undefined');
    }
     const priceEur = this.toEur(product.price);
     const oldPriceEur = this.toEur(product.oldPrice ?? undefined);
     const badges: Badge[] = [];
      

    if (product.isNew) badges.push({ text: 'НОВО', bg: '#FF4D8D', color: '#fff' });
    if (product.isOnSale) badges.push({ text: 'ПРОМО', bg: '#E6003E', color: '#fff' });
    if (this.hasWifi(product)) badges.push({ text: 'WiFi', bg: '#3B82F6', color: '#fff' });

    const btuThousands = this.getBtuInThousands(product);
      const isHeatPump = product.productTypeId == 9;
      const coolingAttrKey = 'Отдавана мощност на охлаждане (Мин./Ном./Макс)';
      const heatingAttrKey = 'Отдавана мощност на отопление (Мин./Ном./Макс)';

      const extractNominalNumeric = (raw: string): string => {
        if (!raw) return '';
        const matches = raw.match(/(\d+[\.,]?\d*)/g);
        if (matches && matches.length >= 3) {
          const nums = matches.map(v => parseFloat(v.replace(',', '.')));
          const nominal = nums[1];
          return nominal.toFixed(1).replace(/\.?0+$/, '').replace('.', ',');
        }
        if (matches && matches.length === 1) {
          const v = parseFloat(matches[0].replace(',', '.'));
          return v.toFixed(1).replace(/\.?0+$/, '').replace('.', ',');
        }
        return raw;
      };

      const findAttr = (key: string) => (product.attributes || []).find(a => (a.attributeKey || '').trim() === key)?.attributeValue?.toString() || '';
      const coolingRaw = findAttr(coolingAttrKey) || product.coolingCapacity || '';
      const heatingRaw = findAttr(heatingAttrKey) || product.heatingCapacity || '';

      const cooling = isHeatPump ? extractNominalNumeric(coolingRaw) : (this.getMaxMinNomMax(product, coolingAttrKey) || product.coolingCapacity || '');
      const heating = isHeatPump ? extractNominalNumeric(heatingRaw) : (this.getMaxMinNomMax(product, heatingAttrKey) || product.heatingCapacity || '');

    const specs: Spec[] = [];
        return {
        ...product,
        priceEur,
        oldPriceEur,
        badges,
        specs: [
          { icon: 'bolt', label: 'Мощност', value: btuThousands > 0 ? String(btuThousands) : '' },
          { icon: 'eco', label: 'Клас', value: product.energyClass?.class || '' },
          { icon: 'ac_unit', label: 'Охлаждане', value: cooling },
          { icon: 'wb_sunny', label: 'Отопление', value: heating }
        ].filter(s => s.value)
      } as ProductCard;;
  }

  // Compare functionality is now handled directly in the ProductCardComponent

  onProductClick(event: Event, product: ProductDto): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (product?.id) {
      this.router.navigate(['/product', product.id]);
      this.productClick.emit(product);
    }
  }

  private hasWifi(p: ProductDto): boolean {
    const attrs = p?.attributes || [];

    const isAffirmative = (v: string) => {
      const val = (v || '').toString().toLowerCase().trim();
      return val === 'да' || val === 'yes' || val === 'true' || val === 'wifi_yes' || val === 'da';
    };

    // 1) Търсим изрично Wi‑Fi модул със стойност "да"
    const explicitWifi = attrs.find(a => {
      const key = (a.attributeKey || '').toLowerCase();
      return (key.includes('wi-fi') || key.includes('wifi')) && (key.includes('модул') || key.includes('module'));
    });
    if (explicitWifi && isAffirmative(String(explicitWifi.attributeValue))) {
      return true;
    }

    // 2) Алтернативно: точният ключ "Wi-Fi модул в комплекта"
    const exactWifi = attrs.find(a => (a.attributeKey || '').trim() === 'Wi-Fi модул в комплекта');
    if (exactWifi && isAffirmative(String(exactWifi.attributeValue))) {
      return true;
    }

    // 3) Ако няма изричен модул с "да", проверяваме АКЦЕНТИ да съдържат Wi‑Fi
    const accentMentionsWifi = attrs.some(a => {
      const keyUp = (a.attributeKey || '').toUpperCase();
      if (!(keyUp === 'АКЦЕНТИ' || keyUp.includes('АКЦЕНТ'))) return false;
      const val = (a.attributeValue || '').toString().toLowerCase();
      return val.includes('wi-fi') || val.includes('wifi');
    });
    if (accentMentionsWifi) return true;

    return false;
  }

   private toEur(bgn?: number | null): number | null {
    if (bgn === undefined || bgn === null) return null;
    const rate = 1.95583; // BGN -> EUR фиксиран курс
    return +(bgn / rate).toFixed(2);
  }

  // Безопасно връща BTU в хиляди (напр. 9000 -> 9). Ако стойността съдържа текст, се парсират само цифрите.
  getBtuInThousands(p: ProductDto): number {
    const raw = p?.btu?.value ?? '';
    const digitsOnly = (typeof raw === 'string') ? raw.replace(/\D+/g, '') : String(raw);
    const n = parseInt(digitsOnly, 10);
    if (isNaN(n) || n <= 0) return 0;
    return Math.round(n / 1000);
  }

    // Извлича максималната стойност от атрибут във формат "Мин./Ном./Макс" и я форматира
  private getMaxMinNomMax(p: ProductDto, fullKey: string): string {
    const attrs = p?.attributes || [];
    const found = attrs.find(a => (a.attributeKey || '').trim() === fullKey.trim());
    const raw = found?.attributeValue?.toString();
    if (!raw) return '';

    try {
      const matches = raw.match(/(\d+[\.,]?\d*)/g);
      if (matches && matches.length >= 3) {
        const nums = matches.map(v => parseFloat(v.replace(',', '.')));
        // Номиналната стойност е втората в реда Мин./Ном./Макс
        const nominal = nums[1];
        if (isFinite(nominal)) {
          return nominal.toFixed(1).replace(/\.?0+$/, '').replace('.', ',');
        }
      }
    } catch {
      // ignore
    }
    return raw;
  }
}
