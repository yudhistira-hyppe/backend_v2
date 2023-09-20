import mongoose from "mongoose";

export class CreateuserbasicnewDto {
  _id: { oid:String; };
  profileID: String;
  email: String;
  fullName: String;
  dob: String;
  gender:String;
  regSrc: String;
  loginSource: String;
  loginSrc: String;
  mobileNumber:String;
  status:String;
  event:String;
  idProofName:String;
  idProofNumber:String;
  idProofStatus:String;
  isComplete:String;
  isCelebrity:String;
  isIdVerified:String;
  isPrivate:String;
  isFollowPrivate:String;
  isPostPrivate:String;
  createdAt:String;
  updatedAt:String;
  bio:String;
  profilePict: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  proofPict: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  insight: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  userInterests:any[];
  authUsers:{
    "devices":any[]
  };
  cities: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  states: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  countries: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  languages: {
    $ref: String;
    $id: { oid: String };
    $db: String;
  };
  _class: String;
  pin: String;
  otp_pin: String;
  otp_expired_time: String;
  otppinVerified: boolean;
  statusKyc: string;
  timeEmailSend: string;
  reportedStatus: string;
  reportedUserCount: number;
  reportedUser: any[];
  reportedUserHandle: any[];
  listAddKyc: any[];
  userAssets: any[];
  import: String;
  userBadge: any[];
  tutor: any[];
  userEvent: String;
  following: any[];
  follower: any[];
  citiesName: String;
  statesName: String;
  countriesName: String;
  languagesLang: String;
  languagesLangIso: String;
  _idAuth: {oid:String;};
  username: String;
  password: String;
  userID: String;
  isExpiryPass: String;
  isEmailVerified: boolean;
  otpRequestTime: number;
  otpAttempt: number;
  otpNextAttemptAllow: number;
  location: any;
  isEnabled: boolean;
  isAccountNonExpired: boolean;
  isAccountNonLocked: boolean;
  isCredentialsNonExpired: boolean;
  roles: any[];
  _idAvatar: String;
  mediaType: String;
  mediaBasePath: String;
  mediaUri: String;
  originalName: String;
  fsSourceUri: String;
  fsSourceName: String;
  fsTargetUri: String;
  mediaEndpoint: String;
  ktpMediaBasePath: String;
  ktpMediaUri: String;
  ktpOriginalName: String;
  ktpFsSourceUri: String;
  ktpFsSourceName: String;
  ktpFsTargetUri: String;
}