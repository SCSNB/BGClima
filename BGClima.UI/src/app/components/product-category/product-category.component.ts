import { Component, OnInit, ViewChild, TemplateRef, HostListener, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
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
  allProducts: ProductDto[] = []; // Store all products for the category
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
  loading: boolean = false;
  products: ProductCard[] = [];
  totalProducts: number = 0;

  constructor(
    private route: ActivatedRoute, 
    private productService: ProductService,
    public dialog: MatDialog,
    public compareService: CompareService,
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
    this.route.paramMap.subscribe(params => {
      const category = params.get('category');
      this.productTypeId = Number(category);
      
      if (category) {
        this.currentCategory = category;
        this.setCategoryTitle(category);
        this.loadProducts();
      }
    });
  }

  private computeMaxPrice(products: ProductCard[]): number {
    const prices = products.map(p => Number(p.price ?? 0)).filter(n => !isNaN(n));
    if (!prices.length) return 0;
    return Math.max(...prices);
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    // Force change detection by creating a new array reference
    this.applyFilters({...this.currentFilters});
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProductsByCategory(this.currentPage, this.pageSize, this.productTypeId).subscribe({
      next: (response) => {
        // Create new array references to trigger change detection
        this.products = response.items ? [...response.items] : [];
        this.allProducts = response.items ? [...response.items] : [];
        this.totalItems = response.totalCount || 0;
        
        // Update price range
        const newMaxPrice = this.computeMaxPrice(this.allProducts);
        if (newMaxPrice !== this.maxPrice) {
          this.maxPrice = newMaxPrice;
        }
        this.minPrice = 0;
        
        // Initialize filters if not set
        if (!this.currentFilters) {
          this.currentFilters = {
            brands: [],
            price: { lower: 0, upper: this.maxPrice },
            energyClasses: [],
            btus: [],
            roomSizeRanges: [],
            powerKws: [],
          };
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.products = [];
        this.allProducts = [];
        this.loading = false;
      }
    });
  }
  public applyFilters(filters: any): void {
    if (!filters || Object.keys(filters).length === 0) {
      this.loadProducts();
      return;
    }
    
    this.currentFilters = { ...filters };
    this.loading = true;
    
    // Prepare filter parameters for the API call
    const filterParams: any = {
      productTypeId: this.productTypeId,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    // Add brand filter if any brands are selected
    if (filters?.brands?.length) {
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
      filterParams.btuIds = btuIds;
    }

    if (filters?.powerKws?.length) {
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
        // Create a new array reference to trigger change detection
        this.products = response.items ? [...response.items] : [];
        this.totalItems = response.totalCount || 0;
        
        // If no items, ensure we show empty state
        if (this.products.length === 0) {
          this.allProducts = [];
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching filtered products:', error);
        this.products = [];
        this.loading = false;
      }
    });
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
}
