import { OrderService } from './../../../services/order.service';
import { map } from 'rxjs/operators';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from './../../../models/product';
import { Observer } from 'rxjs';
import { Order } from './../../../models/order';
import { ProductService } from './../../../services/product.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-details-viewer',
  templateUrl: './order-details-viewer.component.html',
  styleUrls: ['./order-details-viewer.component.css']
})
export class OrderDetailsViewerComponent implements OnInit {

  readonly orderStatuses = [
    'procesare',
    'livrare',
    'efectuat'
  ];

  editOrderForm = this.fb.group({
    addProductId: [''],
    status: ['']
  });

  allProducts = new Map<number, Product>();
  selectedOrder: Order | null = null;
  associatedProducts = new Map<Product, number>();
  private idsCounts = new Map<number, number>();
  productsLoading = false;
  productsLoadingError = false;
  private readonly productObserver: Observer<Product[]> = {
    next: recvProds => {
      recvProds.forEach(prod => this.allProducts.set(prod.id, prod));
      Array.from(this.idsCounts.keys()).forEach(id => {
        const product = this.allProducts.get(id);
        if (product) {
          this.associatedProducts.set(product, 0);
        }
      });
    },
    error: err => {
      console.log(err);
      this.productsLoading = false;
      this.productsLoadingError = true;
      this.snackBar.open('Nu au putut fi incarcate produsele asociate comenzii. Te rugam sa incerci din nou',
        'Inchide', { duration: 8000 });
    },
    complete: () => {
      this.onFinishLoadingProducts();
    }
  };

  constructor(private productService: ProductService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private orderService: OrderService) { }

  ngOnInit(): void {
  }

  setSelectedOrder(order: Order): void {
    this.selectedOrder = order;
    this.associatedProducts.clear();
    this.idsCounts.clear();
    this.status.setValue(order.stage);
    const productIds = order.productsIds.split(',').map(strId => Number(strId));
    productIds.forEach(id => {
      if (!this.idsCounts.has(id)) {
        this.idsCounts.set(id, 1);
      } else {
        const val = this.idsCounts.get(id);
        if (val) {
          this.idsCounts.set(id, val + 1);
        }
      }
    });

    this.productService.getAll().subscribe(this.productObserver);
  }

  dataIsPresent(): boolean {
    return this.associatedProducts.size !== 0;
  }

  onFinishLoadingProducts(): void {
    this.associatedProducts.forEach((val, key) => {
      const count = this.idsCounts.get(key.id);
      if (count) {
        this.associatedProducts.set(key, count);
      }
    });
    this.productsLoading = false;
    this.productsLoadingError = false;
  }

  computeTotalIndividualProductPrice(product: Product): number {
    const count = this.associatedProducts.get(product);
    if (count) {
      return product.newPrice * count;
    }
    return -1;
  }

  computeTotalPrice(): number {
    let sum = 0;
    this.associatedProducts.forEach((value, key) => {
      sum += key.newPrice * value;
    });
    return sum;
  }

  addOneProduct(product: Product): void {
    const count = this.associatedProducts.get(product);
    if (count) {
      this.associatedProducts.set(product, count + 1);
    }
  }

  removeOneProduct(product: Product): void {
    if (!this.isAtLeastOneProduct()) {
      this.snackBar.open('Comanda trebuie sa contina minim un produs!',
        'Inchide', { duration: 8000 });
      return;
    }

    const count = this.associatedProducts.get(product);
    if (count) {
      if (count === 1) {
        this.associatedProducts.delete(product);
      } else {
        this.associatedProducts.set(product, count - 1);
      }
    }
  }

  removeProduct(product: Product): void {
    if (this.associatedProducts.size === 1) {
      this.snackBar.open('Comanda trebuie sa contina minim un produs!',
        'Inchide', { duration: 8000 });
      return;
    }

    this.associatedProducts.delete(product);
  }

  isAtLeastOneProduct(): boolean {
    let numProds = 0;
    this.associatedProducts.forEach((val, key) => numProds += val);
    return numProds > 1;
  }

  addNewProduct(): void {
    const id = this.addProductId.value;
    if (id) {
      if (!this.allProducts.has(id)) {
        this.snackBar.open('Nu a fost gasit un produs cu acest ID',
          'Inchide', { duration: 5000 });
      } else {
        const prod = this.allProducts.get(id);
        if (prod) {
          const existingAssociatedProdCount = this.associatedProducts.get(prod);
          if (existingAssociatedProdCount) {
            this.associatedProducts.set(prod, existingAssociatedProdCount + 1);
          } else {
            this.associatedProducts.set(prod, 1);
          }
        }
      }
    } else {
      this.snackBar.open('Nu ai introdus niciun ID de produs',
        'Inchide', { duration: 3000 });
    }
  }

  onSubmitEditOrder(): void {
    const idArray: number[] = [];
    this.associatedProducts.forEach((count, prod) => {
      for (let i = 0; i < count; i++) {
        idArray.push(prod.id);
      }
    });
    const idStr = idArray.join(',');
    if (this.selectedOrder) {
      this.selectedOrder.productsIds = idStr;
      this.selectedOrder.stage = this.status.value;
      this.orderService.updateOrder(this.selectedOrder.id, this.selectedOrder)
        .subscribe(stuff => { },
          err => {
            console.log(err);
            this.snackBar.open('A aparut o eroare. Te rugam sa incerci din nou',
              'Inchide', { duration: 8000 });
          },
          () => {
            this.snackBar.open('Datele au fost introduse cu succes',
              'Inchide', { duration: 3000 });
          });
    }
  }

  get addProductId(): FormControl {
    return this.editOrderForm.get('addProductId') as FormControl;
  }

  get status(): FormControl {
    return this.editOrderForm.get('status') as FormControl;
  }
}
