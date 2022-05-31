export class CreateNotificationsDto {
  

    readonly _id: String;
    readonly notificationID: String;
    readonly email: String;
    readonly eventType: String;
    readonly event: String;
    readonly mate: String;
    readonly senderOrReceiverInfo: {
        fullName:String;
        avatar:{
            mediaBasePath:String;
            mediaUri:String;
            mediaType:String;
            mediaEndpoint:String;
        };
        username:String;
    };
    readonly title: String;
    readonly body: String;
    readonly active: boolean;
    readonly flowIsDone: boolean;
    readonly createdAt: String;
    readonly updatedAt: String;
    readonly contentEventID: String;
    readonly devices: [];
    readonly actionButtons: String;


  }