export class FriendListDto {
    readonly _id: { oid: String; };
    email: string;
    fullName: string;
    username: string;
    totalfriend:number;
    friendlist: any[];
}