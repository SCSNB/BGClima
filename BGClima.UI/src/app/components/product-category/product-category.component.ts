import { Component, OnInit, ViewChild, TemplateRef, HostListener, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ProductDto, ProductService } from 'src/app/services/product.service';
import { FilterDialogComponent } from 'src/app/shared/components/filter-dialog/filter-dialog.component';
import { CompareService } from 'src/app/services/compare.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  styleUrls: ['./product-category.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'app-product-category'
  }
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
  currentSort: string | null = null; // Track current sort order
  productTypeId?: number; // Add productTypeId property
  
  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 18;
  totalItems: number = 0;
  pageSizeOptions = [9, 18, 36, 100];

  constructor(
    private route: ActivatedRoute, 
    private productService: ProductService,
    public dialog: MatDialog,
    private compareService: CompareService,
    private snackBar: MatSnackBar
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

  // Сортиране на продукти
  getCurrentSortLabel(): string {
    switch (this.currentSort) {
      case 'price-asc': return 'Ниска цена';
      case 'price-desc': return 'Висока цена';
      case 'name-asc': return 'А → Я';
      case 'name-desc': return 'Я → А';
      default: return 'Сортиране';
    }
  }

  // Икона за текущото сортиране (за бутона на десктоп)
  getCurrentSortIcon(): string {
    switch (this.currentSort) {
      case 'name-asc':
        return 'north'; // стрелка нагоре
      case 'name-desc':
        return 'south'; // стрелка надолу
      default:
        return 'keyboard_arrow_down'; // по подразбиране за отваряне на менюто
    }
  }

  onSortChanged(sortKey: string) {
    this.currentSort = sortKey;
    this.applySorting();
  }

  private applySorting() {
    if (!this.currentSort) return;
    
    const products = [...this.filteredProducts];
    
    switch (this.currentSort) {
      case 'name-asc':
        products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        products.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'price-asc':
        products.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        products.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        // Default sorting (by original order)
        products.sort((a, b) => (a.id || 0) - (b.id || 0));
        break;
    }
    
    this.filteredProducts = products;
  }

  clearFilters() {
    this.currentFilters = {
      brands: [],
      price: { lower: this.minPrice, upper: this.maxPrice },
      energyClasses: [],
      btus: [],
      roomSizeRanges: [],
      powerKws: []
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

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadProducts(this.currentCategory);
  }

  loadProducts(category: string): void {
    this.currentCategory = category;
    const productTypeId = parseInt(category, 10);
    
    this.productService.getProducts({ 
      page: this.currentPage, 
      pageSize: this.pageSize,
      ...(isNaN(productTypeId) ? {} : { productTypeId })
    }).subscribe(response => {
      this.totalItems = response.totalCount || 0;
      const withCardData: ProductCard[] = response.items.map((p: ProductDto) => {
        const priceEur = this.toEur(p.price);
        const oldPriceEur = this.toEur(p.oldPrice ?? undefined);
        const badges: Badge[] = [];
        if (p.isNew) badges.push({ text: 'НОВО', bg: '#FF4D8D', color: '#fff' });
        if (p.isOnSale) badges.push({ text: 'ПРОМО', bg: '#E6003E', color: '#fff' });
        if (this.hasWifi(p)) badges.push({ text: 'WiFi', bg: '#3B82F6', color: '#fff' });

        const btuThousands = this.getBtuInThousands(p); // 9, 12, 18 ...
        const isHeatPump = !!p?.productType?.name && p.productType.name.toLowerCase().includes('термопомп');
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

        const findAttr = (key: string) => (p.attributes || []).find(a => (a.attributeKey || '').trim() === key)?.attributeValue?.toString() || '';
        const coolingRaw = findAttr(coolingAttrKey) || p.coolingCapacity || '';
        const heatingRaw = findAttr(heatingAttrKey) || p.heatingCapacity || '';

        const cooling = isHeatPump ? extractNominalNumeric(coolingRaw) : (this.getMaxMinNomMax(p, coolingAttrKey) || p.coolingCapacity || '');
        const heating = isHeatPump ? extractNominalNumeric(heatingRaw) : (this.getMaxMinNomMax(p, heatingAttrKey) || p.heatingCapacity || '');

        return {
          ...p,
          priceEur,
          oldPriceEur,
          badges,
          specs: [
            { icon: 'bolt', label: 'Мощност', value: btuThousands > 0 ? String(btuThousands) : '' },
            { icon: 'eco', label: 'Клас', value: p.energyClass?.class || '' },
            { icon: 'ac_unit', label: 'Охлаждане', value: cooling },
            { icon: 'wb_sunny', label: 'Отопление', value: heating }
          ].filter(s => s.value) // премахни празни стойности
        } as ProductCard;
      });

      this.allProducts = withCardData;
      this.filteredProducts = [...withCardData];
      this.maxPrice = this.computeMaxPrice(this.allProducts);
      this.minPrice = 0; // Reset min price

      // Reset filters with new price range
      this.currentFilters = {
        brands: [],
        price: { lower: 0, upper: this.maxPrice },
        energyClasses: [],
        btus: [],
        roomSizeRanges: [],
        powerKws: []
      };

      // Apply any existing sort
      this.applySorting();
    });
  }

  // === Compare actions ===
  isCompared(id: number): boolean {
    return this.compareService.isSelected(id);
  }

  onCompareClick(event: MouseEvent, product: ProductDto) {
    // предотвратяваме навигацията от линка на картата
    event.preventDefault();
    event.stopPropagation();
    const res = this.compareService.toggle(product);
    if (!res.ok && res.reason) {
      this.snackBar.open(res.reason, 'OK', { duration: 2500 });
      return;
    }
    const msg = res.selected ? 'Добавено за сравнение' : 'Премахнато от сравнение';
    this.snackBar.open(msg, 'OK', { duration: 1200 });
  }

  public applyFilters(filters: any): void {
    this.currentFilters = filters;
    
    // Филтриране по марка, цена, енергиен клас, BTU (в хиляди) и площ на помещението
    const selectedBrands: string[] = filters?.brands || [];
    const selectedEnergy: string[] = filters?.energyClasses || [];
    const selectedBtus: string[] = filters?.btus || [];
    const selectedRoomSizes: string[] = filters?.roomSizeRanges || [];
    const selectedPowerKws: string[] = (filters as any)?.powerKws || [];
    const priceLower: number = Number(filters?.price?.lower ?? 0);
    const priceUpper: number = Number(filters?.price?.upper ?? Number.MAX_SAFE_INTEGER);

    const selectedBtusNum = new Set<number>(
      (selectedBtus || []).map((b: string) => parseInt(String(b).replace(/\D+/g, ''), 10) / 1000).filter((n: number) => !isNaN(n))
    );

    const isToploobmennici = (this.currentCategory || '').trim() === 'bgclima-toploobmennici';
    const isHeatPumpCategory = new Set(['termopompeni-sistemi']).has(this.currentCategory); // multisplit вече е към климатици
    const selectedPowerKwNum = new Set<number>((selectedPowerKws || []).map(v => Number(v)).filter(n => !isNaN(n)));

    // Apply filters
    const filtered = this.allProducts.filter(p => {
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

      // Мощност (kW) само за истински термопомпени категории (без топлообменници)
      if (isHeatPumpCategory && selectedPowerKwNum.size > 0) {
        const maxHeatKw = this.getHeatingPowerMaxKw(p);
        if (maxHeatKw === null) return false;
        const rounded = Math.round(maxHeatKw);
        if (!selectedPowerKwNum.has(rounded)) return false;
      }
      // BTU (в хиляди) – използваме когато НЕ сме в термопомпена секция ИЛИ сме в топлообменници
      if ((!isHeatPumpCategory || isToploobmennici) && selectedBtusNum.size > 0) {
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

    // Задаваме филтрираните продукти към списъка за рендериране
    this.filteredProducts = filtered;
    // Запазваме активното сортиране, ако има такова
    this.applySorting();
  }

  // Извлича максималната стойност (kW) от атрибут "Отдавана мощност на отопление (Мин./Ном./Макс)"
  // Връща число (kW) или null ако липсва/невалидно
  private getHeatingPowerMaxKw(p: ProductDto): number | null {
    const attrs = p?.attributes || [];
    const fullKey = 'Отдавана мощност на отопление (Мин./Ном./Макс)';
    const found = attrs.find(a => (a.attributeKey || '').trim() === fullKey);
    const raw = found?.attributeValue?.toString() || '';
    if (!raw) return null;
    const matches = raw.match(/(\d+[\.,]?\d*)/g);
    if (!matches || matches.length === 0) return null;
    const nums = matches.map(v => parseFloat(v.replace(',', '.'))).filter(n => !isNaN(n));
    if (nums.length === 0) return null;
    const max = Math.max(...nums);
    return isFinite(max) ? max : null;
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
      'hiperinvertori': 'Хиперинвертори',
      'termopompeni-sistemi': 'Термопомпени системи',
      'multisplit-sistemi': 'Мултисплит системи',
      'bgclima-toploobmennici': 'БГКЛИМА тръбни топлообменници'
    };

    this.categoryTitle = categoryMap[category] || 'Продукти';
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
}
