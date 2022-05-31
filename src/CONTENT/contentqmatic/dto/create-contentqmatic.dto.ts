export class CreateContentqmaticDto {
  

    readonly _id: { oid:String;  };
    readonly active: boolean;
    readonly  aggrYear: Number;
    readonly  aggrMonth: Number;
    readonly  aggrWeek: Number;
    readonly  aggrDay: Number;
    readonly contents:[
        {
            allowComments:boolean;
            createdAt:String;
            postType:String;
            active:boolean;
            postID:String;
            email:String;
            tags:[];
            updatedAt:String;
            
        }
    ]
    readonly _class:String;
  }