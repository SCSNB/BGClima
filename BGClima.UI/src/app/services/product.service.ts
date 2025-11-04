import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { tap, switchMap, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ImageService } from './image.service';
import { AuthService } from './auth.service';

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
  displayName?: string; // Optional display name for UI
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

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export interface ProductFilterParams {
  brandIds?: number[];
  productTypeId?: number;
  isFeatured?: boolean;
  isOnSale?: boolean;
  isNew?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  energyClassIds?: number[];
  btuIds?: number[];
  roomSize?: string;
  MaxHatingPowers?: number[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = environment.production ? '/api/products' : `${environment.apiUrl}/api/products`;
  private readonly apiUrl = environment.production ? '/api' : `${environment.apiUrl}/api`;

  constructor(
    private http: HttpClient,
    private imageService: ImageService,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    let headers = new HttpHeaders();

    return headers.set('Authorization', `Bearer ${token}`);
  }

  getProducts(params?: ProductFilterParams): Observable<PaginatedResponse<ProductDto>> {
    console.log('Fetching products with params:', params);
    
    // Set up query parameters
    let httpParams = new HttpParams();
    
    // Add filter parameters if they exist
    if (params) {
      // Handle brand IDs array
      if (params.brandIds && params.brandIds.length > 0) {
        // Add each brand ID as a separate query parameter with the same name
        params.brandIds.forEach(id => {
          httpParams = httpParams.append('brandIds', id.toString());
        });
      }

      if (params.MaxHatingPowers && params.MaxHatingPowers.length > 0) {
        // Add each brand ID as a separate query parameter with the same name
        params.MaxHatingPowers.forEach(kw => {
          httpParams = httpParams.append('MaxHatingPowers', kw.toString());
        });
      }
      
      if (params.productTypeId) httpParams = httpParams.set('productTypeId', params.productTypeId.toString());
      if (params.isFeatured !== undefined) httpParams = httpParams.set('isFeatured', params.isFeatured.toString());
      if (params.isOnSale !== undefined) httpParams = httpParams.set('isOnSale', params.isOnSale.toString());
      if (params.isNew !== undefined) httpParams = httpParams.set('isNew', params.isNew.toString());
      if (params.minPrice !== undefined) httpParams = httpParams.set('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
      
      // Additional filters
      if (params.energyClassIds?.length) {
        params.energyClassIds.forEach(id => {
          httpParams = httpParams.append('energyClassIds', id.toString());
        });
      }
      if (params.btuIds?.length) {
        params.btuIds.forEach(id => {
          httpParams = httpParams.append('btuIds', id.toString());
        });
      }
      if (params.roomSize) httpParams = httpParams.set('roomSize', params.roomSize);
      
      // Pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 12;
      httpParams = httpParams.set('page', page.toString());
      httpParams = httpParams.set('pageSize', pageSize.toString());
      
      // Sorting
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    return this.http.get<PaginatedResponse<ProductDto>>(this.baseUrl, { params: httpParams }).pipe(
      tap({
        next: (response) => {
          console.log(`Successfully fetched page ${response.currentPage} of ${response.totalPages} with ${response.items?.length || 0} products`);
          if (response.items && response.items.length > 0) {
            console.log('Sample product:', {
              id: response.items[0].id,
              name: response.items[0].name,
              productType: response.items[0].productType,
              brand: response.items[0].brand
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
        // Return empty paginated response on error
        return of({
          items: [],
          totalCount: 0,
          pageSize: params?.pageSize || 12,
          currentPage: params?.page || 1,
          totalPages: 0
        });
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
    var headers = this.getAuthHeaders()
    return this.http.post<ProductDto>(this.baseUrl, dto, {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error creating product:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to create product'));
      })
    );
  }

  update(id: number, dto: CreateProductDto): Observable<void> {
    var headers = this.getAuthHeaders()
    return this.http.put<void>(`${this.baseUrl}/${id}`, dto, {headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error updating product ${id}:`, error);
        return throwError(() => new Error(error.error?.message || 'Failed to update product'));
      })
    );
  }

  delete(id: number): Observable<void> {
    console.log(`Starting deletion of product ${id}`);
    
    // First get the product to collect all image URLs
    return this.getProduct(id).pipe(
      tap(product => console.log(`Fetched product ${id} for deletion with ${product.images?.length || 0} images`)),
      switchMap(product => {
        const deleteObservables: Observable<void>[] = [];
        const headers = this.getAuthHeaders();
        
        // Add product images to deletion queue
        if (product.images && product.images.length > 0) {
          console.log(`Scheduling deletion of ${product.images.length} product images`);
          product.images.forEach((image, index) => {
            if (image.id) {
              console.log(`[${index + 1}/${product.images!.length}] Deleting product image with ID: ${image.id}`);
              deleteObservables.push(this.imageService.deleteImage(image.id));
            }
          });
        }
        
        // Add description images to deletion queue if they exist
        if (product.descriptionImages && product.descriptionImages.length > 0) {
          console.log(`Scheduling deletion of ${product.descriptionImages.length} description images`);
          product.descriptionImages.forEach((img, index) => {
            console.log(`[${index + 1}/${product.descriptionImages!.length}] Deleting description image with ID: ${img.id}`);
            deleteObservables.push(
              this.http.delete<void>(`${this.apiUrl}/images/${img.id}`, { headers })
            );
          });
        }
        
        // If there are images to delete, wait for all deletions to complete
        if (deleteObservables.length > 0) {
          console.log(`Waiting for ${deleteObservables.length} images to be deleted...`);
          return forkJoin(deleteObservables).pipe(
            tap(() => console.log(`All images deleted, now deleting product ${id}`)),
            switchMap(() => this.http.delete<void>(`${this.baseUrl}/${id}`, { headers })),
            tap(() => console.log(`Product ${id} deleted successfully`)),
            catchError((error: HttpErrorResponse) => {
              console.error(`Error during image deletion for product ${id}:`, error);
              return throwError(() => new Error(error.error?.message || 'Грешка при изтриване на снимките. Моля, опитайте отново.'));
            })
          );
        }
        
        // If no images to delete, just delete the product
        console.log(`No images to delete, proceeding with product ${id} deletion`);
        return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers }).pipe(
          tap(() => console.log(`Product ${id} deleted successfully (no images)`)),
          catchError((error: HttpErrorResponse) => {
            console.error(`Error deleting product ${id}:`, error);
            return throwError(() => new Error(error.error?.message || 'Грешка при изтриване на продукта. Моля, опитайте отново.'));
          })
        );
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Error fetching product ${id} for deletion:`, error);
        return throwError(() => new Error(error.error?.message || 'Грешка при зареждане на данните за продукта. Моля, опитайте отново.'));
      })
    );
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

  getProductsByCategory(page: number = 1, pageSize: number = 12, productTypeId?: number): Observable<PaginatedResponse<ProductDto>> {
   
    return this.getProducts({
      productTypeId: productTypeId,
      page: page,
      pageSize: pageSize
    });
  }

  deleteImage(imageId: number): Observable<void> {
    console.log(`ProductService.deleteImage called with ID: ${imageId}`);
    if (!imageId) {
      const error = new Error('Invalid image ID');
      console.error('Invalid image ID provided');
      return throwError(() => error);
    }
    
    return this.imageService.deleteImage(imageId).pipe(
      tap(() => console.log(`Successfully deleted image ${imageId} via ImageService`)),
      catchError(error => {
        console.error(`Error in ProductService.deleteImage for ID ${imageId}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Admin stats (counts)
  getAdminStats(): Observable<{ totalProducts: number } & Record<string, any>> {
    return this.http.get<{ totalProducts: number } & Record<string, any>>(`${this.baseUrl}/admin/stats`).pipe(
      tap({
        next: (stats) => console.log('Admin stats:', stats),
        error: (err) => console.error('Error fetching admin stats:', err)
      })
    );
  }
}