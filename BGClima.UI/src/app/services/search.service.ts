import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ProductDto } from './product.service';

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
  private readonly baseUrl = environment.production ? '/api/products' : `${environment.apiUrl}/api/products`;
  private readonly apiUrl = environment.production ? '/api' : `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  searchProducts(query: string): Observable<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      return of([]);
    }

    debugger;
    const encodedQuery = encodeURIComponent(query.trim());
    return this.http.get<ProductDto[]>(`${this.baseUrl}/search?searchTerm=${encodedQuery}`).pipe(
      map(products => {
        return products.map(product => ({
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
        return of([]);
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
