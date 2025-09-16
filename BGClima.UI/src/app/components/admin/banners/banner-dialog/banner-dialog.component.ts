import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BannerType } from 'src/app/models/banner.model';
import { BannerService, BannerDto } from 'src/app/services/banner.service';
import { ImageService } from 'src/app/services/image.service';

export interface BannerDialogData {
  mode: 'create' | 'edit';
  banner?: BannerDto;
}

@Component({
  selector: 'app-banner-dialog',
  templateUrl: './banner-dialog.component.html',
  styleUrls: ['./banner-dialog.component.scss']
})
export class BannerDialogComponent implements OnInit {
  bannerForm: FormGroup;
  loading = false;
  isSubmitting = false;
  bannerTypes = [
    { value: 0, viewValue: 'Главен слайдер' },
    { value: 1, viewValue: 'Основен ляв' },
    { value: 2, viewValue: 'Дясно горе' },
    { value: 3, viewValue: 'Дясно среда' },
    { value: 4, viewValue: 'Дясно долу' }
  ];
  @ViewChild('fileInput') fileInput!: ElementRef;
  imagePreview: string | ArrayBuffer | null = null;
  isEditMode = false;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private bannerService: BannerService,
    private imageService: ImageService,
    private dialogRef: MatDialogRef<BannerDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: BannerDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    
    this.bannerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      imageUrl: ['', [Validators.required, Validators.maxLength(500)]],
      targetUrl: ['', [Validators.maxLength(1000)]],
      displayOrder: [0, [
        Validators.required, 
        Validators.min(0),
        Validators.pattern('^[0-9]*$')
      ]],
      isActive: [true],
      type: [BannerType.HeroSlider, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.banner) {
      this.bannerForm.patchValue(this.data.banner);
      this.imagePreview = this.data.banner.imageUrl;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    
    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)$/i)) {
      this.snackBar.open('Моля, изберете валиден файл с изображение (JPEG, JPG, PNG, GIF, WebP)', 'Затвори', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.snackBar.open(`Файлът е твърде голям. Максималният размер е 5MB. Избраният файл е ${(file.size / (1024 * 1024)).toFixed(2)}MB.`, 'Затвори', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
      return;
    }
    
    this.selectedFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.bannerForm.get('imageUrl')?.setValue('file-uploaded');
      this.bannerForm.get('imageUrl')?.markAsDirty();
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      this.snackBar.open('Грешка при прочитане на файла', 'Затвори', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
    };
    reader.readAsDataURL(file);
  }

  private handleSuccess(action: string): void {
    this.snackBar.open(
      `Банерът беше ${action} успешно`,
      'Затвори',
      { duration: 3000 }
    );
    this.dialogRef.close(true);
  }

  private handleError(error: any): void {
    console.error('Error saving banner:', error);
    const errorMessage = error.error?.message || 'Възникна грешка при запазване на банера';
    this.snackBar.open(errorMessage, 'Затвори', { duration: 5000, panelClass: 'error-snackbar' });
    this.isSubmitting = false;
  }

  private uploadImageAndSave(): void {
    if (!this.selectedFile) {
      this.saveBanner();
      return;
    }

    this.isSubmitting = true;
    
    this.imageService.uploadSingleFile(this.selectedFile)
      .then((imageUrl) => {
        this.bannerForm.patchValue({ imageUrl });
        this.saveBanner();
      })
      .catch((error) => {
        console.error('Error uploading image:', error);
        this.snackBar.open(
          'Грешка при качване на изображението. Моля, опитайте отново.',
          'Затвори',
          { duration: 5000, panelClass: 'error-snackbar' }
        );
        this.isSubmitting = false;
      });
  }

  private saveBanner(): void {
    const formValue = this.bannerForm.value;
    const bannerData: Omit<BannerDto, 'id'> = {
      name: formValue.name,
      imageUrl: formValue.imageUrl,
      targetUrl: formValue.targetUrl || undefined,
      displayOrder: formValue.displayOrder,
      isActive: formValue.isActive,
      type: formValue.type
    };

    const operation = this.isEditMode && this.data.banner?.id
      ? this.bannerService.updateBanner(this.data.banner.id, bannerData)
      : this.bannerService.createBanner(bannerData);

    operation.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode ? 'Банерът е обновен успешно!' : 'Банерът е създаден успешно!',
          'OK',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error saving banner:', error);
        this.snackBar.open(
          'Възникна грешка при запазване на банера. Моля, опитайте отново.',
          'Затвори',
          { duration: 5000, panelClass: 'error-snackbar' }
        );
        this.isSubmitting = false;
      }
    });
  }

  onSubmit(): void {
    if (this.bannerForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    
    // If we have a new file or creating a new banner, upload the image first
    if (this.selectedFile || !this.isEditMode) {
      this.uploadImageAndSave();
    } else {
      this.saveBanner();
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
