export class CreateSubChallengeDto {
    _id: { oid: String; };    
    challengeId: { oid: String; };
    startDatetime: string;
    endDatetime: string;
    isActive: boolean;
}
