export class CreateInsightsDto {
  

    readonly _id: String;
    readonly insightID: String;
    readonly active: boolean;
    readonly  createdAt: String;
    readonly  updatedAt: String;
    readonly email: String;
    readonly followers: {
        numberLong:String;
    };
    readonly followings: {
        numberLong:String;
    };
    readonly unfollows: {
        numberLong:String;
    };
    readonly likes: {
        numberLong:String;
    };
    readonly views: {
        numberLong:String;
    };
    readonly comments: {
        numberLong:String;
    };
    readonly posts: {
        numberLong:String;
    };
    readonly shares: {
        numberLong:String;
    };
    readonly reactions: {
        numberLong:String;
    };
    readonly _class:String;
  }