export class CreateCoinDto {
    readonly _id: { oid: String; };
    name: string;
    item_id: string;
    package_id: string;
    price: number;
    amount: number;
    stock: number;
    thumbnail: string;
    createdAt: string;
    updatedAt: string;
    type: string;
    used_stock: number;
    last_stock: number;
}

export class CreateCreditDto {
    readonly _id: { oid: String; };
    name: string;
    redirectUrl: string;
    description: string;
    item_id: string;
    package_id: string;
    price: number;
    amount: number;
    stock: number;
    audiens: string;
    audiens_user: any[];
    createdAt: string;
    updatedAt: string;
    type: string;
    title: string;
    body_message: string;
    isSend: boolean;
    used_stock: number;
    last_stock: number;
}