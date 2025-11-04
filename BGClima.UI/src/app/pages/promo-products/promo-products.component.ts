import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProductDto, ProductService } from '../../services/product.service';
import { CompareService } from '../../services/compare.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  styleUrls: ['./promo-products.component.scss']
})
export class PromoProductsComponent implements OnInit {
  title = 'ПРОМО оферти';
  loading = true;
  products: ProductCard[] = [];
  private currentSort: string = '';
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 18;
  totalItems: number = 0;
  pageSizeOptions = [9, 18, 36, 100];

  // Current filter state
  currentFilters: any = {};
  filters: {
    brands: number[];
    price: { lower: number; upper: number };
    energyClasses: number[];
    btus: string[];
    roomSizeRanges: string[];
  } = {
    brands: [],
    price: { lower: 0, upper: 0 },
    energyClasses: [],
    btus: [],
    roomSizeRanges: []
  };

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
  allPromoProducts: ProductCard[] = [];
  // Марки, които реално присъстват сред промо продуктите (за филтрите)
  allowedBrandNames: string[] = [];

  // За колоната с филтри
  minPrice = 0;
  maxPrice = 0;
  currentCategory = '';
  isMobile = false;
  private dialogRef: any;

  @ViewChild('mobileFiltersDialog') mobileFiltersDialog!: TemplateRef<any>;

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private compareService: CompareService,
    private snackBar: MatSnackBar
  ) {
    this.checkIfMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkIfMobile();
  }

  private checkIfMobile() {
    this.isMobile = window.innerWidth < 768;
  }

  openFiltersDialog() {
    this.dialogRef = this.dialog.open(this.mobileFiltersDialog, {
      width: '100%',
      maxWidth: '100%',
      height: '100%',
      maxHeight: '100vh',
      panelClass: 'mobile-filters-dialog-container',
      hasBackdrop: true,
      disableClose: true
    });
  }

  closeFiltersDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  public applyFilters(filters: any): void {
    this.currentFilters = filters;
    this.loading = true;
    
    // Prepare filter parameters for the API call
    const filterParams: any = {
      page: this.currentPage, // Reset to first page when filters change
      pageSize: this.pageSize,
      isOnSale: true
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

    // Call the product service to get filtered products
    this.productService.getProducts(filterParams).subscribe({
      next: (response) => {
        const { items, totalCount } = this.transformProductResponse(response);
        this.products = items;
        this.totalItems = totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching filtered products:', error);
        this.loading = false;
      }
    });
  }


  clearFilters() {
    // Reset all filters to their default values
    this.filters = {
      brands: [],
      price: { lower: this.minPrice, upper: this.maxPrice },
      energyClasses: [],
      btus: [],
      roomSizeRanges: []
    };
    // Apply the cleared filters
    this.onFiltersChanged(this.filters);
    // Close the dialog
    this.closeFiltersDialog();
  }

  ngOnInit(): void {
    this.loadPromoProducts();
  }

  onFiltersChanged(filters: any) {
    this.currentFilters = filters;
    this.applyFilters(filters);
  }

  onSortChanged = (key: string) => {
    // Normalize incoming keys from different sources
    const map: Record<string, string> = {
      priceAsc: 'price-asc',
      priceDesc: 'price-desc',
      nameAsc: 'name-asc',
      nameDesc: 'name-desc'
    };
    key = map[key] || key;
    this.currentSort = key;

    const arr = [...this.products];
    const by = (k: keyof ProductCard, dir: 1|-1 = 1) => arr.sort((a,b)=>((a[k]||0)>(b[k]||0)?dir:-dir));
    switch (key) {
      case 'name-asc': this.products = arr.sort((a,b)=> (a.name||'').localeCompare(b.name||'')); break;
      case 'name-desc': this.products = arr.sort((a,b)=> (b.name||'').localeCompare(a.name||'')); break;
      case 'price-asc': this.products = by('price', 1); break;
      case 'price-desc': this.products = by('price', -1); break;
      case 'newest': default: this.products = arr; break;
    }
  };

  private toEur(bgn?: number | null): number | null {
    if (bgn === undefined || bgn === null) return null;
    const rate = 1.95583; // BGN -> EUR фиксиран курс
    return +(bgn / rate).toFixed(2);
  }

  private transformProductResponse(response: any): { items: ProductCard[], totalCount: number } {
    const totalCount = response.totalCount || 0;
    const items = response.items.map((p: ProductDto) => {
      const priceEur = this.toEur(p.price);
      const oldPriceEur = this.toEur(p.oldPrice ?? undefined);

      // WiFi badge detection
      const hasWifi = (p.attributes || []).some((a: any) => {
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

    return { items, totalCount };
  }

  get currentSortLabel(): string {
    switch (this.currentSort) {
      case 'price-asc': return 'Ниска цена';
      case 'price-desc': return 'Висока цена';
      case 'name-asc': return 'A → Я';
      case 'name-desc': return 'Я → A';
      default: return 'Сортиране';
    }
  }

  private loadPromoProducts(): void {
    this.productService.getProducts({ isOnSale: true }).subscribe({
      next: (response) => {
        this.allPromoProducts = response.items.map((p: ProductDto) => {
          const priceEur = this.toEur(p.price);
          const oldPriceEur = this.toEur(p.oldPrice ?? undefined);

// WiFi badge detection (same as Offers)
          const hasWifi = (p.attributes || []).some((a: any) => {
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
        // Определи разрешените марки на база наличните промо продукти
        const brandSet = new Set<string>();
        this.allPromoProducts.forEach(p => { const n = p.brand?.name?.trim(); if (n) brandSet.add(n); });
        this.allowedBrandNames = Array.from(brandSet).sort((a,b)=>a.localeCompare(b));
        // Определи мин/макс цена
        const prices = this.allPromoProducts.map(p => p.price || 0);
        this.minPrice = prices.length ? Math.min(...prices) : 0;
        this.maxPrice = prices.length ? Math.max(...prices) : 0;
        // Първоначално показваме всички и прилагаме последната подредба
        this.products = [...this.allPromoProducts];
        this.onSortChanged(this.currentSort);
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
    const isHeatPump = !!p?.productType?.name && p.productType.name.toLowerCase().includes('термопомп');

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
          const nominal = values[1];
          const formatted = nominal.toFixed(1).replace(/\.?0+$/, '').replace('.', ',');
          return formatted;
        }
        // Single numeric case like '- / 5.96 / -'
        if (matches && matches.length === 1) {
          const val = parseFloat(matches[0].replace(',', '.'));
          const formatted = val.toFixed(1).replace(/\.?0+$/, '').replace('.', ',');
          return formatted;
        }
        return value;
      }
      return '';
    }

    const found = (p.attributes || []).find(a => (a.attributeKey || '').trim().toLowerCase() === normalizedKey);
    return (found?.attributeValue || '').toString();
  }
}

// Append compare handlers to class prototype (within class in actual edit above). For clarity, the proper placement is before the closing brace of the class.
