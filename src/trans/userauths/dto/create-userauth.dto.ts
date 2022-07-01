import { ObjectId } from "mongodb";

export class CreateUserauthDto {
  _id: ObjectId;
  username: String;
  password: string;
  userID: String;
  email: String;
  regSrc: String;
  createdAt: String;
  updatedAt: String;
  isExpiryPass: Boolean;
  isEmailVerified: Boolean;
  otpRequestTime: { numberLong: String };
  otpAttempt: { numberLong: String };
  otpNextAttemptAllow: { numberLong: String };
  isEnabled: Boolean;
  isAccountNonExpired: Boolean;
  isAccountNonLocked: Boolean;
  isCredentialsNonExpired: Boolean;
  roles: [String];
  devices: [
    {
      $ref: String;
      $id: {
        $oid: String;
      };
      $db: String;
    },
  ];
  _class: String;
  oneTimePassword: String;
}