import { Routes } from '@angular/router';
import { AllTransactionsComponent } from './modules/transactions/all-transactions/all-transactions.component';
import { HomeComponent } from './modules/home/home.component';
import { AddUpdateTransactionComponent } from './modules/transactions/add-update-transaction/add-update-transaction.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'

    },
    {
        path: 'all-transactions',
        component: AllTransactionsComponent
    },
    {
        path: 'add-transaction',
        component: AddUpdateTransactionComponent
    },
    {
        path: 'home',
        component: HomeComponent
    }
];
