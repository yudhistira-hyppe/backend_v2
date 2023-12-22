export class CreateUserChallengeDto {
    _id: { oid: String; };    
    idChallenge: { oid: String; };    
    idUser: { oid: String; };    
    idSubChallenge: { oid: String; };
    objectChallenge: String;    
    isActive: boolean;
    ranking: number;
    score: number;
    startDatetime: string;
    endDatetime: string;
    createdAt: string;
    updatedAt: string;    
    activity: any[];
    history: any[];
    rejectRemark: any[];
    isBot: boolean;
}
