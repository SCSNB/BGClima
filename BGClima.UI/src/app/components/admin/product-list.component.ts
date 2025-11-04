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
  totalItems = 0;
  pageSize = 18;
  pageSizeOptions = [9, 18, 36, 100];
  currentPage = 0;

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

  private load(pageIndex: number = 0, pageSize: number = this.pageSize): void {
    this.loading = true;
    
    const params: any = {
      page: pageIndex + 1, // API is 1-based, MatPaginator is 0-based
      pageSize: pageSize,
      sortBy: 'name',
      sortOrder: 'asc'
    };
    
    // Add search term if it exists
    if (this.searchTerm) {
      params.searchTerm = this.searchTerm;
    }
    
    this.service.getProductsForAdmin(params).subscribe({
      next: (response) => {
        this.dataSource.data = response.items;
        this.totalItems = response.totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Неуспешно зареждане на продуктите';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    // Reset to first page when applying filter
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.load(0, this.pageSize);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.load(event.pageIndex, event.pageSize);
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