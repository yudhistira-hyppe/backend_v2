import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserbasicnewDocument = Userbasicnew & Document;

@Schema({ collection: 'newUserBasics' })
export class Userbasicnew {
    _id: mongoose.Types.ObjectId;
    @Prop()
    profileID: string;
    @Prop()
    email: String;
    @Prop()
    fullName: String;
    @Prop()
    dob: String;
    @Prop()
    gender: String;
    @Prop()
    mobileNumber: String;
    @Prop()
    status: String;
    @Prop()
    event: String;
    @Prop()
    idProofName: String;
    @Prop()
    idProofNumber: String;
    @Prop()
    idProofStatus: String;
    @Prop()
    isComplete: boolean;
    @Prop()
    isCelebrity: boolean;
    @Prop()
    isIdVerified: boolean;
    @Prop()
    isPrivate: boolean;
    @Prop()
    isFollowPrivate: boolean;
    @Prop()
    isPostPrivate: boolean;

    @Prop()
    createdAt: String;
    @Prop()
    updatedAt: String;
    @Prop()
    bio: String;
    @Prop({ type: Object })
    profilePict: any;
    @Prop({ type: Object })
    proofPict: {
        ref: String;
        id: String;
        db: String;
    };
    @Prop({ type: Object })
    insight: {
        ref: String;
        id: {
            oid: String;
        };
        db: String;
    };
    @Prop()
    userInterests: any[];
    @Prop({ type: Object })
    userAuth: {
        ref: String;
        id: {
            oid: String;
        };
        db: String;
    };
    @Prop({ type: Object })
    cities: {
        ref: String;
        id: {
            oid: String;
        };
        db: String;
    };
    @Prop({ type: Object })
    states: {
        ref: String;
        id: {
            oid: String;
        };
        db: String;
    };
    @Prop({ type: Object })
    countries: {
        ref: String;
        id: {
            oid: String;
        };
        db: String;
    };
    @Prop({ type: Object })
    languages: {
        ref: String;
        id: {
            oid: String;
        };
        db: String;
    };
    @Prop()
    _class: String;
    @Prop()
    pin: String;
    @Prop()
    otp_pin: String;

    @Prop()
    otp_expired_time: String;
    @Prop()
    otppinVerified: boolean;
    @Prop()
    statusKyc: string;
    @Prop()
    timeEmailSend: string;
    @Prop()
    reportedStatus: string
    @Prop()
    reportedUserCount: number
    @Prop()
    reportedUser: any[];
    @Prop()
    reportedUserHandle: any[];
    @Prop()
    listAddKyc: any[];
    @Prop()
    userAssets: any[];
    @Prop()
    import: String;
    @Prop()
    userBadge: any[];
    @Prop()
    tutor: any[];
    @Prop()
    userEvent: string;
    following: any[];
    follower: any[];
    citiesName: string;
    statesName: string;
    countriesName: string;
    languagesLang: string;
    languagesLangIso: string;
    _idAuth: mongoose.Types.ObjectId;
    username: string;
    password: string;
    userID: string;
    isExpiryPass: string;
    isEmailVerified: boolean;
    otpRequestTime: number;
    otpAttempt: number;
    otpNextAttemptAllow: number;
    location: any;
    isEnabled: boolean;
    isAccountNonExpired: boolean;
    isAccountNonLocked: boolean;
    isCredentialsNonExpired: boolean;
    roles: any[]
    authUsers: any;
    _idAvatar: string;
    mediaType: string;
    mediaBasePath: string;
    mediaUri: string;
    originalName: string;
    fsSourceUri: string;
    fsSourceName: string;
    fsTargetUri: string;
    mediaEndpoint: string;
    ktpMediaBasePath: string;
    ktpMediaUri: string;
    ktpOriginalName: string;
    ktpFsSourceUri: string;
    ktpFsSourceName: string;
    ktpFsTargetUri: string;

}

export const UserbasicnewSchema = SchemaFactory.createForClass(Userbasicnew);