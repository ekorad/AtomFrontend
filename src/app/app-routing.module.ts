import { ContactComponent } from './components/contact/contact.component';
import { OrderComponent } from './components/admin/order/order.component';
import { ProductComponent } from './components/admin/product/product.component';
import { ViewProductComponent } from './components/view-product/view-product.component';
import { PlaceOrderComponent } from './components/place-order/place-order.component';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { MyAccountCanActivate } from './helpers/my-account-can-activate';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { WebUsersComponent } from './components/admin/web-users/web-users.component';
import { AdminCanActivate } from './helpers/admin-can-activate';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { LoginCanActivate } from './helpers/login-can-activate';
import { NavFrameComponent } from './components/nav-frame/nav-frame.component';
import { UserPermissionsComponent } from './components/admin/user-permissions/user-permissions.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserRolesComponent } from './components/admin/user-roles/user-roles.component';
import { AllProductsComponent } from './components/all-products/all-products.component';

const routes: Routes = [
  {
    path: '', component: NavFrameComponent, children: [
      { path: '', component: AllProductsComponent },
      { path: 'my-account', component: MyAccountComponent, canActivate: [MyAccountCanActivate] },
      { path: 'cart', component: ShoppingCartComponent, canActivate: [MyAccountCanActivate] },
      { path: 'place-order', component: PlaceOrderComponent, canActivate: [MyAccountCanActivate] },
      { path: 'view', component: ViewProductComponent },
      { path: 'contact', component: ContactComponent }
    ]
  },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent, canActivate: [LoginCanActivate] },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'admin', component: AdminComponent, children: [
      { path: '', redirectTo: 'permissions', pathMatch: 'full' },
      { path: 'permissions', component: UserPermissionsComponent, data: { title: 'Permisiuni utilizatori', requiredAuthorities: ['READ_ANY_PERMISSION'] }, canActivate: [AdminCanActivate] },
      { path: 'roles', component: UserRolesComponent, data: { title: 'Roluri utilizatori', requiredAuthorities: ['READ_ANY_ROLE'] } }, // TODO: add required authorities and can activate
      { path: 'users', component: WebUsersComponent, data: { title: 'Conturi utilizatori', requiredAuthorities: ['READ_ANY_USER'] } },
      { path: 'products', component: ProductComponent, data: { title: 'Administrare produse', requiredAuthorities: ['READ_ANY_PRODUCT'] } },
      { path: 'orders', component: OrderComponent, data: { title: 'Administrare comenzi', requiredAuthorities: ['READ_ANY_ORDER'] } }
    ],
    data: { requiredAuthorities: ['ELEVATED'] },
    canActivate: [AdminCanActivate]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
