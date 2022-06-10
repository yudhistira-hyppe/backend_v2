export class CreateActivityeventsDto {
  _id: { oid: String };
  activityEventID: String;
  activityType: String;
  active: boolean;
  status: String;
  target: String;
  event: String;
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
  sequenceNumber: String;
  flowIsDone: boolean;
  transitions: [
    {
      ref: String;
      id: String;
      db: String;
    },
  ];
  _class: String;
}