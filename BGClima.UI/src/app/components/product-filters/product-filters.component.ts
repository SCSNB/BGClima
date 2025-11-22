import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProductService, BrandDto, BTUDto, EnergyClassDto } from '../../services/product.service';

@Component({
  selector: 'app-product-filters',
  templateUrl: './product-filters.component.html',
  styleUrls: ['./product-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFiltersComponent implements OnChanges, OnInit {
  @Output() filtersChanged = new EventEmitter<any>();
  @Output() sortChanged = new EventEmitter<string>();
  @Input() currentCategory: string = '';
  @Input() minPrice: number = 0;
  @Input() maxPrice: number = 20000;
  // Списък с позволени марки (например само тези, които имат промо продукти)
  @Input() allowedBrands: string[] = [];
  // Показва/скрива секцията с бързи връзки (категории)
  @Input() showCategoriesNav: boolean = true;
  // Външен preset за текущ избор на филтри (за запазване при повторно отваряне)
  @Input() set preset(value: {
    brands: number[];
    price: { lower: number; upper: number };
    energyClasses: number[];
    btus: (string | number)[];
    roomSizeRanges: string[];
  } | null) {
    if (value) {
      this._preset = {
        ...value,
        brands: value.brands.map(b => typeof b === 'string' ? parseInt(b, 10) : b).filter((b): b is number => !isNaN(b)),
        btus: value.btus.map(b => typeof b === 'string' ? parseInt(b, 10) : b).filter((b): b is number => !isNaN(b))
      };
    } else {
      this._preset = null;
    }
  }
  private _preset: {
    brands: number[];
    price: { lower: number; upper: number };
    energyClasses: number[];
    btus: number[];
    roomSizeRanges: string[];
  } | null = null;

  filters = {
    brands: [] as number[],
    price: { lower: 0, upper: 20000 },
    energyClasses: [] as number[],
    btus: [] as number[], // Changed from string[] to number[] to store BTU IDs
    roomSizeRanges: [] as string[],
    // Само за термопомпи: избор на мощност (kW)
    powerKws: [] as string[]
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
  brands: BrandDto[] = [
    { id: 1, name: 'Daikin', country: 'Япония' },
    { id: 2, name: 'Mitsubishi Electric', country: 'Япония' },
    { id: 3, name: 'Toshiba', country: 'Япония' },
    { id: 4, name: 'Fujitsu', country: 'Япония' },
    { id: 5, name: 'Hitachi', country: 'Япония' },
    { id: 6, name: 'Gree', country: 'Китай' },
    { id: 7, name: 'AUX', country: 'Китай' },
    { id: 8, name: 'Nippon', country: 'Япония' },
    { id: 9, name: 'Inventor', country: 'Гърция' },
    { id: 10, name: 'Kobe', country: 'Япония' },
    { id: 11, name: 'Sendo', country: 'Китай' },
    { id: 12, name: 'Cooper & Hunter', country: 'САЩ' },
    { id: 13, name: 'Aqua Systems', country: 'България' }
  ];
  // Пълен списък за локално филтриране по allowedBrands
  private allBrands: BrandDto[] = [...this.brands];
  // Списък с BTU стойности от бекенда
  btuOptions: BTUDto[] = [];

  // Специален набор BTU за "БГКЛИМА тръбни топлообменници"
  private topHeatExchangerBtuIds = [12, 13, 15, 20, 22]; // IDs for 24000, 36000, 48000, 60000, 72000 BTU

  // Източник за показване на BTU: за топлообменници показваме само големите стъпки
  get btuOptionsToShow(): BTUDto[] {
    if (this.isHeatPumpSection) {
      return this.btuOptions.filter(btu => this.topHeatExchangerBtuIds.includes(btu.id));
    }
    return this.btuOptions;
  }


  // Термопомпи: опции за Мощност (kW) – визуално като чеклист
  powerKwOptions: string[] = [
    '3','4','5','6','8','9','10','11','12','14','15','16','17','22','25','30','32','65','75','110','140'
  ];

  // Energy Class options
  energyClasses: EnergyClassDto[] = [
    { id: 1, class: 'A+++', displayName: 'A+++' },
    { id: 2, class: 'A++', displayName: 'A++' },
    { id: 3, class: 'A+', displayName: 'A+' },
    { id: 4, class: 'A', displayName: 'A' }
  ];

  constructor(private productService: ProductService, private dialog: MatDialog) {}

  // Mobile dialog template for filters
  @ViewChild('filtersTpl') filtersTpl!: TemplateRef<any>;
  private dialogRef?: MatDialogRef<any>;

  // Mobile detection
  isMobile = false;

  // Sorting options
  sortOptions = [
    { value: 'priceAsc', label: 'Цена: Ниска към Висока' },
    { value: 'priceDesc', label: 'Цена: Висока към Ниска' },
    { value: 'nameAsc', label: 'Име: A → Я' },
    { value: 'nameDesc', label: 'Име: Я → A' }
  ];

  // Хелпър: дали текущата категория е термопомпена секция
  isHeatPumpCategory(): boolean {
    const c = (this.currentCategory || '').trim();
    return c === '9' || c === '11'; // 9: Термопомпени системи, 11: БГКЛИМА тръбни топлообменници
  }

  selectedSort: string = 'name-asc';

  // Бърза навигация по типове климатици (от ПРОДУКТИ > Климатици)
  private acCategories = [
    { slug: '1', label: 'Климатици стенен тип' },
    { slug: '5', label: 'Климатици подов тип' },
    { slug: '12', label: 'Хиперинвертори' },
    { slug: '2', label: 'Климатици колонен тип' },
    { slug: '10', label: 'Мулти сплит системи' },
    { slug: '4', label: 'Климатици касетъчен тип' },
    { slug: '3', label: 'Климатици канален тип' },
    { slug: '6', label: 'Подово - таванен тип' },
    { slug: '8', label: 'Мобилни / преносими' },
    { slug: '7', label: 'VRF / VRV' }
  ];
  

  // ПРОДУКТИ > Термопомпи
  private heatPumpCategories = [
    { slug: '9', label: 'Термопомпени системи' },
    { slug: '11', label: 'БГКЛИМА тръбни топлообменници' }
  ];

  get isHeatPumpSection(): boolean {
    const hpSet = new Set(['9', '11']);
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
    this.filters.powerKws = [];
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

  toggleFilter(array: any[], value: any): void {
    const index = array.indexOf(value);
    if (index === -1) {
      array.push(value);
    } else {
      array.splice(index, 1);
    }
    this.onFiltersChanged();
  }

  isBrandSelected(brandId: number): boolean {
    return this.filters.brands.includes(brandId);
  }

  toggleBrand(brandId: number): void {
    const index = this.filters.brands.indexOf(brandId);
    if (index === -1) {
      this.filters.brands.push(brandId);
    } else {
      this.filters.brands.splice(index, 1);
    }
    this.onFiltersChanged();
  }

  isEnergyClassSelected(energyClassId: number): boolean {
    return this.filters.energyClasses.includes(energyClassId);
  }

  toggleEnergyClass(energyClassId: number): void {
    const index = this.filters.energyClasses.indexOf(energyClassId);
    if (index === -1) {
      this.filters.energyClasses.push(energyClassId);
    } else {
      this.filters.energyClasses.splice(index, 1);
    }
    this.onFiltersChanged();
  }

  isSelected(array: (string | number)[], value: string | number): boolean {
    return array.some(item => String(item) === String(value));
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
    if (changes['currentCategory']) {
      // При смяна на категория – ако сме в топлообменници, остави само Марка, Цена и BTU
      this.filters.price.lower = this.minPrice;
      this.filters.price.upper = this.maxPrice;
      if (this.isHeatPumpCategory()) {
        this.filters.energyClasses = [];
        this.filters.powerKws = [];
        this.filters.roomSizeRanges = [];
        // Keep only allowed BTU IDs for heat pump section
        if (this.isHeatPumpSection) {
          const allowedBtuIds = new Set(this.topHeatExchangerBtuIds);
          this.filters.btus = (this.filters.btus || []).filter(id => allowedBtuIds.has(Number(id)));
        }
        this.clampPrices();

        // this.filtersChanged.emit(this.filters);
      }
    }
    if (changes['preset'] && this.preset) {
      // При подаден preset, приложи стойностите към вътрешните филтри
      this.filters = {
        brands: [...(this.preset.brands || [])].map(brand => Number(brand)),
        price: {
          lower: Number(this.preset.price?.lower ?? this.minPrice),
          upper: Number(this.preset.price?.upper ?? this.maxPrice)
        },
        energyClasses: [...(this.preset.energyClasses?.map(id => Number(id)) || [])],
        btus: [...(this.preset.btus || [])].map(btu => Number(btu)),
        roomSizeRanges: [...(this.preset.roomSizeRanges || [])],
        powerKws: [...((this.preset as any).powerKws || [])]
      };
      this.clampPrices();
      // Емитни, за да синхронизираме списъка с продукти с възстановените стойности
      // this.filtersChanged.emit(this.filters);
    }
    if (changes['minPrice'] || changes['maxPrice']) {
      
      // При промяна на входните граници инициализирай диапазона към [min, max]
      this.filters.price.lower = this.minPrice;
      this.filters.price.upper = this.maxPrice;
      this.clampPrices();
      // емитни веднъж, за да синхронизираме списъка
      // this.filtersChanged.emit(this.filters);
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
      // Convert allowed brand names to IDs for filtering
      const allowedBrandIds = new Set<number>();
      this.allBrands.forEach(brand => {
        if (allow.includes(brand.name)) {
          allowedBrandIds.add(brand.id);
        }
      });
      this.brands = this.allBrands.filter(brand => allowedBrandIds.has(brand.id));
    } else {
      this.brands = [...this.allBrands];
    }
    
    // Премахни от избора марки, които вече не се показват
    const visibleBrandIds = new Set(this.brands.map(b => b.id));
    const before = this.filters.brands.length;
    this.filters.brands = this.filters.brands.filter(id => visibleBrandIds.has(id));
    
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
