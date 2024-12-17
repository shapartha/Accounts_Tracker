import { Routes } from '@angular/router';
import { AllTransactionsComponent } from './modules/transactions/all-transactions/all-transactions.component';
import { HomeComponent } from './modules/home/home.component';
import { AddUpdateTransactionComponent } from './modules/transactions/add-update-transaction/add-update-transaction.component';
import { LoginComponent } from './modules/login/login.component';
import { AuthGuard } from './services/auth.service';
import { LogoutComponent } from './modules/logout/logout.component';
import { AllRecurringComponent } from './modules/transactions/all-recurring/all-recurring.component';
import { AllScheduledComponent } from './modules/transactions/all-scheduled/all-scheduled.component';
import { AddUpdateAccountComponent } from './modules/accounts/add-update-account/add-update-account.component';
import { AddUpdateCategoryComponent } from './modules/categories/add-update-category/add-update-category.component';
import { MapMfComponent } from './modules/mutual-funds/map-mf/map-mf.component';
import { MapStockComponent } from './modules/stocks/map-stock/map-stock.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'

    },
    {
        path: 'all-transactions',
        component: AllTransactionsComponent, canActivate : [AuthGuard]
    },
    {
        path: 'all-recurring',
        component: AllRecurringComponent, canActivate : [AuthGuard]
    },
    {
        path: 'all-scheduled',
        component: AllScheduledComponent, canActivate : [AuthGuard]
    },
    {
        path: 'add-transaction',
        component: AddUpdateTransactionComponent, canActivate : [AuthGuard]
    },
    {
        path: 'add-account',
        component: AddUpdateAccountComponent, canActivate : [AuthGuard]
    },
    {
        path: 'add-category',
        component: AddUpdateCategoryComponent, canActivate : [AuthGuard]
    },
    {
        path: 'home',
        component: HomeComponent, canActivate : [AuthGuard]
    },
    {
        path: 'map-mf',
        component: MapMfComponent, canActivate : [AuthGuard]
    },
    {
        path: 'map-stock',
        component: MapStockComponent, canActivate : [AuthGuard]
    },
    {
        path: 'logout',
        component: LogoutComponent, canActivate : [AuthGuard]
    },
    {
        path: 'login',
        component: LoginComponent
    },
];
