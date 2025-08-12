import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface BrandDto {
  id: number;
  name: string;
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

export interface ProductDto {
  id: number;
  name: string;
  description?: string;
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
  productType?: ProductTypeDto;
  energyClass?: EnergyClassDto;
  attributes?: ProductAttributeDto[];
  images?: any[]; // TODO: Define proper type for images
  
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
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = 'http://localhost:5000/api/v2/products';
  private readonly apiUrl = 'http://localhost:5000/api/v2';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<ProductDto[]> {
    console.log('Fetching products from:', this.baseUrl);
    return this.http.get<ProductDto[]>(this.baseUrl).pipe(
      tap({
        next: (products) => console.log('Received products:', products),
        error: (err) => console.error('Error fetching products:', err)
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
        next: (product) => console.log('Received product:', product),
        error: (err) => console.error(`Error fetching product ${id}:`, err)
      })
    );
  }
} 