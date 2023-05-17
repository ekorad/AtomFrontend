import { Observable, of } from 'rxjs';
import { ProductService } from './product.service';
import { ShoppingCart } from './../helpers/shopping-cart';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  private readonly username: string = 'nouser';

  constructor(private authService: AuthService,
    private productService: ProductService) {
    const localUsername = this.authService.getUsername();
    if (localUsername) {
      this.username = localUsername;
    }
  }

  getCart(): ShoppingCart | null {
    const storageString = 'cart_' + this.username;
    const storedCart = localStorage.getItem(storageString);
    if (storedCart) {
      return JSON.parse(storedCart);
    }
    return null;
  }

  storeCart(cart: ShoppingCart): void {
    const storageString = 'cart_' + this.username;
    const cartString = JSON.stringify(cart);
    localStorage.setItem(storageString, cartString);
  }

  addToCart(productId: number): void {
    const storedCart = this.getCart();
    if (storedCart === null) {
      const newCart: ShoppingCart = {
        productIds: [productId]
      };
      this.storeCart(newCart);
    } else {
      storedCart.productIds.push(productId);
      this.storeCart(storedCart);
    }
  }

  countItems(): number {
    const storedCart = this.getCart();
    if (storedCart) {
      return storedCart.productIds.length;
    }
    return 0;
  }

  removeCart(): void {
    const storageString = 'cart_' + this.username;
    localStorage.removeItem(storageString);
  }

  syncCart(prods: Map<Product, number>): void {
    this.removeCart();

    if (prods.size) {
      const prodIds: number[] = [];
      prods.forEach((val, key) => {
        for (let i = 0; i < val; i++) {
          prodIds.push(key.id);
        }
      });
      const cart: ShoppingCart = {
        productIds: prodIds
      };
      this.storeCart(cart);
    }
  }

  computePrice(prods: Map<Product, number>): number {
    let totalCost = 0;
    if (prods.size) {
      prods.forEach((value, key) => {
        totalCost += key.newPrice * value;
      });
      return totalCost;
    }
    return 0;
  }

  computeCartPrice(): Observable<number> {
    const cart = this.getCart();
    if (cart) {
      const idOccurences = new Map<number, number>();
      for (const id of cart.productIds) {
        if (!idOccurences.has(id)) {
          idOccurences.set(id, 1);
        } else {
          const storedCount = idOccurences.get(id);
          if (storedCount) {
            idOccurences.set(id, storedCount + 1);
          }
        }
      }
      const ids = Array.from(idOccurences.keys());
      const prodMap = new Map<Product, number>();
      let products!: Product[];
      return new Observable<number>(subscriber => {
        this.productService.getAllByIds(ids)
          .subscribe(recvProds => products = recvProds,
            err => subscriber.error(err),
            () => {
              for (const prod of products) {
                const storedCount = idOccurences.get(prod.id);
                if (storedCount) {
                  prodMap.set(prod, storedCount);
                }
              }
              let totalPrice = 0;
              prodMap.forEach((value, key) => {
                totalPrice += key.newPrice * value;
              });
              subscriber.next(totalPrice);
              subscriber.complete();
            });
      });
    }
    return new Observable<number>(subscriber => subscriber.error('No cart in local storage'));
  }
}
