import { Routes } from '@angular/router';
import { AllTransactionsComponent } from './modules/transactions/all-transactions/all-transactions.component';
import { HomeComponent } from './modules/home/home.component';

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
        path: 'home',
        component: HomeComponent
    }
];
