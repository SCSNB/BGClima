import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BannersComponent } from './banners.component';
import { BannerDialogComponent } from './banner-dialog/banner-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  { 
    path: '',
    component: BannersComponent
  }
];

@NgModule({
  declarations: [
    BannersComponent,
    BannerDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    SharedModule
  ],
  entryComponents: [
    BannerDialogComponent
  ]
})
export class BannersModule { }
