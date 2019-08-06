import { Transaction } from './transaction';
export interface AppUser {

    userName?: string;
    email?: string;
    credit?: number;
    isPowerUser?: boolean;
    isAdmin?: boolean;
    isGod?: boolean;
    createdTime?: string;
    parentUser?: string;
    childUsers?: string[];
    imageUrl?: string;
    transactions?: Transaction[];

}