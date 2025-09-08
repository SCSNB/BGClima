import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface BrandDto {
  id: number;
  name: string;
  country?: string;
}

export interface ProductTypeDto {
  id: number;
  name: string;
}

export interface EnergyClassDto {
  id: number;
  class: string;
}

export interface BTUDto {
  id: number;
  value: string;
}

export interface ProductAttributeDto {
  id: number;
  attributeKey: string;
  attributeValue: string;
  groupName: string;
  displayOrder: number;
  isVisible: boolean;
  productId: number;
}

export interface ProductDescriptionImageDto {
  id: number;
  imageUrl: string;
  altText: string;
  displayOrder: number;
}

export interface ProductSpec {
  icon: string;
  label: string;
  value: string;
}

export interface ProductDto {
  id: number;
  name: string;
  description?: string;
  specs?: ProductSpec[];
  price: number;
  oldPrice?: number | null;
  isOnSale?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  stockQuantity: number;
  sku?: string;
  imageUrl?: string;
  brand?: BrandDto;
  btu?: BTUDto;
  energyClass?: EnergyClassDto;
  coolingCapacity?: string;
  heatingCapacity?: string;
  attributes?: ProductAttributeDto[];
  productType?: ProductTypeDto;
  images?: any[]; // TODO: Define proper type for images
  descriptionImages?: ProductDescriptionImageDto[];
  
  // Backward compatibility
  brandId?: number;
  productTypeId?: number;
  btuId?: number;
  energyClassId?: number;
}

export interface CreateProductAttributeDto {
  attributeKey: string;
  attributeValue: string;
  groupName?: string;
  displayOrder?: number;
  isVisible?: boolean;
}

export interface CreateProductDescriptionImageDto {
  imageUrl: string;
  altText?: string;
  displayOrder?: number;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  brandId: number;
  btuId?: number | null;
  energyClassId?: number | null;
  productTypeId: number;
  price: number;
  oldPrice?: number | null;
  attributes?: CreateProductAttributeDto[];
  stockQuantity?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  isNew?: boolean;
  sku?: string;
  imageUrl?: string;
  descriptionImages?: CreateProductDescriptionImageDto[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = environment.production ? '/api/products' : `${environment.apiUrl}/api/products`;
  private readonly apiUrl = environment.production ? '/api' : `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<ProductDto[]> {
    console.log('Fetching products from:', this.baseUrl);
    return this.http.get<ProductDto[]>(this.baseUrl).pipe(
      tap({
        next: (products) => {
          console.log(`Successfully fetched ${products?.length || 0} products`);
          if (products && products.length > 0) {
            console.log('Sample product:', {
              id: products[0].id,
              name: products[0].name,
              productType: products[0].productType,
              brand: products[0].brand
            });
          }
        },
        error: (err) => {
          console.error('Error fetching products:', err);
          console.error('Error details:', {
            status: err.status,
            statusText: err.statusText,
            url: err.url,
            error: err.error
          });
        }
      }),
      catchError(err => {
        console.error('Failed to fetch products:', err);
        return of([]); // Return empty array on error to prevent breaking the app
      })
    );
  }

  getBrands(): Observable<BrandDto[]> {
    return this.http.get<BrandDto[]>(`${this.baseUrl}/brands`);
  }

  getTypes(): Observable<ProductTypeDto[]> {
    return this.http.get<ProductTypeDto[]>(`${this.baseUrl}/types`);
  }

  getBTU(): Observable<BTUDto[]> {
    return this.http.get<BTUDto[]>(`${this.baseUrl}/btu`);
  }

  getEnergyClasses(): Observable<EnergyClassDto[]> {
    return this.http.get<EnergyClassDto[]>(`${this.apiUrl}/EnergyClass`);
  }

  create(dto: CreateProductDto): Observable<ProductDto> {
    return this.http.post<ProductDto>(this.baseUrl, dto);
  }

  update(id: number, dto: CreateProductDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getProduct(id: number): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.baseUrl}/${id}`).pipe(
      tap({
        next: (product) => {
          console.log('Fetched product:', product);
        },
        error: (err) => {
          console.error('Error fetching product:', err);
        }
      })
    );
  }

  getProductBySlug(slug: string): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.baseUrl}/by-slug/${slug}`).pipe(
      tap({
        next: (product) => {
          console.log('Fetched product by slug:', product);
        },
        error: (err) => {
          console.error('Error fetching product by slug:', err);
        }
      })
    );
  }

  getRelatedProducts(productId: number, limit: number = 4): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(`${this.baseUrl}/${productId}/related?limit=${limit}`).pipe(
      tap({
        next: (products) => {
          console.log(`Fetched ${products.length} related products`);
        },
        error: (err) => {
          console.error('Error fetching related products:', err);
        }
      })
    );
  }

  getProductsByCategory(category: string): Observable<ProductDto[]> {
    console.log(`Getting products for category: ${category}`);
  
    // Map URL segments to product type names - updated to match the database
    const categoryToTypeMap: {[key: string]: string} = {
      'stenen-tip': 'Климатици стенен тип',
      'kolonen-tip': 'Климатици колонен тип',
      'kanalen-tip': 'Климатици канален тип',
      'kasetachen-tip': 'Климатици касетъчен тип',
      'podov-tip': 'Климатици подов тип',
      'podovo-tavanen-tip': 'Климатици подово-таванен тип',
      'vrf-vrv': 'VRF / VRV',
      'mobilni-prenosimi': 'Мобилни / преносими климатици',
      'termopompeni-sistemi': 'Термопомпени системи',
      'multisplit-sistemi': 'Мултисплит системи',
      'bgclima-toploobmennici': 'БГКЛИМА тръбни топлообменници'
    };
  
    const targetType = categoryToTypeMap[category];
  
    if (!targetType) {
      console.warn(`No product type mapping found for category: ${category}`);
      return this.getProducts();
    }

    console.log(`Mapped category '${category}' to type: '${targetType}'`);

    // First get all products
    return this.getProducts().pipe(
      tap(products => {
        console.log(`Total products received: ${products.length}`);
        // Log all unique product types for debugging
        const types = [...new Set(products.map(p => p.productType?.name))];
        console.log('Available product types:', types);
      }),
      map(products => {
        // Filter products by productType name (case insensitive and trimmed)
        const filtered = products.filter(p => 
          p.productType?.name?.trim().toLowerCase() === targetType.trim().toLowerCase()
        );
        
        console.log(`Found ${filtered.length} products for type: '${targetType}'`);
        if (filtered.length === 0) {
          console.warn('No products found for the specified type. Available types:', 
            [...new Set(products.map(p => p.productType?.name))]
          );
        }
        
        return filtered;
      }),
      catchError(err => {
        console.error(`Error filtering products for type '${targetType}':`, err);
        return of([]);
      })
    );
  }

  getAdminStats(): Observable<{ totalProducts: number } & Record<string, any>> {
    return this.http.get<{ totalProducts: number } & Record<string, any>>(`${this.baseUrl}/admin/stats`).pipe(
      tap({
        next: (stats) => console.log('Admin stats:', stats),
        error: (err) => console.error('Error fetching admin stats:', err)
      })
    );
  }
}