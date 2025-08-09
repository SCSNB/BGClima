import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BrandDto {
  id: number;
  name: string;
}

export interface ProductTypeDto {
  id: number;
  name: string;
}

export interface BTUDto {
  id: number;
  value: string;
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
  sku?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  brand?: BrandDto;
  btu?: BTUDto;
  productType?: ProductTypeDto;
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
  stockQuantity?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  isNew?: boolean;
  sku?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  metaDescription?: string;
  metaKeywords?: string;
  imageUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = `${environment.apiUrl}/api/v2/products`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(this.baseUrl);
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

  create(dto: CreateProductDto): Observable<ProductDto> {
    return this.http.post<ProductDto>(this.baseUrl, dto);
  }

  update(id: number, dto: CreateProductDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
} 