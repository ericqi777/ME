export interface Transaction {

    fromUserName: string;
    toUserName: string;
    creditChange: number;
    currentCredit: number;
    isDeposite: boolean;
    transactionType: TransactionType;
    createdTime: string;

}

enum TransactionType {
    DEPOSITE, //Credit got deposit from parent
    ALLOCATE, //Credit being allocated to child user
    COLLECT,  //Credit being re-claimed by deleting user
    CONSUMED  //Credit being consumed by making message requests
}