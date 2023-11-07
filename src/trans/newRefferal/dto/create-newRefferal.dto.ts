export class CreateNewRefferalDto {
    _id: { oid: string; };
    parent: string;
    children: string;
    active: boolean;
    verified: boolean;
    imei: string;
    createdAt: string;
    updatedAt: string;
    _class: string;
    userParent: string;
    userChild: string;
    idParent: { oid: string; };
    idChildren: { oid: string; };
}
