export class CreateSagasDto {
  

    readonly _id: { oid:String;  };
    readonly sagaType: String;
    readonly  sagaIdentifier: String;
    readonly serializedSaga: {
        binary:{
            base64:String;
            subType:String;
        }
    };
    readonly  associations: [{
        key:String;
        value:String;

    }];
    
  }