import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
  styleUrls: ['./promo-products.component.scss']
})
export class PromoProductsComponent implements OnInit {
  title = 'ПРОМО оферти';
  loading = true;
  products: ProductCard[] = [];
  private lastSortKey: string = '';
  
  // Current filter state
  filters: {
    brands: string[];
    price: { lower: number; upper: number };
    energyClasses: string[];
    btus: string[];
    roomSizeRanges: string[];
  } = {
    brands: [],
    price: { lower: 0, upper: 0 },
    energyClasses: [],
    btus: [],
    roomSizeRanges: []
  };
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
    private dialog: MatDialog
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

  applyFilters() {
    this.closeFiltersDialog();
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

  onFiltersChanged = (f: { brands: string[]; price: { lower: number; upper: number }; energyClasses: string[]; btus: string[]; roomSizeRanges: string[] }) => {
    // Запази последния избор, за да се подаде като preset при повторно отваряне на диалога
    this.filters = {
      brands: [...(f.brands || [])],
      price: { lower: Number(f.price?.lower ?? this.minPrice), upper: Number(f.price?.upper ?? this.maxPrice) },
      energyClasses: [...(f.energyClasses || [])],
      btus: [...(f.btus || [])],
      roomSizeRanges: [...(f.roomSizeRanges || [])]
    };
    const byBrand = (p: ProductCard) => !f.brands.length || !!p.brand && f.brands.includes(p.brand.name);
    const byPrice = (p: ProductCard) => {
      const price = p.price || 0;
      return price >= f.price.lower && price <= f.price.upper;
    };
    const byClass = (p: ProductCard) => !f.energyClasses.length || !!p.energyClass && f.energyClasses.includes(p.energyClass.class);
    const byBTU = (p: ProductCard) => {
      if (!f.btus.length) return true;
      const btu = (p.btu?.value ?? '').toString();
      const match = btu.match(/(\d+(?:\.\d+)?)/);
      const k = match ? Math.round(parseFloat(match[1]) / 1000).toString() : '';
      return f.btus.includes(k) || f.btus.includes((p.btu as any)?.value?.toString?.() ?? '');
    };
    const byRoomSize = (p: ProductCard) => {
      if (!f.roomSizeRanges.length) return true;
      
      const roomSizeAttr = (p.attributes || []).find(a => 
        (a.attributeKey || '').toLowerCase().includes('подходящ за помещения')
      );
      
      if (roomSizeAttr && roomSizeAttr.attributeValue) {
        // Извличаме числовата стойност от атрибута (например "45 кв.м" -> 45)
        const roomSizeMatch = roomSizeAttr.attributeValue.match(/(\d+(\.\d+)?)/);
        if (roomSizeMatch) {
          const roomSize = parseFloat(roomSizeMatch[0]);
          return f.roomSizeRanges.some(range => {
            const [min, max] = range.split('-').map(Number);
            return roomSize >= min && roomSize <= max;
          });
        }
      }
      return false;
    };
    
    this.products = this.allPromoProducts
      .filter(p => byBrand(p) && byPrice(p) && byClass(p) && byBTU(p) && byRoomSize(p));
    // re-apply last sort to keep ordering consistent
    this.onSortChanged(this.lastSortKey);
  };

  onSortChanged = (key: string) => {
    // Normalize incoming keys from different sources
    const map: Record<string, string> = {
      priceAsc: 'price-asc',
      priceDesc: 'price-desc',
      nameAsc: 'name-asc',
      nameDesc: 'name-desc'
    };
    key = map[key] || key;
    this.lastSortKey = key;

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

  get currentSortLabel(): string {
    switch (this.lastSortKey) {
      case 'price-asc': return 'Ниска цена';
      case 'price-desc': return 'Висока цена';
      case 'name-asc': return 'A → Я';
      case 'name-desc': return 'Я → A';
      default: return 'Сортиране';
    }
  }

  private loadPromoProducts(): void {
    this.productService.getProducts().subscribe({
      next: (all) => {
        const filtered = (all || []).filter(p => !!p.isOnSale);
        this.allPromoProducts = filtered.map(p => {
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
        this.onSortChanged(this.lastSortKey);
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
