export interface Account {
    id?: string;
    name?: string;
    category_id?: string;
    category_name?: string;
    balance?: string;
    is_equity?: boolean | string;
    is_mf?: boolean | string;
    created_date?: string;
    updated_date?: string;
    user_id?: number;
}

export interface SaveAccount {
    account_name?: string;
    category_id?: string;
    user_id?: string;
    balance?: string;
    is_mf?: string;
    is_equity?: string;
}