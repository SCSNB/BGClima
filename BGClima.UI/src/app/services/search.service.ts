import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ProductService, ProductDto } from './product.service';

export interface SearchResult {
  id: number;
  name: string;
  price: number;
  oldPrice?: number | null;
  imageUrl?: string;
  brand?: string;
  slug?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private allProducts: ProductDto[] = [];
  private productsLoaded = false;

  constructor(private productService: ProductService) {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.productsLoaded = true;
        console.log(`Loaded ${products.length} products for search`);
      },
      error: (error) => {
        console.error('Error loading products for search:', error);
        this.productsLoaded = true; // Set to true to prevent infinite loading
      }
    });
  }

  searchProducts(query: string): Observable<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return of([]);
    }

    if (!this.productsLoaded) {
      // If products aren't loaded yet, wait and try again
      return new Observable(observer => {
        const checkInterval = setInterval(() => {
          if (this.productsLoaded) {
            clearInterval(checkInterval);
            this.performSearch(query).subscribe(observer);
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          observer.next([]);
          observer.complete();
        }, 5000);
      });
    }

    return this.performSearch(query);
  }

  private performSearch(query: string): Observable<SearchResult[]> {
    const searchTerm = query.toLowerCase().trim();
    
    const filtered = this.allProducts.filter(product => {
      // Search in product name
      if (product.name?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in brand name
      if (product.brand?.name?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in description
      if (product.description?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in SKU
      if (product.sku?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      return false;
    });

    // Sort results by relevance (exact matches first, then partial matches)
    const sorted = filtered.sort((a, b) => {
      const aName = a.name?.toLowerCase() || '';
      const bName = b.name?.toLowerCase() || '';
      const aBrand = a.brand?.name?.toLowerCase() || '';
      const bBrand = b.brand?.name?.toLowerCase() || '';
      
      // Exact name matches first
      if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
      if (!aName.startsWith(searchTerm) && bName.startsWith(searchTerm)) return 1;
      
      // Exact brand matches second
      if (aBrand.startsWith(searchTerm) && !bBrand.startsWith(searchTerm)) return -1;
      if (!aBrand.startsWith(searchTerm) && bBrand.startsWith(searchTerm)) return 1;
      
      // Then alphabetical by name
      return aName.localeCompare(bName);
    });

    // Limit to top 8 results
    const results = sorted.slice(0, 8).map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      imageUrl: product.imageUrl,
      brand: product.brand?.name,
      slug: this.generateSlug(product.name)
    }));

    return of(results);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }
}
