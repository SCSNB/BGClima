import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductDto } from './product.service';

const STORAGE_KEY = 'compare_products';
const DESKTOP_MAX_COMPARE = 4; // ограничение за десктоп
const MOBILE_MAX_COMPARE = 2;  // ограничение за мобилно
const MOBILE_BREAKPOINT = 576; // px, синхронизирано с SCSS медиите

@Injectable({ providedIn: 'root' })
export class CompareService {
  private productsSubject = new BehaviorSubject<ProductDto[]>(this.loadFromStorage());
  products$: Observable<ProductDto[]> = this.productsSubject.asObservable();

  private countSubject = new BehaviorSubject<number>(this.productsSubject.value.length);
  count$: Observable<number> = this.countSubject.asObservable();

  private loadFromStorage(): ProductDto[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as ProductDto[];
    } catch {
      return [];
    }
  }

  private persist(list: ProductDto[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  private isMobileViewport(): boolean {
    try {
      return typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;
    } catch {
      return false;
    }
  }

  private currentMaxCompare(): number {
    return this.isMobileViewport() ? MOBILE_MAX_COMPARE : DESKTOP_MAX_COMPARE;
  }

  // Публичен getter за текущия лимит (полезно за UI/дизабъл на бутони)
  getMaxCompare(): number {
    return this.currentMaxCompare();
  }

  // Alias for getAll() to maintain backward compatibility
  getCompareList(): ProductDto[] {
    return this.productsSubject.value;
  }

  // Get list of product IDs in compare
  getCompareListIds(): number[] {
    return this.productsSubject.value.map(p => p.id);
  }

  // Check if a product is in compare list
  isInCompareList(productId: number): boolean {
    return this.productsSubject.value.some(p => p.id === productId);
  }

  // Toggle product in compare list
  toggleCompare(product: ProductDto): boolean {
    const currentList = this.productsSubject.value;
    const maxCompare = this.currentMaxCompare();
    
    // Check if product is already in compare list
    const existingIndex = currentList.findIndex(p => p.id === product.id);
    
    if (existingIndex > -1) {
      // Remove from compare
      const newList = [...currentList];
      newList.splice(existingIndex, 1);
      this.productsSubject.next(newList);
      this.countSubject.next(newList.length);
      this.persist(newList);
      return false;
    } else if (currentList.length >= maxCompare) {
      // Can't add more items
      return false;
    } else {
      // Add to compare
      const newList = [...currentList, product];
      this.productsSubject.next(newList);
      this.countSubject.next(newList.length);
      this.persist(newList);
      return true;
    }
  }

  getAll(): ProductDto[] {
    return this.productsSubject.value;
  }

  isSelected(id: number): boolean {
    return this.productsSubject.value.some(p => p.id === id);
    }

  add(product: ProductDto): { ok: boolean; reason?: string } {
    const list = this.productsSubject.value;
    if (this.isSelected(product.id)) {
      return { ok: true };
    }
    const max = this.currentMaxCompare();
    if (list.length >= max) {
      const reason = this.isMobileViewport()
        ? `В мобилен изглед можете да сравнявате до ${MOBILE_MAX_COMPARE} продукта`
        : `Можете да сравнявате до ${DESKTOP_MAX_COMPARE} продукта`;
      return { ok: false, reason };
    }
    const next = [...list, product];
    this.productsSubject.next(next);
    this.countSubject.next(next.length);
    this.persist(next);
    return { ok: true };
  }

  remove(productId: number) {
    const next = this.productsSubject.value.filter(p => p.id !== productId);
    this.productsSubject.next(next);
    this.countSubject.next(next.length);
    this.persist(next);
  }

  toggle(product: ProductDto): { selected: boolean; ok: boolean; reason?: string } {
    if (this.isSelected(product.id)) {
      this.remove(product.id);
      return { selected: false, ok: true };
    }
    const res = this.add(product);
    return { selected: res.ok, ok: res.ok, reason: res.reason };
  }

  clear() {
    this.productsSubject.next([]);
    this.countSubject.next(0);
    this.persist([]);
  }
}
