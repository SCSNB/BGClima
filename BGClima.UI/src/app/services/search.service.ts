import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ProductService, ProductDto, ProductFilterParams } from './product.service';

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
    // Load all products for search (using a large page size to get all at once)
    this.productService.getProducts({ page: 1, pageSize: 1000 }).subscribe({
      next: (response) => {
        this.allProducts = response.items;
        this.productsLoaded = true;
        console.log(`Loaded ${response.totalCount} products for search`);
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
  
  // Create search parameters
  debugger;
  const params: ProductFilterParams = {
    searchTerm: searchTerm,
    page: 1,
    pageSize: 100 // Adjust based on your needs
  };

  // Use the product service to search
  return this.productService.getProducts(params).pipe(
    map(response => {
      // Map the ProductDto[] to SearchResult[]
      return response.items.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        imageUrl: product.imageUrl,
        brand: product.brand?.name,
        slug: this.generateSlug(product.name)
      } as SearchResult));
    }),
    catchError(error => {
      console.error('Error performing search:', error);
      return of([]); // Return empty array on error
    })
  );
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
