import { ObjectId } from "mongodb";
import { Long } from "mongodb";

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
  otpRequestTime: Long;
  otpAttempt: Long;
  otpNextAttemptAllow: Long;
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
  upgradeRole: String;
}