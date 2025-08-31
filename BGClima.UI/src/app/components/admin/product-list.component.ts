import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService, ProductDto, CreateProductDto } from '../../services/product.service';
import { ProductDialogComponent } from './product-dialog.component';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-admin-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  dataSource = new MatTableDataSource<ProductDto>([]);
  displayedColumns = ['id', 'name', 'price', 'stock', 'brand', 'type', 'btu', 'energyClass', 'actions'];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  filteredProducts: ProductDto[] = [];

  constructor(
    private service: ProductService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private load(): void {
    this.loading = true;
    this.service.getProducts().subscribe({
      next: (data) => {
        this.filteredProducts = [...data];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Неуспешно зареждане на продуктите';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm) {
      this.dataSource.data = [...this.filteredProducts];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.dataSource.data = this.filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.id.toString().includes(searchLower) ||
      (product.brand?.name?.toLowerCase().includes(searchLower) ?? false)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  addProduct(): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, { width: '600px', data: { mode: 'create' } });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      const dto: CreateProductDto = result.dto;
      this.service.create(dto).subscribe({
        next: () => { this.snack.open('Продуктът е създаден', 'OK', { duration: 2000 }); this.load(); },
        error: () => this.snack.open('Грешка при създаване', 'OK', { duration: 3000 })
      });
    });
  }

  editProduct(product: ProductDto): void {
    this.service.getProduct(product.id).subscribe({
      next: (fullProduct: ProductDto) => {
        const dialogRef = this.dialog.open(ProductDialogComponent, { 
          width: '800px', 
          data: { 
            mode: 'edit', 
            product: fullProduct 
          } 
        });
        
        dialogRef.afterClosed().subscribe(result => {
          if (!result) return;
          const dto: CreateProductDto = result.dto;
          this.service.update(product.id, dto).subscribe({
            next: () => { 
              this.snack.open('Промените са записани', 'OK', { duration: 2000 }); 
              this.load(); 
            },
            error: (error: any) => {
              console.error('Error updating product:', error);
              this.snack.open('Грешка при запис: ' + (error.error?.message || 'Неизвестна грешка'), 'OK', { duration: 5000 });
            }
          });
        });
      },
      error: (error: any) => {
        console.error('Error loading product:', error);
        this.snack.open('Грешка при зареждане на продукта', 'OK', { duration: 3000 });
      }
    });
  }

  deleteProduct(product: ProductDto): void {
    if (!confirm(`Изтриване на продукт: ${product.name}?`)) return;
    this.service.delete(product.id).subscribe({
      next: () => { this.snack.open('Продуктът е изтрит', 'OK', { duration: 2000 }); this.load(); },
      error: () => this.snack.open('Грешка при изтриване', 'OK', { duration: 3000 })
    });
  }
} 