export class CreateNotificationsDto {


    _id: String;
    notificationID: String;
    email: String;
    eventType: String;
    event: String;
    mate: String;
    senderOrReceiverInfo: {
        fullName: String;
        avatar: {
            mediaBasePath: String;
            mediaUri: String;
            mediaType: String;
            mediaEndpoint: String;
        };
        username: String;
    };
    title: String;
    body: String;
    bodyId: String;
    active: boolean;
    flowIsDone: boolean;
    createdAt: String;
    updatedAt: String;
    contentEventID: String;
    devices: any[];
    actionButtons: String;
}

export class Messages {
    info: string[];
}

export class NotifResponseApps {
    response_code: number;
    data: CreateNotificationsDto[];
    messages: Messages;
    version: string;
}