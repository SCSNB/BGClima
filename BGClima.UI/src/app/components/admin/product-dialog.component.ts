import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductService, BrandDto, ProductTypeDto, CreateProductDto, ProductDto, BTUDto } from '../../services/product.service';

export interface ProductDialogData {
  mode: 'create' | 'edit';
  product?: ProductDto;
}

@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html',
})
export class ProductDialogComponent implements OnInit {
  form: FormGroup;
  brands: BrandDto[] = [];
  types: ProductTypeDto[] = [];
  btu: BTUDto[] = [];
  title = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductDialogData
  ) {
    this.form = this.fb.group({
      name: [data.product?.name ?? '', [Validators.required, Validators.maxLength(200)]],
      description: [data.product?.description ?? ''],
      price: [data.product?.price ?? 0, [Validators.required, Validators.min(0)]],
      brandId: [data.product?.brand?.id ?? null, Validators.required],
      productTypeId: [data.product?.productType?.id ?? null, Validators.required],
      btuId: [data.product?.btu?.id ?? null],
      sku: [data.product?.sku ?? ''],
      imageUrl: [data.product?.imageUrl ?? '']
    });
  }

  ngOnInit(): void {
    this.title = this.data.mode === 'create' ? 'Нов продукт' : 'Редакция на продукт';

    this.productService.getBrands().subscribe(brands => this.brands = brands);
    this.productService.getTypes().subscribe(types => this.types = types);
    this.productService.getBTU().subscribe(btu => this.btu = btu);
  }

  submit(): void {
    if (this.form.invalid) return;

    const dto: CreateProductDto = {
      name: this.form.value.name,
      description: this.form.value.description,
      price: this.form.value.price,
      brandId: this.form.value.brandId,
      productTypeId: this.form.value.productTypeId,
      btuId: this.form.value.btuId,
      sku: this.form.value.sku ?? '',
      imageUrl: this.form.value.imageUrl ?? '',
      isActive: true,
      isNew: true,
      isOnSale: false,
      isFeatured: false,
      stockQuantity: 0,
      seoTitle: this.form.value.name,
      seoDescription: this.form.value.description ?? '',
      seoKeywords: this.form.value.name,
      metaDescription: this.form.value.description ?? '',
      metaKeywords: this.form.value.name
    };

    this.dialogRef.close({ action: this.data.mode, dto });
  }

  cancel(): void {
    this.dialogRef.close();
  }
} 