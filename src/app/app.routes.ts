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
import { AddMailFilterMappingComponent } from './modules/auto-mails/add-mail-filter-mapping/add-mail-filter-mapping.component';
import { AdminHomeComponent } from './modules/admin/home/home.component';
import { MutualFundsComponent } from './modules/mutual-funds/mutual-funds.component';
import { StocksComponent } from './modules/stocks/stocks.component';
import { MfAccountComponent } from './modules/accounts/mfaccount/mfaccount.component';
import { EqAccountComponent } from './modules/accounts/eqaccount/eqaccount.component';
import { AutoMailsComponent } from './modules/auto-mails/auto-mails.component';
import { CallbackComponent } from './modules/admin/callback/callback.component';
import { TagsComponent } from './modules/transactions/tags/tags.component';

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
        path: 'all-transactions/tags/:tagId',
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
        path: 'add-mail-filter',
        component: AddMailFilterMappingComponent, canActivate : [AuthGuard]
    },
    {
        path: 'admin/manage-home',
        component: AdminHomeComponent, canActivate : [AuthGuard]
    },
    {
        path: 'manage-mutual-funds',
        component: MutualFundsComponent, canActivate : [AuthGuard]
    },
    {
        path: 'manage-stocks',
        component: StocksComponent, canActivate : [AuthGuard]
    },
    {
        path: 'mf-dashboard',
        component: MfAccountComponent, canActivate: [AuthGuard]
    },
    {
        path: 'eq-dashboard',
        component: EqAccountComponent, canActivate: [AuthGuard]
    },
    {
        path: 'email_transactions',
        component: AutoMailsComponent, canActivate: [AuthGuard]
    },
    {
        path: 'transaction_tags',
        component: TagsComponent, canActivate: [AuthGuard]
    },
    {
        path: 'logout',
        component: LogoutComponent, canActivate : [AuthGuard]
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'callback',
        component: CallbackComponent
    }
];
