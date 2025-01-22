export class ApiConstants {
    static API_GET_CATEGORY: string = "getCategoryUserId";
    static API_GET_ACCOUNTS_BY_CATEGORY: string = "getAccountsByCategory";
    static API_GET_ACCOUNTS_BY_NAME: string = "getAccountByName";
    static API_GET_ACCOUNT_BY_ID: string = "getAccountById";
    static API_GET_ALL_TRANS: string = "getTransByUser";
    static API_GET_TRANS_BY_ACCOUNT: string = "getTransByAccount";
    static API_SEARCH_TRANSACTION: string = "searchTransactions";
    static API_GET_TOKEN: string = "getToken";
    static API_USER_LOGIN: string = "getUserDataEmailPassword";
    static API_GET_ALL_ACCOUNTS: string = "getAccountsByUser";
    static API_GET_MF_SCHEMES_BY_ACCOUNT: string = "getMfMappingByAccount";
    static API_UPLOAD_RECEIPT: string = "storeReceipt";
    static API_SAVE_TRANSACTION: string = "addTransactionProcess";
    static API_SAVE_TRANSACTION_ONLY: string = "storeTrans";
    static API_SAVE_ACCOUNT: string = "storeAccount";
    static API_SAVE_CATEGORY: string = "storeCategory";
    static API_GET_ALL_RECUR_TRANS: string = "getRecTransByUser";
    static API_UPDATE_RECUR_TRANS: string = "updateRecTrans";
    static API_DELETE_RECUR_TRANS: string = "deleteRecTrans";
    static API_DELETE_TRANSACTION: string = "deleteTrans";
    static API_DELETE_CATEGORY: string = "deleteCategory";
    static API_DELETE_ACCOUNT: string = "deleteAccount";
    static API_UPDATE_ACCOUNT: string = "updateAccount";
    static API_UPDATE_CATEGORY: string = "updateCategory";
    static API_UPDATE_TRANSACTION: string = "updateTrans";
    static API_GET_RECEIPT: string = "getReceiptImage";
    static API_GET_TODAY_SCHEDULE_TRANS: string = "getScheduledTransToday";
    static API_GET_TODAY_RECUR_TRANS: string = "getPendingRecTrans";
    static API_COMPLETE_RECUR_TRANS: string = "completeRecurringTransactionProcess";
    static API_GET_ALL_SCHEDULED_TRANS: string = "getAllScheduledTrans";
    static API_PROCESS_SCHEDULED_TRANS: string = "processScheduledTransaction";
    static API_UPDATE_SCHEDULED_TRANS: string = "updateScheduledTrans";
    static API_UPDATE_BILL_DUE_DATE: string = "generateDueDateForBills";
    static API_GET_ALL_MF: string = "getAllMf";
    static API_GET_MF_SCHEMES_BY_ACCOUNT_SCHEME: string = "getMfMappingByAccountScheme";
    static API_UPDATE_MF_MAPPING: string = "updateMfMapping";
    static API_SAVE_MF_MAPPING: string = "storeMfMapping";
    static API_UPDATE_STOCK_MAPPING: string = "updateStockMapping";
    static API_SAVE_MF_TRANS: string = "storeMfTrans";
    static API_UPDATE_MF_TRANS: string = "updateMfTrans";
    static API_DELETE_MF_TRANS: string = "deleteMfTrans";
    static API_DELETE_MF_MAPPING: string = "deleteMfMapping";
    static API_GET_ALL_STOCKS: string = "getAllStocks";
    static API_SAVE_STOCK_MAPPING: string = "storeStockMapping";
    static API_DELETE_STOCK: string = "deleteStock";
    static API_SAVE_STOCK: string = "storeStock";
    static API_UPDATE_STOCK: string = "updateStock";
    static API_SAVE_MF: string = "storeMf";
    static API_UPDATE_MF: string = "updateMf";
    static API_DELETE_MF: string = "deleteMf";
    static API_SCHEMA_BACKUP: string = "getSchemaBackup";
    static API_GET_ALL_MAIL_FILTER_MAPPING: string = "getAllMailFilterMappings";
    static API_GET_MAIL_FILTER_MAPPING_BY_FILTER: string = "getMailFilterMappingByFilter";
    static API_GET_MAIL_FILTER_MAPPING_BY_ACC: string = "getMailFilterMappingByAccId";
    static API_UPDATE_MAIL_FILTER_MAPPING: string = "updateMailFilterMapping";
    static API_DELETE_MAIL_FILTER_MAPPING: string = "deleteMailFilterMapping";
    static API_SAVE_MAIL_FILTER_MAPPING: string = "storeMailFilterMapping";
    static API_GET_DELIVERY_TRANS: string = "getDeliveryTrans";
    static API_MF_STOCKS_UPDATER: string = "mfStocksUpdater";
    static API_MONTHLY_ROUTINES: string = "monthlyRoutines";
    static API_GET_MF_TRANS_BY_ACC_SCHEME_ASC: string = "getMfTransByAccountSchemeAscending";
    static API_GET_MF_TRANS_BY_ACC_SCHEME: string = "getMfTransByAccountScheme";
    static API_GET_MF_TRANS_BY_ACC: string = "getMfTransByAccount";
    static API_GET_STOCK_MAPPING_BY_ACC: string = "getStockMappingByAccount";
    static API_GET_STOCK_MAPPING_BY_ACC_SYM: string = "getStockMappingByAccountSymbol";
    static API_GET_ALL_STOCK_MAPPINGS_BY_ACC_SYM: string = "getAllStockMappingsByAccountSymbol";
    
    static SERVER_PATH_URL: string = "https://shapartha.online/accountstracker/";
    static SERVER_URL: string = this.SERVER_PATH_URL + "api/";
    static API_KEY: string = "tn4mzlCxWb7Ix90";

    static API_FETCH_MF_NAV: string = "https://api.mfapi.in/mf/";
    static API_FETCH_MF_CODE: string = this.API_FETCH_MF_NAV + "search?q=";
    static API_FETCH_STOCK_CMP: string = "https://priceapi.moneycontrol.com/pricefeed/bse/equitycash/";
    static API_FETCH_STOCK_LIVE_DATA: string = "https://priceapi.moneycontrol.com/pricefeed/notapplicable/inidicesindia/";

    static API_GOOGLE_SIGNIN_CHECK: string = "checkGoogleSigninStatus";
    static API_GOOGLE_SIGNOUT: string = "gapiSignout";
    static API_GOOGLE_READ_EMAILS: string = "readEmails";
}