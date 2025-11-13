import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { FilterDialogComponent } from './components/filter-dialog/filter-dialog.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProductGridComponent } from './components/product-grid/product-grid.component';

@NgModule({
  declarations: [
    FilterDialogComponent,
    ProductCardComponent,
    ProductGridComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    // Material Modules
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatSelectModule,
    MatOptionModule,
    MatPaginatorModule,
    MatIconModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSliderModule
  ],
  exports: [
    MatMenuModule,
    MatSelectModule,
    MatOptionModule,
    MatPaginatorModule,
    MatIconModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSliderModule,
    // Components
    FilterDialogComponent,
    ProductCardComponent,
    ProductGridComponent
  ],
  entryComponents: [
    FilterDialogComponent
  ],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true } }
  ]
})
export class SharedModule { }