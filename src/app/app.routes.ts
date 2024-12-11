import { Routes } from '@angular/router';
import { AllTransactionsComponent } from './modules/transactions/all-transactions/all-transactions.component';
import { HomeComponent } from './modules/home/home.component';
import { AddUpdateTransactionComponent } from './modules/transactions/add-update-transaction/add-update-transaction.component';
import { LoginComponent } from './modules/login/login.component';
import { AuthGuard } from './services/auth.service';
import { LogoutComponent } from './modules/logout/logout.component';

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
        path: 'add-transaction',
        component: AddUpdateTransactionComponent, canActivate : [AuthGuard]
    },
    {
        path: 'home',
        component: HomeComponent, canActivate : [AuthGuard]
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
