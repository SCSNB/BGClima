import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BannerType } from 'src/app/models/banner.model';
import { BannerService, BannerDto } from 'src/app/services/banner.service';

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
  imagePreview: string | ArrayBuffer | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private bannerService: BannerService,
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
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)$/)) {
      this.snackBar.open('Моля, изберете валиден файл с изображение (JPEG, JPG, PNG, GIF)', 'Затвори', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open('Файлът е твърде голям. Максималният размер е 5MB.', 'Затвори', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.bannerForm.patchValue({
        imageUrl: reader.result as string
      });
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
    
    // TODO: Implement file upload to server here
    // After upload, update the imageUrl with the returned URL
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
    this.snackBar.open(
      errorMessage,
      'Затвори',
      { duration: 5000, panelClass: 'error-snackbar' }
    );
  }

  onSubmit(): void {
    if (this.bannerForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.bannerForm.value;
    
    // Prepare the banner data
    const bannerData: Partial<BannerDto> = {
      name: formValue.name,
      imageUrl: formValue.imageUrl,
      targetUrl: formValue.targetUrl || undefined,
      displayOrder: formValue.displayOrder,
      isActive: formValue.isActive,
      type: formValue.type
    };

    if (this.isEditMode && this.data.banner?.id) {
      // Include the ID in the banner data for the update
      bannerData.id = this.data.banner.id;
      this.bannerService.updateBanner(this.data.banner.id, bannerData).subscribe({
        next: () => this.handleSuccess('обновен'),
        error: (error) => this.handleError(error),
        complete: () => this.isSubmitting = false
      });
    } else {
      this.bannerService.createBanner(bannerData as Omit<BannerDto, 'id'>).subscribe({
        next: () => this.handleSuccess('създаден'),
        error: (error) => this.handleError(error),
        complete: () => this.isSubmitting = false
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
