import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService, ProductDto, BrandDto, ProductTypeDto, BTUDto, EnergyClassDto, CreateProductDto, CreateProductAttributeDto } from '../../services/product.service';
import { ImageService } from '../../services/image.service';
import { environment } from '../../../environments/environment';

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

    /* Upload options styles */
    .upload-options {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .upload-btn {
      min-width: 140px;
    }

    .or-divider {
      color: #666;
      font-style: italic;
      margin: 0 0.5rem;
    }

    .url-input {
      flex: 1;
      min-width: 250px;
    }

    .upload-progress {
      margin-top: 1rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .upload-progress span {
      display: block;
      text-align: center;
      margin-top: 0.5rem;
      font-size: 0.9rem;
      color: #666;
    }
  `]
})
export class ProductDialogComponent implements OnInit, OnDestroy {
  form: FormGroup;
  brands: BrandDto[] = [];
  types: ProductTypeDto[] = [];
  btu: BTUDto[] = [];
  energyClasses: EnergyClassDto[] = [];
  attributes: CreateProductAttributeDto[] = [];
  editingAttributeIndex: number | null = null;
  title = '';
  // Store both the file object and its preview URL
  images: { file?: File, url: string, isPrimary: boolean, isNew: boolean }[] = [];
  newImageUrl: string = '';
  uploadProgress: number = 0;
  isUploading: boolean = false;
  descriptionImages: { id?: number, imageUrl: string }[] = [];
  newDescriptionImageUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private imageService: ImageService,
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
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
          isPrimary: img.isPrimary,
          isNew: false // These are existing images from the server
        }));
      } else if (this.data.product.imageUrl) {
        // For backward compatibility with single image
        this.images = [{
          url: this.data.product.imageUrl,
          isPrimary: true,
          isNew: false
        }];
      }

      // Load existing description images
      if (this.data.product.descriptionImages && this.data.product.descriptionImages.length > 0) {
        this.descriptionImages = this.data.product.descriptionImages.map(img => ({
          id: img.id,
          imageUrl: img.imageUrl
        }));
      }
    } else {
      this.title = 'Добавяне на нов продукт';
    }
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    if (this.images.length === 0) {
      alert('Моля, добавете поне една снимка към продукта');
      return;
    }

    try {
      this.isUploading = true;
      
      // Upload new images first
      for (const img of this.images) {
        if (img.isNew && img.file) {
          try {
            const uploadedUrl = await this.uploadSingleFile(img.file);
            const oldUrl = img.url;
            img.url = uploadedUrl; // Update URL to the final blob URL
            img.isNew = false;
            
            // Clean up the old blob URL if it was a blob URL
            if (oldUrl.startsWith('blob:')) {
              URL.revokeObjectURL(oldUrl);
            }
          } catch (error) {
            console.error('Error uploading image:', error);
            alert(`Грешка при качване на снимка: ${img.file?.name || 'неизвестен файл'}`);
            this.isUploading = false;
            return;
          }
        }
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
        })),
        descriptionImages: this.descriptionImages.map((img, index) => ({
          id: img.id || 0,
          imageUrl: img.imageUrl,
          altText: `Снимка към описание на ${this.form.get('name')?.value || 'продукт'}`,
          displayOrder: index
        }))
      };

      console.log('Submitting product:', productData);
      this.dialogRef.close({ action: this.data.mode, dto: productData });
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Грешка при запазване на продукта');
    } finally {
      this.isUploading = false;
    }
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

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.uploadFiles(files);
    }
  }

  async uploadFiles(files: FileList): Promise<void> {
    this.isUploading = true;
    this.uploadProgress = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        this.images.push({
          file: file, // Store the actual File object
          url: objectUrl, // Use object URL for preview
          isPrimary: this.images.length === 0, // First image is primary by default
          isNew: true // Mark as new (not yet uploaded to blob storage)
        });
        this.uploadProgress = ((i + 1) / files.length) * 100;
      } catch (error) {
        console.error('Error processing file:', error);
        alert(`Грешка при обработка на ${file.name}`);
      }
    }

    this.isUploading = false;
    this.uploadProgress = 0;
  }

  private uploadSingleFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      // For now, we'll use a placeholder URL until the backend endpoint is implemented
      // TODO: Replace with actual Azure Storage upload endpoint
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          this.uploadProgress = progress;
        }
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.imageUrl || response.url);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      // Upload to the image controller endpoint
      const uploadUrl = environment.production ? '/api/image/upload' : `${environment.apiUrl}/api/image/upload`;
      xhr.open('POST', uploadUrl);
      
      // Add authentication header
      const token = localStorage.getItem('token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.send(formData);
    });
  }

  removeImage(index: number): void {
    const imageToRemove = this.images[index];
    
    // Show confirmation dialog
    if (!confirm('Сигурни ли сте, че искате да изтриете това изображение?')) {
      return;
    }
    
    // If this is a server-side image (not a new upload), delete it from the server
    // Note: Since we don't have the image ID here, we'll just remove it from the UI
    // The actual deletion will be handled when the product is saved
    if (!imageToRemove.isNew && imageToRemove.url && !imageToRemove.url.startsWith('blob:')) {
      this.removeImageFromUI(index);
      // Show a message that the image will be removed when the product is saved
      this.snackBar.open('Изображението ще бъде изтрито при запазване на промените', 'OK', { duration: 3000 });
    } else {
      // For client-side images or blob URLs, just remove from UI
      this.removeImageFromUI(index);
    }
  }
  private removeImageFromUI(index: number): void {
    const imageToRemove = this.images[index];
    const wasPrimary = imageToRemove.isPrimary;
    
    // Revoke object URL if it was created from a file
    if (imageToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    
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

  // Description Image management methods
  addDescriptionImage(): void {
    if (this.newDescriptionImageUrl && !this.descriptionImages.some(img => img.imageUrl === this.newDescriptionImageUrl)) {
      this.descriptionImages.push({
        imageUrl: this.newDescriptionImageUrl
      });
      this.newDescriptionImageUrl = '';
    }
  }

  removeDescriptionImage(index: number): void {
    console.log('removeDescriptionImage called with index:', index);
    const imageToRemove = this.descriptionImages[index];
    console.log('Image to remove:', imageToRemove);
    
    // Show confirmation dialog
    if (!confirm('Сигурни ли сте, че искате да изтриете това изображение?')) {
      console.log('Deletion cancelled by user');
      return;
    }
    
    // If this is a server-side image (has an ID), delete it from the server
    if (imageToRemove.id) {
      console.log('Deleting server-side image with ID:', imageToRemove.id);
      this.isUploading = true;
      this.productService.deleteImage(imageToRemove.id).subscribe({
        next: () => {
          console.log('Description image deleted successfully');
          this.descriptionImages.splice(index, 1);
          this.snackBar.open('Снимката беше изтрита успешно', 'OK', { duration: 3000 });
        },
        error: (err: Error) => {
          console.error('Error deleting description image:', err);
          this.snackBar.open(
            `Грешка при изтриване на описателното изображение: ${err.message || 'Неизвестна грешка'}`,
            'Затвори',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        },
        complete: () => {
          console.log('Delete request completed');
          this.isUploading = false;
        }
      });
    } else {
      // For client-side images, just remove from UI
      console.log('Removing client-side image from UI');
      this.descriptionImages.splice(index, 1);
      this.snackBar.open('Снимката беше премахната', 'OK', { duration: 3000 });
    }
  }

  cancel(): void {
    this.cleanupObjectUrls();
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.cleanupObjectUrls();
  }

  private cleanupObjectUrls(): void {
    // Clean up all object URLs to prevent memory leaks
    this.images.forEach(img => {
      if (img.url && img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url);
      }
    });
  }
} 