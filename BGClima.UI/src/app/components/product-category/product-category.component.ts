import { Component, OnInit, ViewChild, TemplateRef, HostListener, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router  } from '@angular/router';
import { ProductDto, ProductService } from 'src/app/services/product.service';
import { CompareService } from 'src/app/services/compare.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';

// Custom paginator for Bulgarian language
export class BgPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();
  firstPageLabel = 'Първа страница';
  itemsPerPageLabel = 'Продукти на страница:';
  lastPageLabel = 'Последна страница';
  nextPageLabel = 'Следваща страница';
  previousPageLabel = 'Предишна страница';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return 'Страница 1 от 1';
    }
    const amountPages = Math.ceil(length / pageSize);
    return `Страница ${page + 1} от ${amountPages}`;
  }
}

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
  },
  providers: [
    { provide: MatPaginatorIntl, useClass: BgPaginatorIntl }
  ]
})

export class ProductCategoryComponent implements OnInit {
  @ViewChild('mobileFiltersDialog', { static: true }) mobileFiltersDialog!: TemplateRef<any>;
  
  categoryTitle: string = '';
  allProducts: ProductCard[] = []; // Store all products for the category
  filteredProducts: ProductCard[] = []; // Products to display after filtering
  currentCategory: string = '';
  minPrice: number = 0;
  maxPrice: number = 20000;
  isMobile: boolean = false;
  currentFilters: any = {};
  currentSort: string | null = null; // Track current sort order
  productTypeId?: number; // Add productTypeId property
  
  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 18;
  totalItems: number = 0;
  pageSizeOptions = [9, 18, 36, 100];
  loading: boolean = false;
  products: ProductCard[] = [];
  totalProducts: number = 0;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,    
    private productService: ProductService,
    public dialog: MatDialog,
    private compareService: CompareService,
    private snackBar: MatSnackBar,
    public _MatPaginatorIntl: MatPaginatorIntl
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
    this.applyFilters(this.currentFilters);
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
    this.route.queryParams.subscribe(params => {
      this.parseFiltersFromUrl(params);
    });

    this.route.paramMap.subscribe(params => {
      const category = params.get('category') || '';
      this.productTypeId = Number(category);
      
      if (category !== this.currentCategory) {
        this.currentCategory = category;
        this.setCategoryTitle(category);
        this.applyFilters(this.currentFilters);
      }
    });

  }

    private parseFiltersFromUrl(params: any) {
    this.currentFilters = {
      brands: params['brands'] ? params['brands'].split(',').map(Number) : [],
      price: {
        lower: params['lower'] ? Number(params['lower']) : this.minPrice,
        upper: params['upper'] ? Number(params['upper']) : this.maxPrice
      },
      energyClasses: params['energyClasses'] ? params['energyClasses'].split(',') : [],
      btus: params['btus'] ? params['btus'].split(',') : [],
      powerKws: params['powerKws'] ? params['powerKws'].split(',') : [],
      roomSizeRanges: params['roomSize'] ? [params['roomSize']] : []
    };

    this.currentPage = params['page'] ? Number(params['page']) : 1;
    this.pageSize = params['pageSize'] ? Number(params['pageSize']) : 18;
    this.currentSort = params['sort'] || null;
  }

  private toEur(bgn?: number | null): number | null {
    if (bgn === undefined || bgn === null) return null;
    const rate = 1.95583; // BGN -> EUR фиксиран курс
    return +(bgn / rate).toFixed(2);
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.applyFilters(this.currentFilters);
  }

  loadProducts(): void {
    const filterParams = {
      productTypeId: this.productTypeId,
      page: this.currentPage,
      pageSize: this.pageSize,
      price: { lower: 0, upper: 20000 } // Hardcoded max price of 20000
    };

    this.productService.getProducts(filterParams).subscribe(response => {
      const { items, totalCount } = this.transformProductResponse(response);
      this.totalItems = totalCount;
     
      this.allProducts = items;
      this.filteredProducts = [...items];
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

    this.updateUrlFromFilters(filters);

    this.loading = true;
    
    // Prepare filter parameters for the API call
    const filterParams: any = {
      productTypeId: this.productTypeId,
      page: this.currentPage, // Reset to first page when filters change
      pageSize: this.pageSize
    };

    // Add brand filter if any brands are selected
    if (filters?.brands?.length) {
      // Convert brand IDs to numbers and filter out any invalid values
      filterParams.brandIds = filters.brands
        .map((id: string | number) => typeof id === 'string' ? parseInt(id, 10) : id)
        .filter((id: number) => !isNaN(id));
    }

    // Add price range filter
    if (filters?.price) {
      filterParams.minPrice = Number(filters.price.lower) || 0;
      filterParams.maxPrice = Number(filters.price.upper) || Number.MAX_SAFE_INTEGER;
    }

    // Add energy class filter if any are selected
    if (filters?.energyClasses?.length) {
      filterParams.energyClassIds = filters.energyClasses;
    }

    // Add BTU filter if any are selected
    if (filters?.btus?.length) {
      const btuIds = filters.btus.map((b: string | number) => Number(b));
      filterParams.btuIds = btuIds; // Send array of BTU IDs
    }

    if (filters?.powerKws?.length) {
      // Convert string array to array of numbers for MaxHatingPowers
      filterParams.MaxHatingPowers = filters.powerKws.map((kw: string) => parseFloat(kw));
    }

    // Add room size filter if any are selected
    if (filters?.roomSizeRanges?.length) {
      filterParams.roomSize = filters.roomSizeRanges[0];
    }

    // Add sorting parameters
    if (this.currentSort) {
      const [sortBy, sortOrder] = this.currentSort.split('-');
      filterParams.sortBy = sortBy;
      filterParams.sortOrder = sortOrder as 'asc' | 'desc';
    }
    
    this.productService.getProducts(filterParams).subscribe({
      next: (response) => {
        const { items, totalCount } = this.transformProductResponse(response);
        this.products = items;
        this.filteredProducts = [...items];
        this.totalItems = totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching filtered products:', error);
        this.loading = false;
      }
    });
  }
  
  private updateUrlFromFilters(filters: any) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        brands: filters.brands?.join(',') || null,
        lower: filters.price?.lower,
        upper: filters.price?.upper,
        energyClasses: filters.energyClasses?.join(',') || null,
        btus: filters.btus?.join(',') || null,
        powerKws: filters.powerKws?.join(',') || null,
        roomSize: filters.roomSizeRanges?.[0] || null,
        sort: this.currentSort || null,
        page: this.currentPage,
        pageSize: this.pageSize
      },
      queryParamsHandling: 'merge'
    });
  }

  private transformProductResponse(response: any): { items: ProductCard[], totalCount: number } {
    const totalCount = response.totalCount || 0;
    const items = response.items.map((p: ProductDto) => {
      const priceEur = this.toEur(p.price);
      const oldPriceEur = this.toEur(p.oldPrice ?? undefined);
      const badges: Badge[] = [];
      
      if (p.isNew) badges.push({ text: 'НОВО', bg: '#FF4D8D', color: '#fff' });
      if (p.isOnSale) badges.push({ text: 'ПРОМО', bg: '#E6003E', color: '#fff' });
      if (this.hasWifi(p)) badges.push({ text: 'WiFi', bg: '#3B82F6', color: '#fff' });

      const btuThousands = this.getBtuInThousands(p);
      const isHeatPump = this.productTypeId == 9;
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
        ].filter(s => s.value)
      } as ProductCard;
    });

    return { items, totalCount };
  }

  private setCategoryTitle(category: string): void {
    const categoryMap: { [key: string]: string } = {
      '1': 'Климатици стенен тип',
      '2': 'Климатици колонен тип',
      '3': 'Климатици канален тип',
      '4': 'Климатици касетъчен тип',
      '5': 'Климатици подов тип',
      '6': 'Климатици подово - таванен тип',
      '7': 'VRF / VRV',
      '8': 'Мобилни / преносими климатици',
      '9': 'Термопомпени системи',
      '10': 'Мултисплит системи',
      '11': 'БГКЛИМА тръбни топлообменници',
      '12': 'Хиперинвертори'
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
