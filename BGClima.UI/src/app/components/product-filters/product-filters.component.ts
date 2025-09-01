import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProductService, BrandDto, BTUDto } from '../../services/product.service';

@Component({
  selector: 'app-product-filters',
  templateUrl: './product-filters.component.html',
  styleUrls: ['./product-filters.component.scss']
})
export class ProductFiltersComponent implements OnChanges, OnInit {
  @Output() filtersChanged = new EventEmitter<any>();
  @Output() sortChanged = new EventEmitter<string>();
  @Input() currentCategory: string = '';
  @Input() minPrice: number = 100;
  @Input() maxPrice: number = 79900;
  // Списък с позволени марки (например само тези, които имат промо продукти)
  @Input() allowedBrands: string[] = [];
  // Показва/скрива секцията с бързи връзки (категории)
  @Input() showCategoriesNav: boolean = true;
  // Външен preset за текущ избор на филтри (за запазване при повторно отваряне)
  @Input() preset: {
    brands: string[];
    price: { lower: number; upper: number };
    energyClasses: string[];
    btus: string[];
    roomSizeRanges: string[];
  } | null = null;

  filters = {
    brands: [] as string[],
    price: { lower: 230, upper: 79900 },
    energyClasses: [] as string[],
    btus: [] as string[],
    roomSizeRanges: [] as string[]
  };

  // Опции за филтър по площ на помещението
  roomSizeOptions = [
    { value: '10-15', label: '10-15 кв.м' },
    { value: '15-20', label: '15-20 кв.м' },
    { value: '20-25', label: '20-25 кв.м' },
    { value: '25-30', label: '25-30 кв.м' },
    { value: '30-40', label: '30-40 кв.м' },
    { value: '40-50', label: '40-50 кв.м' },
    { value: '50-65', label: '50-65 кв.м' },
    { value: '65-75', label: '65-75 кв.м' }
  ];

  // Списък с марки от бекенда
  brands: BrandDto[] = [];
  // Пълен списък за локално филтриране по allowedBrands
  private allBrands: BrandDto[] = [];
  // Списък с BTU стойности от бекенда
  btuOptions: BTUDto[] = [];

  constructor(private productService: ProductService, private dialog: MatDialog) {}

  // Mobile dialog template for filters
  @ViewChild('filtersTpl') filtersTpl!: TemplateRef<any>;
  private dialogRef?: MatDialogRef<any>;

  // Mobile detection
  isMobile = false;

  // Sorting options
  sortOptions = [
    { key: 'name-asc', label: 'Име A–Я' },
    { key: 'name-desc', label: 'Име Я–А' },
    { key: 'price-asc', label: 'Цена ↑' },
    { key: 'price-desc', label: 'Цена ↓' },
    { key: 'newest', label: 'Най-нови' }
  ];
  selectedSort: string = 'name-asc';

  // Бърза навигация по типове климатици (от ПРОДУКТИ > Климатици)
  private acCategories = [
    { slug: 'stenen-tip', label: 'Климатици стенен тип' },
    { slug: 'kolonen-tip', label: 'Климатици колонен тип' },
    { slug: 'kanalen-tip', label: 'Климатици канален тип' },
    { slug: 'kasetachen-tip', label: 'Климатици касетъчен тип' },
    { slug: 'podov-tip', label: 'Климатици подов тип' },
    { slug: 'podovo-tavanen-tip', label: 'Климатици подово - таванен тип' },
    { slug: 'vrf-vrv', label: 'VRF / VRV' },
    { slug: 'mobilni-prenosimi', label: 'Мобилни / преносими климатици' }
  ];

  // ПРОДУКТИ > Термопомпи
  private heatPumpCategories = [
    { slug: 'termopompeni-sistemi', label: 'Термопомпени системи' },
    { slug: 'multisplit-sistemi', label: 'Мултисплит системи' },
    { slug: 'bgclima-toploobmennici', label: 'БГКЛИMA тръбни топлообменници' }
  ];

  get isHeatPumpSection(): boolean {
    const hpSet = new Set(['termopompeni-sistemi', 'multisplit-sistemi', 'bgclima-toploobmennici']);
    return hpSet.has(this.currentCategory);
  }

  applyFilters(): void {
    this.onFiltersChanged();
    this.dialogRef?.close();
  }

  clearFilters(): void {
    this.filters.brands = [];
    this.filters.energyClasses = [];
    this.filters.btus = [];
    this.filters.roomSizeRanges = [];
    this.filters.price.lower = this.minPrice;
    this.filters.price.upper = this.maxPrice;
    this.onFiltersChanged();
  }

  openFiltersDialog(): void {
    if (!this.filtersTpl) return;
    this.dialogRef = this.dialog.open(this.filtersTpl, {
      panelClass: 'filters-dialog-panel'
    });
  }

  closeFiltersDialog(): void {
    this.dialogRef?.close();
  }

  @HostListener('window:resize')
  onResize() { this.updateIsMobile(); }

  private updateIsMobile() {
    this.isMobile = typeof window !== 'undefined' && window.innerWidth < 992;
  }

  setSort(key: string): void {
    this.selectedSort = key;
    this.sortChanged.emit(key);
  }

  get sectionTitle(): string {
    return this.isHeatPumpSection ? 'Термопомпи' : 'Климатици';
  }

  get categoriesToShow() {
    return this.isHeatPumpSection ? this.heatPumpCategories : this.acCategories;
  }

  onFiltersChanged() {
    this.clampPrices();
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

  ngOnInit(): void {
    this.updateIsMobile();
    // Зареждане на всички марки от базата
    this.productService.getBrands().subscribe({
      next: (brands) => {
        this.allBrands = brands ?? [];
        this.applyAllowedBrandsFilter();
      },
      error: (err) => {
        console.error('Грешка при зареждане на марки:', err);
        this.allBrands = [];
        this.applyAllowedBrandsFilter();
      }
    });

    // Зареждане на всички BTU стойности от базата
    this.productService.getBTU().subscribe({
      next: (btus) => {
        this.btuOptions = btus ?? [];
      },
      error: (err) => {
        console.error('Грешка при зареждане на BTU стойности:', err);
        this.btuOptions = [];
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['preset'] && this.preset) {
      // При подаден preset, приложи стойностите към вътрешните филтри
      this.filters = {
        brands: [...(this.preset.brands || [])],
        price: {
          lower: Number(this.preset.price?.lower ?? this.minPrice),
          upper: Number(this.preset.price?.upper ?? this.maxPrice)
        },
        energyClasses: [...(this.preset.energyClasses || [])],
        btus: [...(this.preset.btus || [])],
        roomSizeRanges: [...(this.preset.roomSizeRanges || [])]
      };
      this.clampPrices();
      // Емитни, за да синхронизираме списъка с продукти с възстановените стойности
      this.filtersChanged.emit(this.filters);
    }
    if (changes['minPrice'] || changes['maxPrice']) {
      // При промяна на входните граници инициализирай диапазона към [min, max]
      this.filters.price.lower = this.minPrice;
      this.filters.price.upper = this.maxPrice;
      this.clampPrices();
      // емитни веднъж, за да синхронизираме списъка
      this.filtersChanged.emit(this.filters);
    }
    if (changes['allowedBrands']) {
      this.applyAllowedBrandsFilter();
    }
  }

  private clampPrices(): void {
    const min = Number(this.minPrice ?? 0);
    let max = Number(this.maxPrice ?? 0);
    // гаранция за валиден диапазон
    if (!(max >= min)) {
      max = min;
    }
    let lower = Number(this.filters.price.lower ?? min);
    let upper = Number(this.filters.price.upper ?? max);
    if (isNaN(lower)) lower = min;
    if (isNaN(upper)) upper = max;
    lower = Math.max(min, Math.min(lower, max));
    upper = Math.max(min, Math.min(upper, max));
    if (lower > upper) {
      // ако се разминат, сближи ги
      lower = upper;
    }
    this.filters.price.lower = lower;
    this.filters.price.upper = upper;
  }

  // Прилага филтрация на списъка с марки според allowedBrands и чисти несъществуващи избори
  private applyAllowedBrandsFilter(): void {
    const allow = (this.allowedBrands || []).filter(Boolean);
    if (allow.length > 0) {
      this.brands = (this.allBrands || []).filter(b => !!b?.name && allow.includes(b.name));
    } else {
      this.brands = [...(this.allBrands || [])];
    }
    // Премахни от избора марки, които вече не се показват
    const visibleNames = new Set(this.brands.map(b => b.name));
    const before = this.filters.brands.length;
    this.filters.brands = (this.filters.brands || []).filter(n => visibleNames.has(n));
    if (this.filters.brands.length !== before) {
      // ако има промяна – емитни, за да се актуализира списъкът с продукти
      this.filtersChanged.emit(this.filters);
    }
  }

  // Проценти за сивите зони извън избрания диапазон
  get leftWidthPct(): number {
    const min = Number(this.minPrice ?? 0);
    const max = Math.max(min, Number(this.maxPrice ?? 0));
    const span = max - min;
    if (span <= 0) return 0;
    const lower = Math.max(min, Math.min(Number(this.filters.price.lower ?? min), max));
    return ((lower - min) / span) * 100;
  }

  get rightWidthPct(): number {
    const min = Number(this.minPrice ?? 0);
    const max = Math.max(min, Number(this.maxPrice ?? 0));
    const span = max - min;
    if (span <= 0) return 0;
    const upper = Math.max(min, Math.min(Number(this.filters.price.upper ?? max), max));
    const usedPct = ((upper - min) / span) * 100;
    return Math.max(0, 100 - usedPct);
  }

  // Проценти за позицията на високите маркери (начало/край на диапазона)
  get lowerPct(): number {
    const min = Number(this.minPrice ?? 0);
    const max = Math.max(min, Number(this.maxPrice ?? 0));
    const span = max - min;
    if (span <= 0) return 0;
    const lower = Math.max(min, Math.min(Number(this.filters.price.lower ?? min), max));
    return ((lower - min) / span) * 100;
  }

  get upperPct(): number {
    const min = Number(this.minPrice ?? 0);
    const max = Math.max(min, Number(this.maxPrice ?? 0));
    const span = max - min;
    if (span <= 0) return 100;
    const upper = Math.max(min, Math.min(Number(this.filters.price.upper ?? max), max));
    return ((upper - min) / span) * 100;
  }

  // Ширина на избрания диапазон в проценти (за цветните чертички между От–До)
  get selectedWidthPct(): number {
    return Math.max(0, this.upperPct - this.lowerPct);
  }
}
