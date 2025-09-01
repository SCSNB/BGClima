import { Component, OnInit, ViewChild, TemplateRef, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ProductDto, ProductService } from 'src/app/services/product.service';
import { FilterDialogComponent } from 'src/app/shared/components/filter-dialog/filter-dialog.component';

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
  @ViewChild('mobileFiltersDialog', { static: true }) mobileFiltersDialog!: TemplateRef<any>;
  
  categoryTitle: string = '';
  allProducts: ProductCard[] = []; // Store all products for the category
  filteredProducts: ProductCard[] = []; // Products to display after filtering
  currentCategory: string = '';
  minPrice: number = 0;
  maxPrice: number = 0;
  isMobile: boolean = false;
  currentFilters: any;

  constructor(
    private route: ActivatedRoute, 
    private productService: ProductService,
    public dialog: MatDialog
  ) { 
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 960; // Matches Angular Material's breakpoint for 'handset'
  }

  openFiltersDialog() {
    this.dialog.open(this.mobileFiltersDialog, {
      width: '100%',
      maxWidth: '100%',
      height: '100%',
      maxHeight: '100vh',
      panelClass: 'mobile-filters-dialog-container'
    });
  }

  closeFiltersDialog() {
    this.dialog.closeAll();
  }

  // Method to handle filter changes from the filter component
  onFiltersChanged(filters: any) {
    this.currentFilters = filters;
    this.applyFilters(filters);
  }

  clearFilters() {
    this.currentFilters = {
      brands: [],
      price: { lower: this.minPrice, upper: this.maxPrice },
      energyClasses: [],
      btus: [],
      roomSizeRanges: []
    };
    this.applyFilters(this.currentFilters);
    this.closeFiltersDialog();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const category = params.get('category');
      if (category) {
        this.currentCategory = category;
        this.setCategoryTitle(category);
        this.loadProducts(category);
      }
    });
  }

  private computeMaxPrice(products: ProductCard[]): number {
    const prices = products.map(p => Number(p.price ?? 0)).filter(n => !isNaN(n));
    if (!prices.length) return 0;
    return Math.max(...prices);
  }

  private toEur(bgn?: number | null): number | null {
    if (bgn === undefined || bgn === null) return null;
    const rate = 1.95583; // BGN -> EUR фиксиран курс
    return +(bgn / rate).toFixed(2);
  }

  loadProducts(category: string): void {
    // Ако категорията е от термопомпените секции, филтрираме клиентски по атрибути
    const heatPumpCategories = new Set<string>([
      'termopompeni-sistemi',
      'multisplit-sistemi',
      'bgclima-toploobmennici'
    ]);

    if (heatPumpCategories.has(category)) {
      this.productService.getProducts().subscribe(data => {
        const tokens = this.getHeatPumpTokens(category);
        const filtered = data.filter(p => {
          const attrs = p?.attributes || [];
          return attrs.some(a => {
            const key = (a.attributeKey || '').toLowerCase();
            const val = (a.attributeValue || '').toString().toLowerCase();
            return tokens.some(t => key.includes(t) || val.includes(t));
          });
        });

        const withCardData: ProductCard[] = filtered.map((p: ProductDto) => {
          const priceEur = this.toEur(p.price);
          const oldPriceEur = this.toEur(p.oldPrice ?? undefined);
          const badges: Badge[] = [];
          if (p.isNew) badges.push({ text: 'НОВО', bg: '#FF4D8D', color: '#fff' });
          if (p.isOnSale) badges.push({ text: 'ПРОМО', bg: '#E6003E', color: '#fff' });
          if (this.hasWifi(p)) badges.push({ text: 'WiFi', bg: '#3B82F6', color: '#fff' });

          const btuThousands = this.getBtuInThousands(p);
          const cooling = this.getMaxMinNomMax(p, 'Отдавана мощност на охлаждане (Мин./Ном./Макс)') || p.coolingCapacity || '';
          const heating = this.getMaxMinNomMax(p, 'Отдавана мощност на отопление (Мин./Ном./Макс)') || p.heatingCapacity || '';

          const specs: Spec[] = [
            { icon: 'bolt', label: 'Мощност', value: btuThousands > 0 ? String(btuThousands) : '' },
            { icon: 'eco', label: 'Енергиен клас', value: p.energyClass?.class || '-' },
            { icon: 'ac_unit', label: 'Охлаждане', value: cooling },
            { icon: 'wb_sunny', label: 'Отопление', value: heating },
          ];
          return { ...p, badges, specs, priceEur, oldPriceEur } as ProductCard;
        });

        this.allProducts = withCardData;
        this.filteredProducts = [...withCardData];
        this.maxPrice = this.computeMaxPrice(withCardData);
      });
      return;
    }

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

        const btuThousands = this.getBtuInThousands(p);
        const cooling = this.getMaxMinNomMax(p, 'Отдавана мощност на охлаждане (Мин./Ном./Макс)') || p.coolingCapacity || '';
        const heating = this.getMaxMinNomMax(p, 'Отдавана мощност на отопление (Мин./Ном./Макс)') || p.heatingCapacity || '';

        const specs: Spec[] = [
          { icon: 'bolt', label: 'Мощност', value: btuThousands > 0 ? String(btuThousands) : '' },
          { icon: 'eco', label: 'Енергиен клас', value: p.energyClass?.class || '-' },
          { icon: 'ac_unit', label: 'Охлаждане', value: cooling },
          { icon: 'wb_sunny', label: 'Отопление', value: heating },
        ];

        return { ...p, badges, specs, priceEur, oldPriceEur } as ProductCard;
      });

      this.allProducts = withCardData;
      this.filteredProducts = [...withCardData];
      this.maxPrice = this.computeMaxPrice(withCardData);
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
    // Филтриране по марка, цена, енергиен клас, BTU (в хиляди) и площ на помещението
    const selectedBrands: string[] = filters?.brands || [];
    const selectedEnergy: string[] = filters?.energyClasses || [];
    const selectedBtus: string[] = filters?.btus || [];
    const selectedRoomSizes: string[] = filters?.roomSizeRanges || [];
    const priceLower: number = Number(filters?.price?.lower ?? 0);
    const priceUpper: number = Number(filters?.price?.upper ?? Number.MAX_SAFE_INTEGER);

    const selectedBtusNum = new Set<number>(
      (selectedBtus || []).map((b: string) => parseInt(String(b).replace(/\D+/g, ''), 10) / 1000).filter((n: number) => !isNaN(n))
    );

    this.filteredProducts = this.allProducts.filter(p => {
      // Цена в лева
      const price = Number(p.price ?? 0);
      if (!(price >= priceLower && price <= priceUpper)) return false;

      // Марка
      if (selectedBrands.length) {
        const brandName = (p.brand?.name || '').toString();
        if (!selectedBrands.includes(brandName)) return false;
      }

      // Енергиен клас
      if (selectedEnergy.length) {
        const cls = (p.energyClass?.class || '').toString();
        if (!selectedEnergy.includes(cls)) return false;
      }

      // BTU (в хиляди)
      if (selectedBtusNum.size > 0) {
        const btuK = this.getBtuInThousands(p);
        if (!selectedBtusNum.has(btuK)) return false;
      }

      // Филтър по площ на помещението
      if (selectedRoomSizes.length > 0) {
        const roomSizeAttr = (p.attributes || []).find(a => 
          (a.attributeKey || '').toLowerCase().includes('подходящ за помещения')
        );
        
        if (roomSizeAttr && roomSizeAttr.attributeValue) {
          // Извличаме числовата стойност от атрибута (например "45 кв.м" -> 45)
          const roomSizeMatch = roomSizeAttr.attributeValue.match(/(\d+(\.\d+)?)/);
          if (roomSizeMatch) {
            const roomSize = parseFloat(roomSizeMatch[0]);
            const isInRange = selectedRoomSizes.some(range => {
              const [min, max] = range.split('-').map(Number);
              return roomSize >= min && roomSize <= max;
            });
            
            if (!isInRange) return false;
          } else {
            // Ако не успеем да извлечем числова стойност, пропускаме филтъра за този продукт
            return false;
          }
        } else {
          // Ако продуктът няма атрибут за площ, не го показваме при филтриране по площ
          return false;
        }
      }

      return true;
    });
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
      'mobilni-prenosimi': 'Мобилни / преносими климатици',
      'termopompeni-sistemi': 'Термопомпени системи',
      'multisplit-sistemi': 'Мултисплит системи',
      'bgclima-toploobmennici': 'БГКЛИМА тръбни топлообменници'
    };

    this.categoryTitle = categoryMap[category] || 'Продукти';
  }

  // Токени за филтриране по термопомпени/мултисплит/топлообменни системи
  private getHeatPumpTokens(category: string): string[] {
    switch (category) {
      case 'termopompeni-sistemi':
        return ['термопомпен', 'термопомпена', 'термопомпи', 'heat pump', 'heat-pump'];
      case 'multisplit-sistemi':
        return ['мултисплит', 'multi split', 'multi-split', 'multisplit'];
      case 'bgclima-toploobmennici':
        return ['топлообмен', 'топлообменник', 'топлообменници', 'heat exchanger'];
      default:
        return [];
    }
  }
}
