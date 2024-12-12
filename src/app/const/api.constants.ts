export class ApiConstants {
    static API_GET_CATEGORY: string = "getCategoryUserId";
    static API_GET_ACCOUNTS_BY_CATEGORY: string = "getAccountsByCategory";
    static API_GET_ALL_TRANS: string = "getTransByUser";
    static API_GET_TRANS_BY_ACCOUNT: string = "getTransByAccount";
    static API_SEARCH_TRANSACTION: string = "searchTransactions";
    static API_GET_TOKEN: string = "getToken";
    static API_USER_LOGIN: string = "getUserDataEmailPassword";
    static API_GET_ALL_ACCOUNTS: string = "getAccountsByUser";
    static API_GET_MF_SCHEMES_BY_ACCOUNT: string = "getMfMappingByAccount";
    static API_UPLOAD_RECEIPT: string = "storeReceipt";
    static API_SAVE_TRANSACTION: string = "addTransactionProcess";
    static API_GET_ALL_RECUR_TRANS: string = "getRecTransByUser";
    static API_UPDATE_RECUR_TRANS: string = "updateRecTrans";
    static API_DELETE_RECUR_TRANS: string = "deleteRecTrans";
    static API_GET_TODAY_SCHEDULE_TRANS: string = "getScheduledTransToday";
    static API_GET_TODAY_RECUR_TRANS: string = "getPendingRecTrans";
    static API_COMPLETE_RECUR_TRANS: string = "completeRecurringTransactionProcess";
    static API_GET_ALL_SCHEDULED_TRANS: string = "getAllScheduledTrans";
    static API_PROCESS_SCHEDULED_TRANS: string = "processScheduledTransaction";
    static API_UPDATE_SCHEDULED_TRANS: string = "updateScheduledTrans";
    
    static SERVER_URL: string = "https://shapartha.online/accountstracker/api/";
    static API_KEY: string = "tn4mzlCxWb7Ix90";
}