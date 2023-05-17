import { ProductEditorComponent } from './../../sub/product-editor/product-editor.component';
import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Observer } from 'rxjs';
import { Product } from 'src/app/models/product';
import { ProductService } from './../../../services/product.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  private readonly prodObserver: Observer<Product[]> = {
    next: recvProds => {
      this.dataSource.data = recvProds;
    },
    error: err => {
      console.log(err);
      this.resourcesLoading.products.error = true;
      this.resourcesLoading.products.loading = false;
      this.checkLoading();
    },
    complete: () => {
      this.resourcesLoading.products.loading = false;
      this.checkLoading();
    }
  };
  private resourcesLoading = { products: { loading: false, error: false } };
  readonly columnsToBeDisplayed = ['select', 'id', 'productName', 'description', 'oldPrice', 'newPrice', 'edit'];

  initialLoading = true;
  dataSource = new MatTableDataSource<Product>();
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild('productEditor', { static: false }) prodEditor!: ProductEditorComponent;
  @ViewChild('productAdder', { static: false }) prodAdder!: ProductEditorComponent;
  selection = new SelectionModel<Product>(true, []);
  deleteLoading = false;
  productForEdit: Product | null = null;
  editorData: { cpus: string[], gpus: string[], motherboards: string[], ram: string[] } = {
    cpus: [],
    motherboards: [],
    gpus: [],
    ram: []
  };

  constructor(private titleService: Title,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef) {
    if (this.activatedRoute.snapshot.data.title) {
      this.titleService.setTitle(this.activatedRoute.snapshot.data.title);
    }
  }

  ngOnInit(): void {
    this.resourcesLoading = { products: { loading: true, error: false } };

    this.productService.getAll().subscribe(this.prodObserver);
    this.dataSource.filterPredicate = this.customFilterPredicate;
  }

  isLoading(): boolean {
    return this.resourcesLoading.products.loading;
  }

  hasLoadingErrors(): boolean {
    return this.resourcesLoading.products.error;
  }

  clearLoadingErrors(): void {
    this.resourcesLoading.products.error = false;
  }

  setLoadingStatus(): void {
    this.resourcesLoading.products.loading = true;
  }

  checkLoading(): void {
    if (this.isLoading() === false) {
      this.onFinishLoading();
    }
  }

  onFinishLoading(): void {
    if (this.hasLoadingErrors()) {
      this.snackBar.open('A aparut o eroare. Te rugam sa incerci din nou',
        'Inchide', { duration: 8000 });
      this.clearLoadingErrors();
      return;
    }

    this.cd.detectChanges();
    this.dataSource.filter = '';
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.editorData.cpus = Array.from(new Set(this.dataSource.data.map(prod => prod.cpu)));
    this.editorData.motherboards = Array.from(new Set(this.dataSource.data.map(prod => prod.motherBoard)));
    this.editorData.gpus = Array.from(new Set(this.dataSource.data.map(prod => prod.gpu)));
    this.editorData.ram = Array.from(new Set(this.dataSource.data.map(prod => prod.ram)));

    this.prodAdder.data = {
      cpus: this.editorData.cpus,
      gpus: this.editorData.gpus,
      motherboards: this.editorData.motherboards,
      ram: this.editorData.ram
    };

    if (this.initialLoading) {
      this.initialLoading = false;
      return;
    }

    this.snackBar.open('Datele au fost incarcate cu succes',
      'Inchide', { duration: 3000 });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  refreshContent(): void {
    this.setLoadingStatus();
    this.productService.getAll().subscribe(this.prodObserver);
  }

  private customFilterPredicate(data: Product, filter: string): boolean {
    const filterKeys = ['id', 'productName', 'description', 'cpu', 'gpu', 'ram', 'motherboard'];
    let dataStr = filterKeys.map(key => data[key]).join(' ');

    let localFilter = filter;

    const customFilterRegexp = /\b(?:[a-z]+)(?:=|>|<|>=|<=)(?:[0-9]+)\b/g;
    const customFilters: { field: string, operation: string, value: number }[] = [];

    const matches = localFilter.match(customFilterRegexp);
    if (matches) {
      matches.forEach(match => {
        localFilter = localFilter.replace(match, '');
        const identifier = match.match(/[a-z]+/g);
        const operator = match.match(/(>|<|=|>=|<=)+/g);
        const value = match.match(/[0-9]+/g);
        if (identifier && operator && value) {
          customFilters.push({
            field: identifier[0],
            operation: operator[0],
            value: Number(value[0])
          });
        }
      });
    }

    if (customFilters.length) {
      const productApplyFilter = (product: Product, localCF: { field: string, operation: string, value: number }): boolean => {
        let price = 0;
        switch (localCF.field) {
          case 'oldprice':
            if (product.oldPrice) {
              price = product.oldPrice;
            }
            break;
          case 'newprice':
            price = product.newPrice;
            break;
          default:
            return false;
        }

        switch (localCF.operation) {
          case '>':
            return price > localCF.value;
          case '<':
            return price < localCF.value;
          case '=':
            return price === localCF.value;
          case '>=':
            return price >= localCF.value;
          case '<=':
            return price <= localCF.value;
          default:
            return false;
        }
      };

      for (const cf of customFilters) {
        if (productApplyFilter(data, cf) === false) {
          return false;
        }
      }
    }

    const filters: string[] = localFilter.replace(/\s+/g, ' ').split(' ');
    for (const singleFilter of filters) {
      if (!dataStr.includes(singleFilter)) {
        return false;
      } else {
        dataStr = dataStr.replace(singleFilter, '');
      }
    }
    return true;
  }

  tableIsAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  tableMasterToggle(): void {
    this.tableIsAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  editProduct(product: Product): void {
    this.productForEdit = product;
    this.cd.detectChanges();
    this.prodEditor.product = product;
    this.prodEditor.data = {
      cpus: this.editorData.cpus,
      gpus: this.editorData.gpus,
      motherboards: this.editorData.motherboards,
      ram: this.editorData.ram
    };
  }

  onClickDelete(): void {
    if (this.selection.hasValue()) {
      this.deleteLoading = true;

      this.productService.deleteByIds(this.selection.selected.map(prod => prod.id))
        .subscribe(stuff => { },
          err => {
            console.log(err);
            this.snackBar.open('A aparut o eroare. Te rugam sa incerci din nou',
              'Inchide', { duration: 8000 });
            this.deleteLoading = false;
          },
          () => {
            this.selection.clear();
            this.refreshContent();
            this.deleteLoading = false;
          });
    }
  }

  onChildRequestRefresh(): void {
    this.refreshContent();
  }

}
