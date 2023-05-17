import { Product } from './../models/product';
import { Observable } from 'rxjs';
import { ProductService } from './product.service';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PersonalExpService {

  private readonly userExpName;

  constructor(private authService: AuthService,
    private productService: ProductService) {
    const retrUsername = this.authService.getUsername();
    if (retrUsername) {
      this.userExpName = 'userexp' + retrUsername;
    } else {
      this.userExpName = 'userexp-nouser';
    }
  }

  pushNewProductId(id: number): void {
    if (!this.checkUserExperience()) {
      this.createUserExperience();
    }

    const storedExp = localStorage.getItem(this.userExpName);
    if (storedExp) {
      const idArray: number[] = JSON.parse(storedExp);

      if (idArray.length === 5) {
        idArray.shift();
      }

      if (idArray.includes(id)) {
        return;
      }

      idArray.push(id);
      localStorage.setItem(this.userExpName, JSON.stringify(idArray));
    }
  }

  retrieveUserExperience(): number[] | null {
    const storedExp = localStorage.getItem(this.userExpName);
    if (storedExp) {
      const idArray: number[] = JSON.parse(storedExp);
      return idArray;
    }

    return null;
  }

  private createUserExperience(): void {
    if (this.checkUserExperience()) {
      return;
    }

    const idsArray = new Array<number>();
    localStorage.setItem(this.userExpName, JSON.stringify(idsArray));
  }

  private checkUserExperience(): boolean {
    const storedExp = localStorage.getItem(this.userExpName);
    if (storedExp) {
      return true;
    }
    return false;
  }

  getRecommendedProducts(): Observable<Product[]> {
    const ids = this.retrieveUserExperience();
    if (ids) {
      return this.productService.getProductsAroundAvg(ids);
    } else {
      return new Observable<Product[]>(subscriber => {
        subscriber.error('No reccomendations available');
      });
    }
  }
}

