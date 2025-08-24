import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
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

    /* Image gallery styles */
    .images-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .image-item {
      position: relative;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 0.5rem;
      background: #fff;
      transition: all 0.2s;
    }

    .image-item.primary {
      border: 2px solid #3f51b5;
      box-shadow: 0 0 0 1px #3f51b5;
    }

    .image-item img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 3px;
      display: block;
    }

    .image-actions {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .primary-badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: #3f51b5;
      color: white;
      font-size: 0.7rem;
      padding: 0.1rem 0.5rem;
      border-radius: 10px;
    }

    .add-image-btn {
      margin-top: 1rem;
      width: 100%;
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
  editingAttributeIndex: number | null = null;
  title = '';
  images: { url: string, isPrimary: boolean }[] = [];
  newImageUrl: string = '';

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
      oldPrice: [data.product?.oldPrice ?? null, [Validators.min(0)]],
      stockQuantity: [data.product?.stockQuantity ?? 0, [Validators.required, Validators.min(0)]],
      brandId: [data.product?.brand?.id ?? null, Validators.required],
      productTypeId: [data.product?.productType?.id ?? null, Validators.required],
      btuId: [data.product?.btu?.id ?? null],
      energyClassId: [data.product?.energyClass?.id ?? null],
      sku: [data.product?.sku ?? ''],
      // isActive се управлява автоматично от бекенда спрямо наличност
      isFeatured: [data.product?.isFeatured ?? false],
      isOnSale: [data.product?.isOnSale ?? (data.product?.oldPrice ? true : false)],
      isNew: [data.product?.isNew ?? true],
      attributeKey: [''],
      attributeValue: ['']
    });
  }

  ngOnInit(): void {
    this.title = this.data.mode === 'create' ? 'Нов продукт' : 'Редакция на продукт';
    this.loadData();
  }

  loadData(): void {
    this.productService.getBrands().subscribe(brands => this.brands = brands);
    this.productService.getTypes().subscribe(types => this.types = types);
    this.productService.getBTU().subscribe(btu => this.btu = btu);
    this.productService.getEnergyClasses().subscribe(classes => this.energyClasses = classes);

    if (this.data.mode === 'edit' && this.data.product) {
      this.title = 'Редактиране на продукт';
      this.attributes = this.data.product.attributes?.map(attr => ({
        attributeKey: attr.attributeKey,
        attributeValue: attr.attributeValue,
        displayOrder: attr.displayOrder,
        groupName: attr.groupName,
        isVisible: attr.isVisible
      })) || [];

      // Load existing images
      if (this.data.product.images && this.data.product.images.length > 0) {
        this.images = this.data.product.images.map(img => ({
          url: img.imageUrl,
          isPrimary: img.isPrimary
        }));
      } else if (this.data.product.imageUrl) {
        // For backward compatibility with single image
        this.images = [{
          url: this.data.product.imageUrl,
          isPrimary: true
        }];
      }
    } else {
      this.title = 'Добавяне на нов продукт';
    }
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    if (this.images.length === 0) {
      alert('Моля, добавете поне една снимка към продукта');
      return;
    }

    const primaryImage = this.images.find(img => img.isPrimary) || this.images[0];
    
    const productData: any = {
      ...this.form.value,
      attributes: this.attributes.length > 0 ? this.attributes : undefined,
      imageUrl: primaryImage.url, // For backward compatibility
      isNew: !!this.form.value.isNew,
      isOnSale: !!this.form.value.isOnSale,
      isFeatured: !!this.form.value.isFeatured,
      stockQuantity: this.form.value.stockQuantity || 0,
      images: this.images.map((img, index) => ({
        imageUrl: img.url,
        altText: `Снимка на ${this.form.get('name')?.value || 'продукт'}`,
        displayOrder: index,
        isPrimary: img.isPrimary
      }))
    };

    console.log('Submitting product:', productData);
    this.dialogRef.close({ action: this.data.mode, dto: productData });
  }

  editAttribute(index: number): void {
    const attribute = this.attributes[index];
    this.editingAttributeIndex = index;
    this.form.patchValue({
      attributeKey: attribute.attributeKey,
      attributeValue: attribute.attributeValue
    });
  }

  addAttribute(): void {
    const key = this.form.get('attributeKey')?.value?.trim();
    const value = this.form.get('attributeValue')?.value?.trim();
    
    if (!key || !value) return;

    if (this.editingAttributeIndex !== null) {
      // Update existing attribute
      this.attributes[this.editingAttributeIndex] = {
        ...this.attributes[this.editingAttributeIndex],
        attributeKey: key,
        attributeValue: value
      };
      this.editingAttributeIndex = null;
    } else {
      // Add new attribute
      this.attributes.push({
        attributeKey: key,
        attributeValue: value,
        groupName: 'General',
        displayOrder: this.attributes.length,
        isVisible: true
      });
    }
    
    this.form.patchValue({
      attributeKey: '',
      attributeValue: ''
    });
  }

  removeAttribute(index: number): void {
    if (this.editingAttributeIndex === index) {
      this.editingAttributeIndex = null;
      this.form.patchValue({
        attributeKey: '',
        attributeValue: ''
      });
    } else if (this.editingAttributeIndex !== null && this.editingAttributeIndex > index) {
      this.editingAttributeIndex--;
    }
    this.attributes.splice(index, 1);
  }

  // Image management methods
  addImage(): void {
    if (this.newImageUrl && !this.images.some(img => img.url === this.newImageUrl)) {
      this.images.push({
        url: this.newImageUrl,
        isPrimary: this.images.length === 0 // First image is primary by default
      });
      this.newImageUrl = '';
    }
  }

  removeImage(index: number): void {
    const wasPrimary = this.images[index].isPrimary;
    this.images.splice(index, 1);
    
    // If we removed the primary image, set the first image as primary
    if (wasPrimary && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }
  }

  setPrimaryImage(index: number): void {
    // Set all images as not primary
    this.images.forEach(img => img.isPrimary = false);
    // Set the selected image as primary
    this.images[index].isPrimary = true;
  }

  cancel(): void {
    this.dialogRef.close();
  }
} 