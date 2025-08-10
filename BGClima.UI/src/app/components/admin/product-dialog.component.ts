import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { 
  ProductService, 
  BrandDto, 
  ProductTypeDto, 
  CreateProductDto, 
  ProductDto, 
  BTUDto, 
  EnergyClassDto,
  CreateProductAttributeDto
} from '../../services/product.service';

export interface ProductDialogData {
  mode: 'create' | 'edit';
  product?: ProductDto;
}

@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html',
  styles: [`
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      padding: 1rem 0;
    }
    
    .full {
      grid-column: 1 / -1;
    }
    
    .attributes-list {
      margin-bottom: 1rem;
    }
    
    .attribute-item {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      background: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
    
    .attribute-key {
      font-weight: 500;
      margin-right: 0.5rem;
    }
    
    .attribute-value {
      flex: 1;
      margin-right: 0.5rem;
    }
    
    .add-attribute {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }
    
    .add-attribute .mat-form-field {
      flex: 1;
    }
  `]
})
export class ProductDialogComponent implements OnInit {
  form: FormGroup;
  brands: BrandDto[] = [];
  types: ProductTypeDto[] = [];
  btu: BTUDto[] = [];
  energyClasses: EnergyClassDto[] = [];
  attributes: CreateProductAttributeDto[] = [];
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
      energyClassId: [data.product?.energyClass?.id ?? null],
      sku: [data.product?.sku ?? ''],
      imageUrl: [data.product?.imageUrl ?? ''],
      attributeKey: [''],
      attributeValue: ['']
    });
  }

  ngOnInit(): void {
    this.title = this.data.mode === 'create' ? 'Нов продукт' : 'Редакция на продукт';

    this.productService.getBrands().subscribe(brands => this.brands = brands);
    this.productService.getTypes().subscribe(types => this.types = types);
    this.productService.getBTU().subscribe(btu => this.btu = btu);
    this.productService.getEnergyClasses().subscribe(classes => this.energyClasses = classes);
    
    // Load existing attributes if in edit mode
    if (this.data.mode === 'edit' && this.data.product?.attributes) {
      this.attributes = this.data.product.attributes.map(attr => ({
        attributeKey: attr.attributeKey,
        attributeValue: attr.attributeValue,
        groupName: attr.groupName,
        displayOrder: attr.displayOrder,
        isVisible: attr.isVisible
      }));
    }
  }

  submit(): void {
    if (this.form.invalid) return;

    const dto: CreateProductDto = {
      name: this.form.value.name,
      description: this.form.value.description || '',
      price: this.form.value.price,
      brandId: this.form.value.brandId,
      productTypeId: this.form.value.productTypeId,
      btuId: this.form.value.btuId || null,
      energyClassId: this.form.value.energyClassId || null,
      sku: this.form.value.sku || '',
      imageUrl: this.form.value.imageUrl || '',
      attributes: this.attributes.length > 0 ? this.attributes : undefined,
      isActive: true,
      isNew: true,
      isOnSale: false,
      isFeatured: false,
      stockQuantity: 0,
      seoTitle: this.form.value.name,
      seoDescription: this.form.value.description || '',
      seoKeywords: this.form.value.name,
      metaDescription: this.form.value.description || '',
      metaKeywords: this.form.value.name
    };

    console.log('Submitting product:', dto);

    this.dialogRef.close({ action: this.data.mode, dto });
  }

  addAttribute(): void {
    const key = this.form.get('attributeKey')?.value;
    const value = this.form.get('attributeValue')?.value;
    
    if (key && value) {
      this.attributes.push({
        attributeKey: key,
        attributeValue: value,
        groupName: 'General',
        displayOrder: this.attributes.length,
        isVisible: true
      });
      this.form.get('attributeKey')?.setValue('');
      this.form.get('attributeValue')?.setValue('');
    }
  }

  removeAttribute(index: number): void {
    this.attributes.splice(index, 1);
  }

  cancel(): void {
    this.dialogRef.close();
  }
} 