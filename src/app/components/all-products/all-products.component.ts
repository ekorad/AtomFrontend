import { Title } from '@angular/platform-browser';
import { MatPaginator } from '@angular/material/paginator';
import { ShoppingCartService } from './../../services/shopping-cart.service';
import { PartialObserver } from 'rxjs';
import { ProductService } from './../../services/product.service';
import { Product } from './../../models/product';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-products',
  templateUrl: './all-products.component.html',
  styleUrls: ['./all-products.component.css']
})
export class AllProductsComponent implements OnInit {

  @ViewChild(MatPaginator, {static: false}) paginator!: MatPaginator;

  private readonly productObserver: PartialObserver<Product[]> = {
    next: recvProds => this.dataSource.data = recvProds,
    complete: () => {
      this.productsLoading = false;
      this.dataSource.paginator = this.paginator;
    }
  };

  dataSource = new MatTableDataSource<Product>();
  productsLoading = false;

  constructor(private productService: ProductService,
    private cartService: ShoppingCartService,
    private titleService: Title,
    private authService: AuthService,
    private router: Router) {
      this.titleService.setTitle('Atom');
     }

  ngOnInit(): void {
    this.productsLoading = true;
    this.productService.getAll().subscribe(this.productObserver);

    this.dataSource.filterPredicate = (data: Product, filter: string) => {
      const filterKeys = ['productName', 'description', 'cpu', 'gpu', 'ram', 'motherboard'];
      let dataStr = filterKeys.map(key => data[key]).join(' ').toLowerCase();
      const filters: string[] = filter.replace(/\s+/g, ' ').split(' ');
      for (const singleFilter of filters) {
        if (!dataStr.includes(singleFilter)) {
          return false;
        } else {
          dataStr = dataStr.replace(singleFilter, '');
        }
      }
      console.log('test');
      return true;
    };
  }

  addToCart(productId: number): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.cartService.addToCart(productId);
  }

  applyFilter(searchString: string): void {
    this.dataSource.filter = searchString.trim().toLowerCase().replace(/\s+/g, ' ');
  }

}
