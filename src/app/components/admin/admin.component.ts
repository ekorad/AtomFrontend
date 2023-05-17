import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSidenav } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, AfterViewInit, OnDestroy {

  headingTitle = '';
  readonly links = [
    { caption: 'Utilizatori', href: '/admin/users' },
    { caption: 'Roluri', href: '/admin/roles' },
    { caption: 'Permisiuni', href: '/admin/permissions' },
    { caption: 'Produse', href: '/admin/products' },
    { caption: 'Comenzi', href: '/admin/orders' }
  ];
  @ViewChild(MatSidenav) matSidenav!: MatSidenav;
  mcSub!: Subscription;

  /*
    * admin components should not be mobile friendly as they
    * should only be accessed on a PC/Laptop
  */
  // TODO: implement privilege check

  constructor(private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              private mediaObserver: MediaObserver,
              private route: ActivatedRoute,
              private router: Router) {
    this.matIconRegistry.addSvgIcon(
      'atom',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/img/atom.svg')
    );
  }

  ngOnDestroy(): void {
    this.mcSub.unsubscribe();
  }

  ngAfterViewInit(): void {
    // close side menu at breakpoint
    this.mcSub = this.mediaObserver.asObservable()
      .pipe(
        distinctUntilChanged((prev, crt) => prev[0].mqAlias
          === crt[0].mqAlias)
      )
      .subscribe(changes => {
        if (changes[0].mqAlias === 'md' || changes[0].mqAlias === 'lg'
          || changes[0].mqAlias === 'xl') {
          if (this.matSidenav.opened) {
            this.matSidenav.close();
          }
        }
      });
  }

  ngOnInit(): void {
    this.route.url.subscribe(() => {
      this.headingTitle = this.route.snapshot.firstChild?.data.title;
    });
  }

  navigateToRoot(): void {
    this.router.navigate(['.'], { relativeTo: this.route.parent });
  }

}
