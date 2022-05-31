export class CreateWelcomenotesDto {
  

    readonly _id: { oid:String;  };
    readonly  langIso: String;
    readonly content: [
        {
            notesData:[{
                page:Number;
                note:{
                    type:String;
                    crossAxisAlignment:String;
                    mainAxisAlignment:String;
                    mainAxisSize:String;
                    textBaseline:String;
                    verticalDirection:String;
                    children: [
                        {
                          type: String;
                          data: String;
                          textAlign: String;
                          overflow: String;
                          textDirection: String;
                          style: {
                            color: String;
                            decoration: String;
                            fontSize: Number;
                            fontFamily: String;
                            fontStyle: String;
                            fontWeight: String;
                          }
                        },
                        {
                            type: String;
                            textSpan: {
                            text: String;
                            style: {
                                color: String;
                                decoration: String;
                                fontSize: Number;
                                fontFamily: String;
                                fontStyle: String;
                                fontWeight: String;
                              }
                          },
                          textAlign: String;
                          overflow: String;
                          textDirection: String;
                        },
                        {
                           type: String;
                           name: String;
                           width: String;
                           alignment: String;
                           repeat: String;
                           matchTextDirection: String;
                           gaplessPlayback: String;
                           filterQuality: String;
                        }
                    ]
                }
            }]
            
        }
    ];
   
    readonly countryCode:String;
    readonly  createdAt: String;
    readonly  updatedAt: String;
    readonly _class:String;
  }