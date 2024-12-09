import { Account } from "./account";

export interface Category {
    name: string;
    id: string;
    amount: string;
    user_id: number;
    image: string;
    accounts?: Account[];
}