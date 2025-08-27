import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductDto, ProductService } from 'src/app/services/product.service';

type Badge = { bg: string; color: string; text: string };
type Spec = { icon: string; label: string; value: string };
type ProductCard = ProductDto & {
  badges?: Badge[];
  specs?: Spec[];
  priceEur?: number | null;
  oldPriceEur?: number | null;
};

@Component({
  selector: 'app-product-category',
  templateUrl: './product-category.component.html',
  styleUrls: ['./product-category.component.scss']
})

export class ProductCategoryComponent implements OnInit {
  categoryTitle: string = '';
  allProducts: ProductCard[] = []; // Store all products for the category
  filteredProducts: ProductCard[] = []; // Products to display after filtering

  constructor(private route: ActivatedRoute, private productService: ProductService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const category = params.get('category');
      if (category) {
        this.setCategoryTitle(category);
        this.loadProducts(category);
      }
    });
  }

  private toEur(bgn?: number | null): number | null {
    if (bgn === undefined || bgn === null) return null;
    const rate = 1.95583; // BGN -> EUR фиксиран курс
    return +(bgn / rate).toFixed(2);
  }

  loadProducts(category: string): void {
    // Вземаме всички продукти и филтрираме клиентски по атрибута "Тип на инсталация" според категорията
    this.productService.getProducts().subscribe(data => {
      const keyNeedle = 'тип на инстала';
      const tokens = this.getInstallTokens(category);
      const filtered = data.filter(p => {
        if (!Array.isArray(p.attributes)) return false;
        return p.attributes!.some(a => {
          const key = (a.attributeKey || '').toLowerCase();
          const val = (a.attributeValue || '').toString().toLowerCase().trim();
          if (!key.includes(keyNeedle) || !val) return false;
          return tokens.some(t => val === t || val.includes(t));
        });
      });

      // Обогатяваме продуктите с badges, EUR цени и specs (1:1 като offers)
      const withCardData: ProductCard[] = filtered.map((p: ProductDto) => {
        const priceEur = this.toEur(p.price);
        const oldPriceEur = this.toEur(p.oldPrice ?? undefined);

        const badges: Badge[] = [];
        if (p.isNew) badges.push({ text: 'НОВО', bg: '#FF4D8D', color: '#fff' });
        if (p.isOnSale) badges.push({ text: 'ПРОМО', bg: '#E6003E', color: '#fff' });
        if (this.hasWifi(p)) badges.push({ text: 'WiFi', bg: '#3B82F6', color: '#fff' });

        const specs: Spec[] = [
          { icon: 'bolt', label: 'Мощност', value: String(this.getBtuInThousands(p) || '0') },
          { icon: 'eco', label: 'Енергиен клас', value: p.energyClass?.class || '-' },
          { icon: 'ac_unit', label: 'Охлаждане', value: this.getMaxMinNomMax(p, 'Отдавана мощност на охлаждане (Мин./Ном./Макс)') || p.coolingCapacity || '0' },
          { icon: 'wb_sunny', label: 'Отопление', value: this.getMaxMinNomMax(p, 'Отдавана мощност на отопление (Мин./Ном./Макс)') || p.heatingCapacity || '0' },
        ];

        return { ...p, badges, specs, priceEur, oldPriceEur } as ProductCard;
      });

      this.allProducts = withCardData;
      this.filteredProducts = [...withCardData];
    });
  }

  // Допустими стойности за атрибута "Тип на инсталация" по страница/категория
  private getInstallTokens(category: string): string[] {
    switch (category) {
      case 'stenen-tip':
        return ['стенен тип', 'стенен', 'настенен', 'настен'];
      case 'kolonen-tip':
        return ['колонен тип', 'колонен'];
      case 'kanalen-tip':
        return ['канален тип', 'канален'];
      case 'kasetachen-tip':
        return ['касетъчен тип', 'касетъчен', 'касетен'];
      case 'podov-tip':
        return ['подов тип', 'подов'];
      case 'podovo-tavanen-tip':
        return ['подово - таванен тип', 'подово-таванен тип', 'подово - таванен', 'подово-таванен', 'таванен-подов'];
      case 'vrf-vrv':
        return ['vrf', 'vrv'];
      case 'mobilni-prenosimi':
        return ['мобилен', 'мобилни', 'преносим', 'преносими'];
      default:
        return [];
    }
  }

  // Безопасно връща BTU в хиляди (напр. 9000 -> 9). Ако стойността съдържа текст, се парсират само цифрите.
  getBtuInThousands(p: ProductDto): number {
    const raw = p?.btu?.value ?? '';
    const digitsOnly = (typeof raw === 'string') ? raw.replace(/\D+/g, '') : String(raw);
    const n = parseInt(digitsOnly, 10);
    if (isNaN(n) || n <= 0) return 0;
    return Math.round(n / 1000);
  }

  getBtuInThousandsRobust(p: ProductDto): string {
    const btuInThousands = this.getBtuInThousands(p);
    return btuInThousands > 0 ? `${btuInThousands}k` : 'N/A';
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
        const max = Math.max(...nums);
        return max.toFixed(1).replace(/\.?0+$/, '').replace('.', ',');
      }
    } catch {
      // ignore
    }
    return raw;
  }

  // Определя дали продуктът поддържа WiFi по ключ/стойност в атрибутите
  hasWifi(p: ProductDto): boolean {
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

  applyFilters(filters: any): void {
    // Временно изключено филтриране: показваме всички продукти върнати от бекенда
    this.filteredProducts = [...this.allProducts];
  }

  private setCategoryTitle(category: string): void {
    const categoryMap: { [key: string]: string } = {
      'stenen-tip': 'Климатици стенен тип',
      'kolonen-tip': 'Климатици колонен тип',
      'kanalen-tip': 'Климатици канален тип',
      'kasetachen-tip': 'Климатици касетъчен тип',
      'podov-tip': 'Климатици подов тип',
      'podovo-tavanen-tip': 'Климатици подово - таванен тип',
      'vrf-vrv': 'VRF / VRV',
      'mobilni-prenosimi': 'Мобилни / преносими климатици'
    };

    this.categoryTitle = categoryMap[category] || 'Продукти';
  }
}
