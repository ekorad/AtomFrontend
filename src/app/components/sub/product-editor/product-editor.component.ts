import { ImageService } from './../../../services/image.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from './../../../services/product.service';
import { FormBuilder, Validators, FormControl, NgForm } from '@angular/forms';
import { Product } from 'src/app/models/product';
import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-product-editor',
  templateUrl: './product-editor.component.html',
  styleUrls: ['./product-editor.component.css']
})
export class ProductEditorComponent implements OnInit {

  productData: { cpus: string[], gpus: string[], motherboards: string[], ram: string[] } = {
    cpus: [],
    gpus: [],
    motherboards: [],
    ram: []
  };
  @Input() operationType: 'add' | 'edit' = 'add';
  currentProduct!: Product;
  @Output() requestRefreshEmitter = new EventEmitter<string>();
  productForm = this.fb.group({
    name: ['', { validators: Validators.required, updateOn: 'blur' }],
    description: ['', { validators: Validators.required, updateOn: 'blur' }],
    oldPrice: [null],
    currentPrice: ['', { validators: Validators.required, updateOn: 'blur' }],
    cpu: ['', { validators: Validators.required, updateOn: 'blur' }],
    gpu: ['', { validators: Validators.required, updateOn: 'blur' }],
    motherboard: ['', { validators: Validators.required, updateOn: 'blur' }],
    ram: ['', { validators: Validators.required, updateOn: 'blur' }],
    image: [null]
  });
  isLoading = false;
  @ViewChild('form', { static: false }) form!: NgForm;
  hasImage = false;

  constructor(private fb: FormBuilder,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private imageService: ImageService) { }

  ngOnInit(): void {
  }

  set product(prod: Product) {
    this.currentProduct = prod;

    this.name.setValue(prod.productName);
    this.description.setValue(prod.description);
    this.oldPrice.setValue(prod.oldPrice);
    this.currentPrice.setValue(prod.newPrice);
    this.cpu.setValue(prod.cpu);
    this.gpu.setValue(prod.gpu);
    this.motherboard.setValue(prod.motherBoard);
    this.ram.setValue(prod.ram);

    this.imageService.getImageForId(this.currentProduct.id)
      .subscribe(blob => {
        this.hasImage = true;
      },
        err => {
          this.hasImage = false;
        },
        () => {

        });
  }

  set data(prodData: { cpus: string[], gpus: string[], motherboards: string[], ram: string[] }) {
    this.productData = prodData;
  }

  get name(): FormControl {
    return this.productForm.get('name') as FormControl;
  }

  get description(): FormControl {
    return this.productForm.get('description') as FormControl;
  }

  get oldPrice(): FormControl {
    return this.productForm.get('oldPrice') as FormControl;
  }

  get currentPrice(): FormControl {
    return this.productForm.get('currentPrice') as FormControl;
  }

  get cpu(): FormControl {
    return this.productForm.get('cpu') as FormControl;
  }

  get gpu(): FormControl {
    return this.productForm.get('gpu') as FormControl;
  }

  get motherboard(): FormControl {
    return this.productForm.get('motherboard') as FormControl;
  }

  get ram(): FormControl {
    return this.productForm.get('ram') as FormControl;
  }

  get image(): FormControl {
    return this.productForm.get('image') as FormControl;
  }

  hasProductData(): boolean {
    return (this.productData.cpus.length !== 0) && (this.productData.gpus.length !== 0) && (this.productData.motherboards.length !== 0) && (this.productData.ram.length !== 0);
  }

  requestRefresh(): void {
    this.requestRefreshEmitter.emit('REQUEST_REFRESH');
  }

  onSelectImage(event: Event): void {
    const fileUploaderElem = event.target as HTMLInputElement;
    if (fileUploaderElem.files) {
      const file = fileUploaderElem.files[0];
      if (!file.name.endsWith('.jpg')) {
        this.snackBar.open('Imaginea trebuie sa fie de tip JPEG (.jpg). Te rugam sa incarci alta imagine',
          'Inchide', { duration: 8000 });
      } else {
        this.image.setValue(file);
      }
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isLoading = true;

      const newViews = (this.operationType === 'add') ? 0 : this.currentProduct.views;

      const product: Product = {
        id: 0,
        productName: this.name.value,
        description: this.description.value,
        newPrice: this.currentPrice.value,
        oldPrice: this.oldPrice.value,
        cpu: this.cpu.value,
        gpu: this.gpu.value,
        motherBoard: this.motherboard.value,
        ram: this.ram.value,
        reviews: [],
        views: newViews
      };

      if (this.operationType === 'add') {
        this.productService.addProduct(product)
          .subscribe(stuff => { },
            err => {
              console.log(err);
              this.isLoading = false;
              this.snackBar.open('A aparut o eroare, te rugam sa incerci din nou',
                'Inchide', { duration: 8000 });
            },
            () => {
              if (this.image.value) {
                this.imageService.addImageForId(this.image.value, this.currentProduct.id)
                  .subscribe(stuff => { },
                    err => {
                      console.log(err);
                      this.snackBar.open('Incarcarea imaginii a esuat, te rugam sa incerci din nou',
                        'Inchide', { duration: 8000 });
                    },
                    () => {
                    });
              }
              this.isLoading = false;
              this.productForm.reset();
              this.productForm.markAsUntouched();
              this.productForm.markAsPristine();
              this.requestRefreshEmitter.emit('REQUEST_REFRESH');
              this.form.resetForm();

            });
      } else {
        this.productService.updateProduct(product, this.currentProduct.id)
          .subscribe(stuff => { },
            err => {
              console.log(err);
              this.isLoading = false;
              this.snackBar.open('A aparut o eroare, te rugam sa incerci din nou',
                'Inchide', { duration: 8000 });
            },
            () => {
              if (this.image.value) {
                this.imageService.addImageForId(this.image.value, this.currentProduct.id)
                  .subscribe(stuff => { },
                    err => {
                      console.log(err);
                      this.snackBar.open('Incarcarea imaginii a esuat, te rugam sa incerci din nou',
                        'Inchide', { duration: 8000 });
                    },
                    () => {
                    });
              }
              this.isLoading = false;
              this.productForm.reset();
              this.productForm.markAsUntouched();
              this.productForm.markAsPristine();
              this.requestRefreshEmitter.emit('REQUEST_REFRESH');
              this.form.resetForm();
            });
      }
    }
  }

}
