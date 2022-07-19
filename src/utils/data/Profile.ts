import { CreateInsightsDto } from "src/content/insights/dto/create-insights.dto";
import { CreateReferralDto } from "src/trans/referral/dto/create-referral.dto";

export class ProfileDTO {
    profileID: String;
    username: String;
    password: String;
    fullName: String;
    email: String;
    langIso: String;
    location: LocationDTO; 
    regSrc: String; 
    interest: Array<String>;
    bio: String;
    deviceId: String;
    dob: String;
    gender: String;
    idProofNumber: String;
    idProofStatus: String;
    country: String;
    area: String;
    city: String;
    mobileNumber: String;
    eulaID: String;
    isCelebrity: String;
    isIdVerified: String;
    isPrivate: String;
    isFollowPrivate: String;
    isPostPrivate: String;
    isComplete: String;
    isEmailVerified: String;
    otp: String;
    otpToken: String;
    event: String;
    status: String;
    oldPass: String;
    newPass: String; 
    avatar: AvatarDTO; 
    roles: Array<String>;
    authEmail: String;
    token: String;
    refreshToken: String;
    userProfile: String;
    insight: CreateInsightsDto;
    socmedSource: String;
    referral: String;
    imei: String;
    referralCount: String;
    children: Array<CreateReferralDto>;
}

export class LocationDTO {
    longitude: String;
    latitude: String;
}

export class AvatarDTO {
    mediaBasePath: String;
    mediaUri: String;
    mediaType: String;
    mediaEndpoint: String;
}