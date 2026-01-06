export interface Transaction {
    id?: string;
    description?: string;
    amount?: string;
    date?: string;
    transType?: string;
    receiptImgId?: string;
    createdDate?: string;
    updatedDate?: string;
    acc_id?: string;
    acc_name?: string;
    acc_balance?: string;
    cat_id?: string;
    cat_name?: string;
    user_id?: string;
    mfNav?: string;
    is_equity?: string;
    is_mf?: string;
    is_delivery_order?: string;
    is_delivered?: string;
    is_return_order?: string;
    is_returned?: string;
    is_group_trans?: boolean;
    selected?: boolean;
}

export interface SaveTransaction {
    desc?: string;
    type?: string;
    amount?: string;
    date?: string;
    acc_id?: string;
    user_id?: string;
    rec_date?: string;
    image_path?: string;
    scheme_code?: string;
    mf_nav?: string;
    is_delivery_order?: string | boolean;
    is_delivered?: string | boolean;
}