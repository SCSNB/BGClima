import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ProductService, ProductDto } from '../../services/product.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ViewportScroller } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0px', minHeight: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('topElement') topElement!: ElementRef;
  private destroy$ = new Subject<void>();
  
  // Състояние на компонента
  product: ProductDto | null = null;
  loading = true;
  error: string | null = null;
  quantity = 1;
  selectedImage: string | null = null;
  isDescriptionExpanded = false;
  descriptionMaxLength = 300; // Maximum characters to show when collapsed
  activeTab = 0;
  relatedProducts: any[] = [];
  expandedGroups = new Set<string>();
  tabs = ['Описание', 'Спецификации'];
  
  // Toggle description expansion
  toggleDescription(): void {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }
  
  // Get short description with ellipsis if needed
  getShortDescription(description: string): string {
    if (!description) return '';
    if (this.isDescriptionExpanded || description.length <= this.descriptionMaxLength) {
      return description;
    }
    return description.substring(0, this.descriptionMaxLength) + '...';
  }
  
  // Check if description should show read more button
  shouldShowReadMore(description: string | undefined): boolean {
    return !!description && (description as string).length > this.descriptionMaxLength;
  }

  // Define a custom type for specification keys
  private getSpecificationValue(key: 'power' | 'class' | 'cooling' | 'heating'): string | null {
    if (!this.product) return null;
    
    // Direct property access for known properties
    switch(key) {
      case 'power':
        return this.product.btu?.value?.toString() || null;
      case 'class':
        return this.product.energyClass?.class || null;
      case 'cooling':
        return this.product.coolingCapacity || null;
      case 'heating':
        return this.product.heatingCapacity || null;
      default:
        return null;
    }
  }

  // Get product specifications in the same format as the offers component
  getProductSpecs() {
    if (!this.product) return [];
    
    const getAttr = (key: string): string => {
      const found = (this.product?.attributes || []).find(a => 
        (a.attributeKey || '').trim().toLowerCase() === key.toLowerCase()
      );
      return (found?.attributeValue || '').toString();
    };

    return [
      { 
        label: 'Мощност', 
        value: this.product.btu?.value?.toString() || getAttr('Мощност') || '0', 
        icon: 'bolt' 
      },
      { 
        label: 'Клас', 
        value: this.product.energyClass?.class || getAttr('Клас') || 'A+', 
        icon: 'eco' 
      },
      { 
        label: 'Охлаждане', 
        value: this.product.coolingCapacity || getAttr('Охлаждане') || '0', 
        icon: 'ac_unit' 
      },
      { 
        label: 'Отопление', 
        value: this.product.heatingCapacity || getAttr('Отопление') || '0', 
        icon: 'wb_sunny' 
      }
    ];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private viewportScroller: ViewportScroller
  ) {
    // Слушане за промени в маршрута
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Използваме забавяне, за да се уверим, че viewport е готов
      setTimeout(() => this.scrollToTop(), 0);
    });
  }

  ngOnInit(): void {
    // Първоначално скролване веднага
    this.scrollToTop();
    
    // Зареждане на продукта
    this.loadProduct();
    
    // Допълнително скролване след всичко е заредено
    const scrollCheck = setInterval(() => {
      if (document.readyState === 'complete') {
        this.scrollToTop();
        clearInterval(scrollCheck);
      }
    }, 50);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private scrollToTop(): void {
    try {
      // Първо опитваме с Angular ViewportScroller
      this.viewportScroller.scrollToPosition([0, 0]);
      
      // След това с нативното window.scrollTo
      if (typeof window !== 'undefined') {
        // Добавяме поведение 'smooth' за по-добър потребителски опит
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }
      
      // Допълнително осигуряване чрез scrollIntoView
      if (this.topElement?.nativeElement) {
        this.topElement.nativeElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start' 
        });
      }
      
      // Крайно резервно решение
      if (typeof document !== 'undefined') {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    } catch (error) {
      console.error('Грешка при скролване нагоре:', error);
    }
  }
  
  // Промяна на количеството с валидация
  updateQuantity(change: number): void {
    if (!this.product) return;
    
    this.quantity = Math.max(1, Math.min(this.quantity + change, this.product.stockQuantity || 1));
  }
  
  // Превключване между табове
  setActiveTab(index: number): void {
    this.activeTab = index;
  }

  // Зареждане на продукта по ID
  loadProduct(): void {
    try {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        this.handleError('Невалиден идентификатор на продукт');
        return;
      }
      
      this.loading = true;
      this.productService.getProduct(+id).subscribe({
        next: (product) => this.handleProductLoadSuccess(product),
        error: (err) => this.handleProductLoadError(err)
      });
    } catch (error) {
      this.handleError('Неочаквана грешка при зареждане на продукта', error);
    }
  }
  
  // Успешно зареждане на продукт
  private handleProductLoadSuccess(product: any): void {
    try {
      this.product = product;
      console.log('Product attributes:', product.attributes); // Debug log
      this.setupProductImage(product);
      
      // Зареждане на свързани продукти, ако има product.id
      if (product?.id) {
        this.loadRelatedProducts(product.id);
      }
      
      this.loading = false;
      setTimeout(() => this.scrollToTop(), 100);
    } catch (error) {
      this.handleError('Грешка при обработка на данните за продукта', error);
    }
  }
  
  // Настройване на изображението на продукта
  private setupProductImage(product: any): void {
    try {
      if (!product?.images?.length) {
        this.selectedImage = 'assets/no-image.png';
        return;
      }
      
      const firstImage = product.images[0];
      if (typeof firstImage === 'string') {
        this.selectedImage = this.getImageUrl(firstImage);
      } else if (firstImage?.url) {
        this.selectedImage = this.getImageUrl(firstImage.url);
      } else if (firstImage?.imageUrl) {
        this.selectedImage = this.getImageUrl(firstImage.imageUrl);
      } else if (firstImage?.path) {
        this.selectedImage = this.getImageUrl(firstImage.path);
      } else {
        console.warn('Could not determine image source from:', firstImage);
        this.selectedImage = 'assets/no-image.png';
      }
    } catch (error) {
      console.error('Error setting up product image:', error);
      this.selectedImage = 'assets/no-image.png';
    }
  }
  
  // Избор на изображение
  selectImage(image: string | { url?: string; imageUrl?: string; path?: string; format?: string }): void {
    try {
      let imageUrl = '';
      let imageFormat: string | undefined;
      
      if (typeof image === 'string') {
        imageUrl = image;
      } else {
        // Handle object with image properties
        if (image?.url) {
          imageUrl = image.url;
        } else if (image?.imageUrl) {
          imageUrl = image.imageUrl;
        } else if (image?.path) {
          imageUrl = image.path;
        } else {
          console.warn('Невалиден формат на изображението:', image);
          this.selectedImage = 'assets/no-image.png';
          return;
        }
        
        // Get format if provided in the image object
        imageFormat = image.format;
      }
      
      // Handle different image formats if format is specified
      if (imageFormat) {
        if (imageFormat === 'webp') {
          imageUrl += '.webp';
        } else if (imageFormat === 'jpg' || imageFormat === 'jpeg') {
          imageUrl += '.jpg';
        } else if (imageFormat === 'png') {
          imageUrl += '.png';
        }
      }
      
      this.selectedImage = this.getImageUrl(imageUrl);
    } catch (error) {
      console.error('Грешка при избор на изображение:', error);
      this.selectedImage = 'assets/no-image.png';
    }
  }
  
  // Грешка при зареждане на продукт
  private handleProductLoadError(error: any): void {
    console.error('Грешка при зареждане на продукта:', error);
    this.error = 'Грешка при зареждане на продукта. Моля, опитайте отново по-късно.';
    this.loading = false;
  }
  
  // Обща обработка на грешки
  private handleError(message: string, error?: any): void {
    if (error) {
      console.error(`${message}:`, error);
    } else {
      console.error(message);
    }
    this.error = message;
    this.loading = false;
  }

  // Зареждане на свързани продукти
  private loadRelatedProducts(productId: number): void {
    this.productService.getRelatedProducts(productId, 4).subscribe({
      next: (products: any[]) => this.relatedProducts = products || [],
      error: (err: any) => console.error('Грешка при зареждане на свързани продукти:', err)
    });
  }

  // Обработка на грешки при зареждане на изображения
  handleImageError(event: Event): void {
    try {
      const imgElement = event.target as HTMLImageElement;
      if (imgElement) {
        // Задаваме изображение по подразбиране
        imgElement.src = 'assets/no-image.png';
        imgElement.style.display = 'block';
      }
    } catch (error) {
      console.error('Грешка при обработка на грешка при зареждане на изображение:', error);
    }
  }

  // Връща пълния URL на изображението
  getImageUrl(url: string | undefined): string {
    // Ако няма URL, връщаме изображение по подразбиране
    if (!url) return 'assets/no-image.png';
    
    try {
      // Премахваме кавички, ако има такива
      const cleanUrl = url.replace(/^['"]|['"]$/g, '').trim();
      
      // Ако вече е пълен URL или започва с /assets/
      if (cleanUrl.startsWith('http') || cleanUrl.startsWith('assets/')) {
        return cleanUrl;
      }
      
      // Ако започва с наклонена черта, добавяме базовия URL
      if (cleanUrl.startsWith('/')) {
        const baseUrl = 'http://localhost:5000'; // Трябва да се замени с правилния базов URL
        return `${baseUrl}${cleanUrl}`;
      }
      
      // В противен случай го третираме като име на файл в папката с продукти
      return `assets/images/products/${cleanUrl}`;
    } catch (error) {
      console.error('Грешка при обработка на URL на изображение:', error);
      return 'assets/no-image.png';
    }
  }

  // Проверка дали URL е валиден
  isUrlValid(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Връща всички атрибути с ключ "АКЦЕНТИ"
  getAccentAttributes(): any[] {
    if (!this.product?.attributes?.length) return [];
    
    console.log('Всички атрибути:', this.product.attributes);
    
    const accentAttributes = this.product.attributes.filter(attr => {
      const isAccent = attr.attributeKey && 
                      (attr.attributeKey.toUpperCase() === 'АКЦЕНТИ' || 
                       attr.attributeKey.toUpperCase().includes('АКЦЕНТ'));
      return isAccent && attr.attributeValue;
    });
    
    console.log('Намерени акцентни атрибути:', accentAttributes);
    return accentAttributes;
  }
  
  // Връща стойност на атрибут по ключ
  getAttributeValue(key: string): string | null {
    if (!this.product?.attributes) return null;
    
    const attribute = this.product.attributes.find(attr => 
      attr.attributeKey?.toLowerCase() === key.toLowerCase()
    );
    
    return attribute?.attributeValue || null;
  }
  
  // Връща групите от атрибути
  getAttributeGroups(): string[] {
    if (!this.product?.attributes) return [];
    const groups = new Set<string>();
    this.product.attributes.forEach(attr => {
      if (attr.groupName) {
        groups.add(attr.groupName);
      } else {
        groups.add('Други характеристики');
      }
    });
    return Array.from(groups);
  }

  getAttributesByGroup(groupName: string): any[] {
    if (!this.product?.attributes) return [];
    return this.product.attributes.filter(attr => 
      (attr.groupName || 'Други характеристики') === groupName
    );
  }

  toggleGroup(group: string): void {
    if (this.expandedGroups.has(group)) {
      this.expandedGroups.delete(group);
    } else {
      this.expandedGroups.add(group);
    }
  }

  isGroupExpanded(group: string): boolean {
    return this.expandedGroups.has(group);
  }

  getMainFeatures(): any[] {
    if (!this.product?.attributes) return [];
    return this.product.attributes.filter(attr => attr.isVisible !== false).slice(0, 4);
  }

  formatAttributeValue(attr: any): string {
    if (!attr.attributeValue) return '—';
    if (attr.attributeKey.toLowerCase().includes('price')) {
      return `${parseFloat(attr.attributeValue).toFixed(2)} лв.`;
    }
    return attr.attributeValue;
  }

  printSpecifications(): void {
    window.print();
  }

}
