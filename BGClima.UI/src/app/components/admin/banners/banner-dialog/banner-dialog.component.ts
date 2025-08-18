import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Banner, BannerType } from 'src/app/models/banner.model';
import { BannerService } from 'src/app/services/banner.service';

export interface BannerDialogData {
  isEdit: boolean;
  banner?: Banner;
}

@Component({
  selector: 'app-banner-dialog',
  templateUrl: './banner-dialog.component.html',
  styleUrls: ['./banner-dialog.component.scss']
})
export class BannerDialogComponent implements OnInit {
  bannerForm: FormGroup;
  loading = false;
  bannerTypes = [
    { value: 0, viewValue: 'Главен слайдер' },
    { value: 1, viewValue: 'Основен ляв' },
    { value: 2, viewValue: 'Дясно горе' },
    { value: 3, viewValue: 'Дясно среда' },
    { value: 4, viewValue: 'Дясно долу' }
  ];
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private bannerService: BannerService,
    private dialogRef: MatDialogRef<BannerDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: BannerDialogData
  ) {
    this.bannerForm = this.fb.group({
      name: ['', Validators.required],
      imageUrl: ['', Validators.required],
      targetUrl: [''],
      displayOrder: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
      type: [BannerType.HeroSlider, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data.isEdit && this.data.banner) {
      this.bannerForm.patchValue(this.data.banner);
      this.imagePreview = this.data.banner.imageUrl;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.bannerForm.patchValue({
          imageUrl: reader.result
        });
      };
      reader.readAsDataURL(file);

      // Here you would typically upload the file to your server
      // and update the imageUrl with the returned URL
    }
  }

  onSubmit(): void {
    if (this.bannerForm.invalid) {
      return;
    }

    this.loading = true;
    const bannerData = this.bannerForm.value;

    const operation = this.data.isEdit && this.data.banner
      ? this.bannerService.updateBanner(this.data.banner.id, bannerData)
      : this.bannerService.createBanner(bannerData);

    operation.subscribe({
      next: () => {
        this.snackBar.open(
          `Банерът беше ${this.data.isEdit ? 'обновен' : 'създаден'} успешно`,
          'Затвори',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error saving banner:', error);
        this.snackBar.open(
          `Грешка при ${this.data.isEdit ? 'обновяване' : 'създаване'} на банер`,
          'Затвори',
          { duration: 3000 }
        );
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
