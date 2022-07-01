import { Int32, ObjectId } from "mongodb";

export class CreateActivityeventsDto {
  _id: ObjectId;
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
  sequenceNumber: Int32;
  flowIsDone: boolean;
  fork: String;
  action: String;
  transitions: [
    {
      $ref: String;
      $id: { oid: String };
      $db: String;
    },
  ];
  _class: String;
  __v: String;
  userbasic: { oid: String };
}