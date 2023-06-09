export class CreateUserChallengeDto {
    _id: { oid: String; };    
    idChallenge: { oid: String; };    
    idUser: { oid: String; };    
    isActive: boolean;
    ranking: number;
    score: number;
    createdAt: string;
    updatedAt: string;    
    activity: any[];
    history: any[];
}
