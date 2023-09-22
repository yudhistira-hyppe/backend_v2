import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Userbasicnew, UserbasicnewDocument } from './schemas/userbasicnew.schema';

@Injectable()
export class UserbasicnewService {
    constructor(
        @InjectModel(Userbasicnew.name, 'SERVER_FULL')
        private readonly UserbasicnewModel: Model<UserbasicnewDocument>,
    ) { }

    async create(Userbasicnew_: Userbasicnew): Promise<Userbasicnew> {
        const _Userbasicnew_ = await this.UserbasicnewModel.create(Userbasicnew_);
        return _Userbasicnew_;
    }
    async findOne(id: string): Promise<Userbasicnew> {
        return this.UserbasicnewModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }
    async find(): Promise<Userbasicnew[]> {
        return this.UserbasicnewModel.find().exec();
    }

    async findbyemail(email:string): Promise<Userbasicnew> {
        return this.UserbasicnewModel.findOne({ email:email }).exec();
    }

    async finddetail(email:string){
        var result = await this.UserbasicnewModel.aggregate([
            {
                "$match":
                {
                    email:email
                }
            },
            {
                "$addFields":
                {
                    "urluserBadge":
                    {
                        "$ifNull":
                        [
                            {
                                "$filter":
                                {
                                input: "$userBadge",
                                as: "listbadge",
                                cond:
                                {
                                    "$and":
                                    [
                                        {
                                        "$eq":
                                            [
                                            "$$listbadge.isActive", true
                                            ]
                                        },
                                        {
                                        "$lte": [
                                            {
                                            "$dateToString": {
                                                "format": "%Y-%m-%d %H:%M:%S",
                                                "date": {
                                                "$add": [
                                                    new Date(),
                                                    25200000
                                                ]
                                                }
                                            }
                                            },
                                            "$$listbadge.endDatetime"
                                        ]
                                        }
                                    ]
                                }
                                },
                            },
                            []
                        ]
                    },
                }
            },
            {
                "$project":
                {
                    "_id":1,
                    "profileID": 1,
                    "email": 1,
                    "fullName": 1,
                    "dob":1,
                    "gender": 
                    {
                        "$ifNull":
                        [
                            "$gender",
                            "Other"
                        ]
                    },
                    "status": 1,
                    "event": 1,
                    "isComplete": 1,
                    "isCelebrity": 1,
                    "isIdVerified": 1,
                    "isPrivate": 1,
                    "isFollowPrivate": 1,
                    "isPostPrivate": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "insight": 1,
                    "userInterests": 1,
                    "userAuth": 1,
                    "languages": 1,
                    "_class": 1,
                    "statusKyc": 1,
                    "reportedUser": 1,
                    "reportedUserHandle": 1,
                    "listAddKyc": 1,
                    "userAssets": 1,
                    "__v": 1,
                    "profilePict": 1,
                    "bio": 1,
                    "mobileNumber": 1,
                    "timeEmailSend": 1,
                    "icon": 1,
                    "userBadge": 1,
                    "countries": 1,
                    "states": 1,
                    "cities": 1,
                    "idProofNumber": 1,
                    "idProofStatus": 1,
                    "pin": 1,
                    "otppinVerified": 1,
                    "tutor": 1,
                    urluserBadge: 
                    {
                        "$ifNull":[
                        {
                            "$arrayElemAt":
                            [
                                "$urluserBadge", 0
                            ]
                        },
                        null
                        ]
                    },
                    "username":1,
                    "languagesLangIso":1,
                    "countriesName":1,
                    "citiesName":1,
                    "statesName":1,
                    "mediaBasePath":1,
                    "mediaUri":1,
                    "mediaType":1,
                    "mediaEndpoint":1,
                    "oneTimePassword":1,
                    "otpToken":1,
                    "isEmailVerified":1,
                    "authUsers":1,
                    "roles":1,
                    "otpNextAttemptAllow":1,
                    "follower":1,
                    "following":1,
                    "userEvent":1,
                    "languagesLang":1,
                    "password":1,
                    "userID":1,
                    "isExpiryPass":1,
                    "otpRequestTime":1,
                    "otpAttempt":1,
                    "location":1,
                    "isEnabled":1,
                    "isAccountNonExpired":1,
                    "isAccountNonLocked":1,
                    "isCredentialsNonExpired":1,
                    "_idAvatar":1,
                    "originalName":1,
                    "fsSourceUri":1,
                    "fsSourceName":1,
                    "fsTargetUri":1,
                    "ktpMediaBasePath":1,
                    "ktpMediaUri":1,
                    "ktpOriginalName":1,
                    "ktpFsSourceUri":1,
                    "ktpFsSourceName":1,
                    "ktpFsTargetUri":1,
                }
            }
        ]);

        return result[0];
    }

    async update(id: string, Userbasicnew_: Userbasicnew): Promise<Userbasicnew> {
        let data = await this.UserbasicnewModel.findByIdAndUpdate(id, Userbasicnew_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async updatebyemail(email: string, Userbasicnew_: Userbasicnew) {
        let data = await this.UserbasicnewModel.updateOne(
            {
                email:email
            }, 
            Userbasicnew_, 
            { new: true }
        );
        
        if (!data) {
            throw new Error('Data is not found!');
        }
        
        return data;
    }

    async delete(id: string) {
        const data = await this.UserbasicnewModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }

    async updateLanguage(email: string, CreateUserbasicnewDto_: Userbasicnew) {
        console.log(CreateUserbasicnewDto_);
        this.UserbasicnewModel.updateOne(
          {
            email: email,
          },
          {
            $set: CreateUserbasicnewDto_
          },
          function (err, docs) {
            if (err) {
              console.log(err);
            } else {
              console.log(docs);
            }
          },
        ).clone().exec();
    }

}
