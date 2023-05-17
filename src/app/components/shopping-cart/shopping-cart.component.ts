import { Title } from '@angular/platform-browser';
import { DataService } from './../../services/data.service';
import { Router } from '@angular/router';
import { ProductService } from './../../services/product.service';
import { Product } from './../../models/product';
import { ShoppingCartService } from './../../services/shopping-cart.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit {

  prodIdNums = new Map<number, number>();
  prods = new Map<Product, number>();

  constructor(private cartService: ShoppingCartService,
    private productService: ProductService,
    private router: Router,
    private dataService: DataService,
    private title: Title) {
      this.title.setTitle('Cos cumparaturi');
    }

  ngOnInit(): void {
    const cart = this.cartService.getCart();
    if (cart && cart.productIds.length) {
      this.setProdIdNumsMap(cart.productIds);
      const requestedIds = Array.from(this.prodIdNums.keys());
      this.productService.getAllByIds(requestedIds)
        .subscribe(requestedProds => {
          for (const product of requestedProds) {
            const count = this.prodIdNums.get(product.id);
            if (count) {
              this.prods.set(product, count);
            }
          }
        },
          err => console.log(err),
          () => {
            console.log(this.prods);
          });
    }
  }

  private setProdIdNumsMap(ids: number[]): void {
    for (const id of ids) {
      if (!this.prodIdNums.has(id)) {
        this.prodIdNums.set(id, 1);
      } else {
        const tmp = this.prodIdNums.get(id);
        if (tmp) {
          this.prodIdNums.set(id, tmp + 1);
        }
      }
    }
  }

  addOne(product: Product): void {
    if (this.prods.has(product)) {
      const tmp = this.prods.get(product);
      if (tmp) {
        this.prods.set(product, tmp + 1);
      }
    }
    this.cartService.syncCart(this.prods);
  }

  removeOne(product: Product): void {
    if (this.prods.has(product)) {
      const tmp = this.prods.get(product);
      if (tmp) {
        if (tmp === 1) {
          this.prods.delete(product);
        } else {
          this.prods.set(product, tmp - 1);
        }
      }
    }
    this.cartService.syncCart(this.prods);
  }

  removeAll(product: Product): void {
    if (this.prods.has(product)) {
      this.prods.delete(product);
    }
    this.cartService.syncCart(this.prods);
  }

  proceedToOrder(): void {
    this.router.navigateByUrl('place-order');
  }

  computeTotalPrice(): number {
    const totalCosts = this.cartService.computePrice(this.prods);
    this.dataService.totalCosts = totalCosts;
    return totalCosts;
  }

}
