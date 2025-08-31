import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  imports: [
    CommonModule,
    // Material Modules
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatSelectModule,
    MatOptionModule,
    MatPaginatorModule
  ],
  exports: [
    // Material Modules
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatSelectModule,
    MatOptionModule,
    MatPaginatorModule
  ],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true } }
  ]
})
export class SharedModule { }
