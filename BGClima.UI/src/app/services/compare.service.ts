import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductDto } from './product.service';

const STORAGE_KEY = 'compare_products';
const MAX_COMPARE = 4; // опционално ограничение като в повечето магазини

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
    if (list.length >= MAX_COMPARE) {
      return { ok: false, reason: 'Достигнат е максималният брой за сравнение' };
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
    return { selected: true, ok: res.ok, reason: res.reason };
  }

  clear() {
    this.productsSubject.next([]);
    this.countSubject.next(0);
    this.persist([]);
  }
}
