export class CreateActivityeventsDto {
  _id: { oid: String };
  activityEventID: String;
  activityType: String;
  active: boolean;
  status: String;
  event: String;
  target: String;
  payload: {
    login_location: {
      latitude: String;
      longitude: String;
    };
    logout_date: String;
    login_date: String;
    login_device: String;
    email: String;
  };
  createdAt: String;
  updatedAt: String;
  parentActivityEventID: String;
  sequenceNumber: String;
  flowIsDone: boolean;
  transitions: [
    {
      $ref: String;
      $id: String;
      $db: String;
    },
  ];
  _class: String;
}