import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGetuserprofilesDto } from './dto/create-getuserprofiles.dto';
import { Getuserprofiles, GetuserprofilesDocument } from './schemas/getuserprofiles.schema';
import { CountriesService } from '../../infra/countries/countries.service';
import { CitiesService } from '../../infra/cities/cities.service';
import { AreasService } from '../../infra/areas/areas.service';
import { LanguagesService } from '../../infra/languages/languages.service';
import { InsightsService } from '../../content/insights/insights.service';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
import { InterestsRepoService } from '../../infra/interests_repo/interests_repo.service';
@Injectable()
export class GetuserprofilesService {
  constructor(
    @InjectModel(Getuserprofiles.name, 'SERVER_TRANS')
    private readonly getuserprofilesModel: Model<GetuserprofilesDocument>,
    private readonly countriesService: CountriesService,
    private readonly citiesService: CitiesService,
    private readonly areasService: AreasService,
    private readonly languagesService: LanguagesService,
    private readonly insightsService: InsightsService,
    private readonly mediaprofilepictsService: MediaprofilepictsService,
    private readonly interestsRepoService: InterestsRepoService,

  ) { }

  async create(
    CreateGetuserprofilesDto: CreateGetuserprofilesDto,
  ): Promise<Getuserprofiles> {
    const createGetuserprofilesDto = await this.getuserprofilesModel.create(
      CreateGetuserprofilesDto,
    );
    return createGetuserprofilesDto;
  }

  async findAll(documentsToSkip = 0, limitOfDocuments?: number) {
    const query = this.getuserprofilesModel
      .find()
      .sort({ _id: 1 })
      .skip(documentsToSkip);
    if (limitOfDocuments) {
      query.limit(limitOfDocuments);
    }
    return query;
  }

  async findUser(username: string, skip: number, limit: number) {
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();

    const query = await this.getuserprofilesModel.aggregate([
      {
        $addFields: {
          userAuth_id: '$userAuth.$id',
          profilePict_id: '$profilePict.$id',
          concat: '/profilepict',
          email: '$email',

        },
      },

      {
        $lookup: {
          from: 'mediaprofilepicts2',
          localField: 'profilePict_id',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
        },
      },
      {
        "$unwind": {
          "path": "$userAuth_data",
          "preserveNullAndEmptyArrays": false
        }
      },

      {
        "$match": {
          "userAuth_data.username": {
            $regex: username
          }
        }
      },
      {
        $project: {

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          idUserAuth: "$userAuth_data._id",
          fullName: '$fullName',
          username: '$userAuth_data.username',

          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },
        },
      },
      {
        $addFields: {

          concat: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
        },
      },
      {
        $project: {
          idUserAuth: '$idUserAuth',
          username: '$username',
          fullName: '$fullName',

          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

          },
        },
      },

      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },
    ]);
    return query;
  }

  async findata(fullName: string, gender: string, roles: string, age: string, page: number) {

    const countries = await this.countriesService.findcountries();
    const cities = await this.citiesService.findcities();
    const areas = await this.areasService.findarea();
    const languanges = await this.languagesService.findlanguanges();
    const insight = await this.insightsService.findinsight();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const interes = await this.interestsRepoService.findinterst();



    if (fullName !== undefined && gender === undefined && roles === undefined && age === undefined) {
      const query = await this.getuserprofilesModel.aggregate([
        {
          $match: {
            fullName: {
              $regex: fullName
            }
          }
        },
        {
          $addFields: {
            userAuth_id: '$userAuth.$id',
            countries_id: '$countries.$id',
            cities_id: '$cities.$id',
            areas_id: '$states.$id',
            languages_id: '$languages.$id',
            insight_id: '$insight.$id',
            profilePict_id: '$profilePict.$id',
            interest_id: '$userInterests.$id',
            concat: '/profilepict',
            email: '$email',
            age: {
              $round: [{
                $divide: [{
                  $subtract: [new Date(), {
                    $toDate: '$dob'
                  }]
                }, (365 * 24 * 60 * 60 * 1000)]
              }]
            }
          },
        },

        {
          $lookup: {
            from: 'interests_repo2',
            localField: 'interest_id',
            foreignField: '_id',
            as: 'interes_data',
          },
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilePict_id',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'countries2',
            localField: 'countries_id',
            foreignField: '_id',
            as: 'countries_data',
          },
        },
        {
          $lookup: {
            from: 'languages2',
            localField: 'languages_id',
            foreignField: '_id',
            as: 'languages_data',
          },
        },
        {
          $lookup: {
            from: 'cities2',
            localField: 'cities_id',
            foreignField: '_id',
            as: 'cities_data',
          },
        },
        {
          $lookup: {
            from: 'areas2',
            localField: 'areas_id',
            foreignField: '_id',
            as: 'areas_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
            localField: 'insight_id',
            foreignField: '_id',
            as: 'insight_data',
          },
        },
        {
          $lookup: {
            from: 'userauths',
            localField: 'userAuth_id',
            foreignField: '_id',
            as: 'userAuth_data',
          },
        },

        {
          $project: {
            activity: '$activity',
            createdAt: '$createdAt',
            auth: { $arrayElemAt: ['$userAuth_data', 0] },
            citi: { $arrayElemAt: ['$cities_data', 0] },
            countri: { $arrayElemAt: ['$countries_data', 0] },
            language: { $arrayElemAt: ['$languages_data', 0] },
            areas: { $arrayElemAt: ['$areas_data', 0] },
            insights: { $arrayElemAt: ['$insight_data', 0] },
            profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
            fullName: '$fullName',
            username: '$auth.userName',
            area: '$areas.stateName',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            countries: '$countri.country',
            cities: '$citi.cityName',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',
            dob: '$dob',
            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            },
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: '$profilpict.fsTargetUri',
              medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

            },
            interest: '$interes_data',
          }
        },
        {
          $addFields: {

            concat: '/profilepict',
            pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          },
        },
        {
          $project: {

            createdAt: '$createdAt',
            interest: '$interest',
            username: '$auth.username',
            fullName: '$fullName',
            countries: '$countri.country',
            area: '$areas.stateName',
            cities: '$citi.cityName',
            dob: '$dob',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',

            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            },
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

            },
          },
        },

        {
          $lookup: {
            from: "activityevents",
            localField: "email",
            foreignField: "payload.email",
            as: "activity_data"
          }
        },
        {
          "$unwind": {
            "path": "$activity_data",
            "preserveNullAndEmptyArrays": false
          }
        },
        { "$match": { "activity_data.event": "AWAKE" } },
        { "$sort": { "activity_data.createdAt": -1 }, },

        {
          "$group": {
            "_id": "$_id",
            "name": { "$first": "$fullName" },
            "tables": { "$push": "$activity_data" },
            "createdAt": { "$push": "$createdAt" },
            "fullName": { "$push": "$fullName" },
            "interest": { "$push": "$interest" },
            "username": { "$push": "$username" },
            "avatar": { "$push": "$avatar" },
            "insight": { "$push": "$insight" },
            "countries": { "$push": "$countries" },
            "area": { "$push": "$area" },
            "cities": { "$push": "$cities" },
            "dob": { "$push": "$dob" },
            "age": { "$push": "$age" },
            "email": { "$push": "$email" },
            "gender": { "$push": "$gender" },
            "bio": { "$push": "$bio" },
            "idProofNumber": { "$push": "$idProofNumber" },
            "mobileNumber": { "$push": "$mobileNumber" },
            "roles": { "$push": "$roles" },

            "event": { "$push": "$event" },
            "isComplete": { "$push": "$isComplete" },
            "status": { "$push": "$status" },
            "langIso": { "$push": "$langIso" },
          }
        },
        {
          $project: {
            createdAt: { $arrayElemAt: ['$createdAt', 0] },
            activity: { $arrayElemAt: ['$tables', 0] },
            fullName: { $arrayElemAt: ['$fullName', 0] },
            interest: { $arrayElemAt: ['$interest', 0] },
            username: { $arrayElemAt: ['$username', 0] },
            avatar: { $arrayElemAt: ['$avatar', 0] },
            insight: { $arrayElemAt: ['$insight', 0] },
            countries: { $arrayElemAt: ['$countries', 0] },
            area: { $arrayElemAt: ['$area', 0] },
            cities: { $arrayElemAt: ['$cities', 0] },
            dob: { $arrayElemAt: ['$dob', 0] },
            age: { $arrayElemAt: ['$age', 0] },
            email: { $arrayElemAt: ['$email', 0] },
            gender: { $arrayElemAt: ['$gender', 0] },
            bio: { $arrayElemAt: ['$bio', 0] },
            idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
            mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
            roles: { $arrayElemAt: ['$roles', 0] },

            event: { $arrayElemAt: ['$event', 0] },
            isComplete: { $arrayElemAt: ['$isComplete', 0] },
            status: { $arrayElemAt: ['$status', 0] },
            langIso: { $arrayElemAt: ['$langIso', 0] },
          }
        },
        { $sort: { createdAt: -1 }, },
        { $skip: page },
        { $limit: 15 },
      ]);
      return query;
    }
    else if (fullName === undefined && gender !== undefined && roles === undefined && age === undefined) {
      const query = await this.getuserprofilesModel.aggregate([
        { $match: { gender: gender } },
        {
          $addFields: {
            userAuth_id: '$userAuth.$id',
            countries_id: '$countries.$id',
            cities_id: '$cities.$id',
            areas_id: '$states.$id',
            languages_id: '$languages.$id',
            insight_id: '$insight.$id',
            profilePict_id: '$profilePict.$id',
            interest_id: '$userInterests.$id',
            concat: '/profilepict',
            email: '$email',
            age: {
              $round: [{
                $divide: [{
                  $subtract: [new Date(), {
                    $toDate: '$dob'
                  }]
                }, (365 * 24 * 60 * 60 * 1000)]
              }]
            }
          },
        },

        {
          $lookup: {
            from: 'interests_repo2',
            localField: 'interest_id',
            foreignField: '_id',
            as: 'interes_data',
          },
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilePict_id',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'countries2',
            localField: 'countries_id',
            foreignField: '_id',
            as: 'countries_data',
          },
        },
        {
          $lookup: {
            from: 'languages2',
            localField: 'languages_id',
            foreignField: '_id',
            as: 'languages_data',
          },
        },
        {
          $lookup: {
            from: 'cities2',
            localField: 'cities_id',
            foreignField: '_id',
            as: 'cities_data',
          },
        },
        {
          $lookup: {
            from: 'areas2',
            localField: 'areas_id',
            foreignField: '_id',
            as: 'areas_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
            localField: 'insight_id',
            foreignField: '_id',
            as: 'insight_data',
          },
        },
        {
          $lookup: {
            from: 'userauths',
            localField: 'userAuth_id',
            foreignField: '_id',
            as: 'userAuth_data',
          },
        },

        {
          $project: {
            activity: '$activity',
            createdAt: '$createdAt',
            auth: { $arrayElemAt: ['$userAuth_data', 0] },
            citi: { $arrayElemAt: ['$cities_data', 0] },
            countri: { $arrayElemAt: ['$countries_data', 0] },
            language: { $arrayElemAt: ['$languages_data', 0] },
            areas: { $arrayElemAt: ['$areas_data', 0] },
            insights: { $arrayElemAt: ['$insight_data', 0] },
            profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
            fullName: '$fullName',
            username: '$auth.userName',
            area: '$areas.stateName',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            countries: '$countri.country',
            cities: '$citi.cityName',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',
            dob: '$dob',
            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            },
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: '$profilpict.fsTargetUri',
              medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

            },
            interest: '$interes_data',
          }
        },
        {
          $addFields: {

            concat: '/profilepict',
            pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          },
        },
        {
          $project: {

            createdAt: '$createdAt',
            interest: '$interest',
            username: '$auth.username',
            fullName: '$fullName',
            countries: '$countri.country',
            area: '$areas.stateName',
            cities: '$citi.cityName',
            dob: '$dob',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',

            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            }, avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

            },
          },
        },

        {
          $lookup: {
            from: "activityevents",
            localField: "email",
            foreignField: "payload.email",
            as: "activity_data"
          }
        },
        {
          "$unwind": {
            "path": "$activity_data",
            "preserveNullAndEmptyArrays": false
          }
        },
        { "$match": { "activity_data.event": "AWAKE" } },
        { "$sort": { "activity_data.createdAt": -1 }, },

        {
          "$group": {
            "_id": "$_id",
            "name": { "$first": "$fullName" },
            "tables": { "$push": "$activity_data" },
            "createdAt": { "$push": "$createdAt" },
            "fullName": { "$push": "$fullName" },
            "interest": { "$push": "$interest" },
            "username": { "$push": "$username" },
            "avatar": { "$push": "$avatar" },
            "insight": { "$push": "$insight" },
            "countries": { "$push": "$countries" },
            "area": { "$push": "$area" },
            "cities": { "$push": "$cities" },
            "dob": { "$push": "$dob" },
            "age": { "$push": "$age" },
            "email": { "$push": "$email" },
            "gender": { "$push": "$gender" },
            "bio": { "$push": "$bio" },
            "idProofNumber": { "$push": "$idProofNumber" },
            "mobileNumber": { "$push": "$mobileNumber" },
            "roles": { "$push": "$roles" },

            "event": { "$push": "$event" },
            "isComplete": { "$push": "$isComplete" },
            "status": { "$push": "$status" },
            "langIso": { "$push": "$langIso" },
          }
        },
        {
          $project: {
            createdAt: { $arrayElemAt: ['$createdAt', 0] },
            activity: { $arrayElemAt: ['$tables', 0] },
            fullName: { $arrayElemAt: ['$fullName', 0] },
            interest: { $arrayElemAt: ['$interest', 0] },
            username: { $arrayElemAt: ['$username', 0] },
            avatar: { $arrayElemAt: ['$avatar', 0] },
            insight: { $arrayElemAt: ['$insight', 0] },
            countries: { $arrayElemAt: ['$countries', 0] },
            area: { $arrayElemAt: ['$area', 0] },
            cities: { $arrayElemAt: ['$cities', 0] },
            dob: { $arrayElemAt: ['$dob', 0] },
            age: { $arrayElemAt: ['$age', 0] },
            email: { $arrayElemAt: ['$email', 0] },
            gender: { $arrayElemAt: ['$gender', 0] },
            bio: { $arrayElemAt: ['$bio', 0] },
            idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
            mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
            roles: { $arrayElemAt: ['$roles', 0] },

            event: { $arrayElemAt: ['$event', 0] },
            isComplete: { $arrayElemAt: ['$isComplete', 0] },
            status: { $arrayElemAt: ['$status', 0] },
            langIso: { $arrayElemAt: ['$langIso', 0] },
          }
        },

        { $sort: { createdAt: -1 }, },
        { $skip: page },
        { $limit: 15 },
      ]);
      return query;
    }
    else if (fullName === undefined && gender === undefined && roles !== undefined && age === undefined) {
      const query = await this.getuserprofilesModel.aggregate([

        {
          $addFields: {
            userAuth_id: '$userAuth.$id',
            countries_id: '$countries.$id',
            cities_id: '$cities.$id',
            areas_id: '$states.$id',
            languages_id: '$languages.$id',
            insight_id: '$insight.$id',
            profilePict_id: '$profilePict.$id',
            interest_id: '$userInterests.$id',
            concat: '/profilepict',
            email: '$email',
            age: {
              $round: [{
                $divide: [{
                  $subtract: [new Date(), {
                    $toDate: '$dob'
                  }]
                }, (365 * 24 * 60 * 60 * 1000)]
              }]
            }
          },
        },

        {
          $lookup: {
            from: 'interests_repo2',
            localField: 'interest_id',
            foreignField: '_id',
            as: 'interes_data',
          },
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilePict_id',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'countries2',
            localField: 'countries_id',
            foreignField: '_id',
            as: 'countries_data',
          },
        },
        {
          $lookup: {
            from: 'languages2',
            localField: 'languages_id',
            foreignField: '_id',
            as: 'languages_data',
          },
        },
        {
          $lookup: {
            from: 'cities2',
            localField: 'cities_id',
            foreignField: '_id',
            as: 'cities_data',
          },
        },
        {
          $lookup: {
            from: 'areas2',
            localField: 'areas_id',
            foreignField: '_id',
            as: 'areas_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
            localField: 'insight_id',
            foreignField: '_id',
            as: 'insight_data',
          },
        },
        {
          $lookup: {
            from: 'userauths',
            localField: 'userAuth_id',
            foreignField: '_id',
            as: 'userAuth_data',
          },
        },

        {
          $project: {
            activity: '$activity',
            createdAt: '$createdAt',
            auth: { $arrayElemAt: ['$userAuth_data', 0] },
            citi: { $arrayElemAt: ['$cities_data', 0] },
            countri: { $arrayElemAt: ['$countries_data', 0] },
            language: { $arrayElemAt: ['$languages_data', 0] },
            areas: { $arrayElemAt: ['$areas_data', 0] },
            insights: { $arrayElemAt: ['$insight_data', 0] },
            profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
            fullName: '$fullName',
            username: '$auth.userName',
            area: '$areas.stateName',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            countries: '$countri.country',
            cities: '$citi.cityName',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',
            dob: '$dob',
            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            },
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: '$profilpict.fsTargetUri',
              medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

            },
            interest: '$interes_data',
          }
        },
        {
          $addFields: {

            concat: '/profilepict',
            pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          },
        },
        {
          $project: {

            createdAt: '$createdAt',
            interest: '$interest',
            username: '$auth.username',
            fullName: '$fullName',
            countries: '$countri.country',
            area: '$areas.stateName',
            cities: '$citi.cityName',
            dob: '$dob',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',

            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            }, avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

            },
          },
        },

        {
          $lookup: {
            from: "activityevents",
            localField: "email",
            foreignField: "payload.email",
            as: "activity_data"
          }
        },
        {
          "$unwind": {
            "path": "$activity_data",
            "preserveNullAndEmptyArrays": false
          }
        },
        { "$match": { "activity_data.event": "AWAKE" } },
        { "$sort": { "activity_data.createdAt": -1 }, },

        {
          "$group": {
            "_id": "$_id",
            "name": { "$first": "$fullName" },
            "tables": { "$push": "$activity_data" },
            "createdAt": { "$push": "$createdAt" },
            "fullName": { "$push": "$fullName" },
            "interest": { "$push": "$interest" },
            "username": { "$push": "$username" },
            "avatar": { "$push": "$avatar" },
            "insight": { "$push": "$insight" },
            "countries": { "$push": "$countries" },
            "area": { "$push": "$area" },
            "cities": { "$push": "$cities" },
            "dob": { "$push": "$dob" },
            "age": { "$push": "$age" },
            "email": { "$push": "$email" },
            "gender": { "$push": "$gender" },
            "bio": { "$push": "$bio" },
            "idProofNumber": { "$push": "$idProofNumber" },
            "mobileNumber": { "$push": "$mobileNumber" },
            "roles": { "$push": "$roles" },

            "event": { "$push": "$event" },
            "isComplete": { "$push": "$isComplete" },
            "status": { "$push": "$status" },
            "langIso": { "$push": "$langIso" },
          }
        },
        {
          $project: {
            createdAt: { $arrayElemAt: ['$createdAt', 0] },
            activity: { $arrayElemAt: ['$tables', 0] },
            fullName: { $arrayElemAt: ['$fullName', 0] },
            interest: { $arrayElemAt: ['$interest', 0] },
            username: { $arrayElemAt: ['$username', 0] },
            avatar: { $arrayElemAt: ['$avatar', 0] },
            insight: { $arrayElemAt: ['$insight', 0] },
            countries: { $arrayElemAt: ['$countries', 0] },
            area: { $arrayElemAt: ['$area', 0] },
            cities: { $arrayElemAt: ['$cities', 0] },
            dob: { $arrayElemAt: ['$dob', 0] },
            age: { $arrayElemAt: ['$age', 0] },
            email: { $arrayElemAt: ['$email', 0] },
            gender: { $arrayElemAt: ['$gender', 0] },
            bio: { $arrayElemAt: ['$bio', 0] },
            idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
            mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
            roles: { $arrayElemAt: ['$roles', 0] },

            event: { $arrayElemAt: ['$event', 0] },
            isComplete: { $arrayElemAt: ['$isComplete', 0] },
            status: { $arrayElemAt: ['$status', 0] },
            langIso: { $arrayElemAt: ['$langIso', 0] },
          }
        },
        { $match: { roles: roles } }, { $sort: { createdAt: -1 }, }, { $skip: page },
        { $limit: 15 },
      ]);
      return query;
    }
    else if (fullName === undefined && gender === undefined && roles === undefined && age !== undefined) {
      if (age == "<15") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          { $match: { age: { $gt: 0, $lt: 15 } } },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },

          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "15-25") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          { $match: { age: { $gt: 14, $lt: 26 } } },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },

          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "26-35") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          { $match: { age: { $gt: 25, $lt: 36 } } },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },

          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      } else if (age == "36-50") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          { $match: { age: { $gt: 35, $lt: 51 } } },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == ">50") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          { $match: { age: { $gt: 50, } } },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },

          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
    }
    else if (fullName !== undefined && gender !== undefined && roles === undefined && age === undefined) {
      const query = await this.getuserprofilesModel.aggregate([
        { $match: { fullName: { $regex: fullName }, gender: gender } },
        {
          $addFields: {
            userAuth_id: '$userAuth.$id',
            countries_id: '$countries.$id',
            cities_id: '$cities.$id',
            areas_id: '$states.$id',
            languages_id: '$languages.$id',
            insight_id: '$insight.$id',
            profilePict_id: '$profilePict.$id',
            interest_id: '$userInterests.$id',
            concat: '/profilepict',
            email: '$email',
            age: {
              $round: [{
                $divide: [{
                  $subtract: [new Date(), {
                    $toDate: '$dob'
                  }]
                }, (365 * 24 * 60 * 60 * 1000)]
              }]
            }
          },
        },

        {
          $lookup: {
            from: 'interests_repo2',
            localField: 'interest_id',
            foreignField: '_id',
            as: 'interes_data',
          },
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilePict_id',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'countries2',
            localField: 'countries_id',
            foreignField: '_id',
            as: 'countries_data',
          },
        },
        {
          $lookup: {
            from: 'languages2',
            localField: 'languages_id',
            foreignField: '_id',
            as: 'languages_data',
          },
        },
        {
          $lookup: {
            from: 'cities2',
            localField: 'cities_id',
            foreignField: '_id',
            as: 'cities_data',
          },
        },
        {
          $lookup: {
            from: 'areas2',
            localField: 'areas_id',
            foreignField: '_id',
            as: 'areas_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
            localField: 'insight_id',
            foreignField: '_id',
            as: 'insight_data',
          },
        },
        {
          $lookup: {
            from: 'userauths',
            localField: 'userAuth_id',
            foreignField: '_id',
            as: 'userAuth_data',
          },
        },

        {
          $project: {
            activity: '$activity',
            createdAt: '$createdAt',
            auth: { $arrayElemAt: ['$userAuth_data', 0] },
            citi: { $arrayElemAt: ['$cities_data', 0] },
            countri: { $arrayElemAt: ['$countries_data', 0] },
            language: { $arrayElemAt: ['$languages_data', 0] },
            areas: { $arrayElemAt: ['$areas_data', 0] },
            insights: { $arrayElemAt: ['$insight_data', 0] },
            profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
            fullName: '$fullName',
            username: '$auth.userName',
            area: '$areas.stateName',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            countries: '$countri.country',
            cities: '$citi.cityName',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',
            dob: '$dob',
            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            },
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: '$profilpict.fsTargetUri',
              medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

            },
            interest: '$interes_data',
          }
        },
        {
          $addFields: {

            concat: '/profilepict',
            pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          },
        },
        {
          $project: {

            createdAt: '$createdAt',
            interest: '$interest',
            username: '$auth.username',
            fullName: '$fullName',
            countries: '$countri.country',
            area: '$areas.stateName',
            cities: '$citi.cityName',
            dob: '$dob',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',

            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            },
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

            },
          },
        },

        {
          $lookup: {
            from: "activityevents",
            localField: "email",
            foreignField: "payload.email",
            as: "activity_data"
          }
        },
        {
          "$unwind": {
            "path": "$activity_data",
            "preserveNullAndEmptyArrays": false
          }
        },
        { "$match": { "activity_data.event": "AWAKE" } },
        { "$sort": { "activity_data.createdAt": -1 }, },

        {
          "$group": {
            "_id": "$_id",
            "name": { "$first": "$fullName" },
            "tables": { "$push": "$activity_data" },
            "createdAt": { "$push": "$createdAt" },
            "fullName": { "$push": "$fullName" },
            "interest": { "$push": "$interest" },
            "username": { "$push": "$username" },
            "avatar": { "$push": "$avatar" },
            "insight": { "$push": "$insight" },
            "countries": { "$push": "$countries" },
            "area": { "$push": "$area" },
            "cities": { "$push": "$cities" },
            "dob": { "$push": "$dob" },
            "age": { "$push": "$age" },
            "email": { "$push": "$email" },
            "gender": { "$push": "$gender" },
            "bio": { "$push": "$bio" },
            "idProofNumber": { "$push": "$idProofNumber" },
            "mobileNumber": { "$push": "$mobileNumber" },
            "roles": { "$push": "$roles" },

            "event": { "$push": "$event" },
            "isComplete": { "$push": "$isComplete" },
            "status": { "$push": "$status" },
            "langIso": { "$push": "$langIso" },
          }
        },
        {
          $project: {
            createdAt: { $arrayElemAt: ['$createdAt', 0] },
            activity: { $arrayElemAt: ['$tables', 0] },
            fullName: { $arrayElemAt: ['$fullName', 0] },
            interest: { $arrayElemAt: ['$interest', 0] },
            username: { $arrayElemAt: ['$username', 0] },
            avatar: { $arrayElemAt: ['$avatar', 0] },
            insight: { $arrayElemAt: ['$insight', 0] },
            countries: { $arrayElemAt: ['$countries', 0] },
            area: { $arrayElemAt: ['$area', 0] },
            cities: { $arrayElemAt: ['$cities', 0] },
            dob: { $arrayElemAt: ['$dob', 0] },
            age: { $arrayElemAt: ['$age', 0] },
            email: { $arrayElemAt: ['$email', 0] },
            gender: { $arrayElemAt: ['$gender', 0] },
            bio: { $arrayElemAt: ['$bio', 0] },
            idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
            mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
            roles: { $arrayElemAt: ['$roles', 0] },

            event: { $arrayElemAt: ['$event', 0] },
            isComplete: { $arrayElemAt: ['$isComplete', 0] },
            status: { $arrayElemAt: ['$status', 0] },
            langIso: { $arrayElemAt: ['$langIso', 0] },
          }
        },
        { $sort: { createdAt: -1 }, }, { $skip: page },
        { $limit: 15 },
      ]);
      return query;
    }
    else if (fullName !== undefined && gender === undefined && roles !== undefined && age === undefined) {
      const query = await this.getuserprofilesModel.aggregate([

        {
          $addFields: {
            userAuth_id: '$userAuth.$id',
            countries_id: '$countries.$id',
            cities_id: '$cities.$id',
            areas_id: '$states.$id',
            languages_id: '$languages.$id',
            insight_id: '$insight.$id',
            profilePict_id: '$profilePict.$id',
            interest_id: '$userInterests.$id',
            concat: '/profilepict',
            email: '$email',
            age: {
              $round: [{
                $divide: [{
                  $subtract: [new Date(), {
                    $toDate: '$dob'
                  }]
                }, (365 * 24 * 60 * 60 * 1000)]
              }]
            }
          },
        },

        {
          $lookup: {
            from: 'interests_repo2',
            localField: 'interest_id',
            foreignField: '_id',
            as: 'interes_data',
          },
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilePict_id',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'countries2',
            localField: 'countries_id',
            foreignField: '_id',
            as: 'countries_data',
          },
        },
        {
          $lookup: {
            from: 'languages2',
            localField: 'languages_id',
            foreignField: '_id',
            as: 'languages_data',
          },
        },
        {
          $lookup: {
            from: 'cities2',
            localField: 'cities_id',
            foreignField: '_id',
            as: 'cities_data',
          },
        },
        {
          $lookup: {
            from: 'areas2',
            localField: 'areas_id',
            foreignField: '_id',
            as: 'areas_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
            localField: 'insight_id',
            foreignField: '_id',
            as: 'insight_data',
          },
        },
        {
          $lookup: {
            from: 'userauths',
            localField: 'userAuth_id',
            foreignField: '_id',
            as: 'userAuth_data',
          },
        },

        {
          $project: {
            activity: '$activity',
            createdAt: '$createdAt',
            auth: { $arrayElemAt: ['$userAuth_data', 0] },
            citi: { $arrayElemAt: ['$cities_data', 0] },
            countri: { $arrayElemAt: ['$countries_data', 0] },
            language: { $arrayElemAt: ['$languages_data', 0] },
            areas: { $arrayElemAt: ['$areas_data', 0] },
            insights: { $arrayElemAt: ['$insight_data', 0] },
            profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
            fullName: '$fullName',
            username: '$auth.userName',
            area: '$areas.stateName',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            countries: '$countri.country',
            cities: '$citi.cityName',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',
            dob: '$dob',
            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            },
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: '$profilpict.fsTargetUri',
              medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

            },
            interest: '$interes_data',
          }
        },
        {
          $addFields: {

            concat: '/profilepict',
            pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          },
        },
        {
          $project: {

            createdAt: '$createdAt',
            interest: '$interest',
            username: '$auth.username',
            fullName: '$fullName',
            countries: '$countri.country',
            area: '$areas.stateName',
            cities: '$citi.cityName',
            dob: '$dob',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',

            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            }, avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

            },
          },
        },

        {
          $lookup: {
            from: "activityevents",
            localField: "email",
            foreignField: "payload.email",
            as: "activity_data"
          }
        },
        {
          "$unwind": {
            "path": "$activity_data",
            "preserveNullAndEmptyArrays": false
          }
        },
        { "$match": { "activity_data.event": "AWAKE" } },
        { "$sort": { "activity_data.createdAt": -1 }, },

        {
          "$group": {
            "_id": "$_id",
            "name": { "$first": "$fullName" },
            "tables": { "$push": "$activity_data" },
            "createdAt": { "$push": "$createdAt" },
            "fullName": { "$push": "$fullName" },
            "interest": { "$push": "$interest" },
            "username": { "$push": "$username" },
            "avatar": { "$push": "$avatar" },
            "insight": { "$push": "$insight" },
            "countries": { "$push": "$countries" },
            "area": { "$push": "$area" },
            "cities": { "$push": "$cities" },
            "dob": { "$push": "$dob" },
            "age": { "$push": "$age" },
            "email": { "$push": "$email" },
            "gender": { "$push": "$gender" },
            "bio": { "$push": "$bio" },
            "idProofNumber": { "$push": "$idProofNumber" },
            "mobileNumber": { "$push": "$mobileNumber" },
            "roles": { "$push": "$roles" },

            "event": { "$push": "$event" },
            "isComplete": { "$push": "$isComplete" },
            "status": { "$push": "$status" },
            "langIso": { "$push": "$langIso" },
          }
        },
        {
          $project: {
            createdAt: { $arrayElemAt: ['$createdAt', 0] },
            activity: { $arrayElemAt: ['$tables', 0] },
            fullName: { $arrayElemAt: ['$fullName', 0] },
            interest: { $arrayElemAt: ['$interest', 0] },
            username: { $arrayElemAt: ['$username', 0] },
            avatar: { $arrayElemAt: ['$avatar', 0] },
            insight: { $arrayElemAt: ['$insight', 0] },
            countries: { $arrayElemAt: ['$countries', 0] },
            area: { $arrayElemAt: ['$area', 0] },
            cities: { $arrayElemAt: ['$cities', 0] },
            dob: { $arrayElemAt: ['$dob', 0] },
            age: { $arrayElemAt: ['$age', 0] },
            email: { $arrayElemAt: ['$email', 0] },
            gender: { $arrayElemAt: ['$gender', 0] },
            bio: { $arrayElemAt: ['$bio', 0] },
            idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
            mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
            roles: { $arrayElemAt: ['$roles', 0] },

            event: { $arrayElemAt: ['$event', 0] },
            isComplete: { $arrayElemAt: ['$isComplete', 0] },
            status: { $arrayElemAt: ['$status', 0] },
            langIso: { $arrayElemAt: ['$langIso', 0] },
          }
        },
        { $match: { fullName: { $regex: fullName }, roles: roles } }, { $sort: { createdAt: -1 }, }, { $skip: page },
        { $limit: 15 },
      ]);
      return query;
    }
    else if (fullName !== undefined && gender !== undefined && roles !== undefined && age === undefined) {
      const query = await this.getuserprofilesModel.aggregate([

        {
          $addFields: {
            userAuth_id: '$userAuth.$id',
            countries_id: '$countries.$id',
            cities_id: '$cities.$id',
            areas_id: '$states.$id',
            languages_id: '$languages.$id',
            insight_id: '$insight.$id',
            profilePict_id: '$profilePict.$id',
            interest_id: '$userInterests.$id',
            concat: '/profilepict',
            email: '$email',
            age: {
              $round: [{
                $divide: [{
                  $subtract: [new Date(), {
                    $toDate: '$dob'
                  }]
                }, (365 * 24 * 60 * 60 * 1000)]
              }]
            }
          },
        },

        {
          $lookup: {
            from: 'interests_repo2',
            localField: 'interest_id',
            foreignField: '_id',
            as: 'interes_data',
          },
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilePict_id',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'countries2',
            localField: 'countries_id',
            foreignField: '_id',
            as: 'countries_data',
          },
        },
        {
          $lookup: {
            from: 'languages2',
            localField: 'languages_id',
            foreignField: '_id',
            as: 'languages_data',
          },
        },
        {
          $lookup: {
            from: 'cities2',
            localField: 'cities_id',
            foreignField: '_id',
            as: 'cities_data',
          },
        },
        {
          $lookup: {
            from: 'areas2',
            localField: 'areas_id',
            foreignField: '_id',
            as: 'areas_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
            localField: 'insight_id',
            foreignField: '_id',
            as: 'insight_data',
          },
        },
        {
          $lookup: {
            from: 'userauths',
            localField: 'userAuth_id',
            foreignField: '_id',
            as: 'userAuth_data',
          },
        },

        {
          $project: {
            activity: '$activity',
            createdAt: '$createdAt',
            auth: { $arrayElemAt: ['$userAuth_data', 0] },
            citi: { $arrayElemAt: ['$cities_data', 0] },
            countri: { $arrayElemAt: ['$countries_data', 0] },
            language: { $arrayElemAt: ['$languages_data', 0] },
            areas: { $arrayElemAt: ['$areas_data', 0] },
            insights: { $arrayElemAt: ['$insight_data', 0] },
            profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
            fullName: '$fullName',
            username: '$auth.userName',
            area: '$areas.stateName',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            countries: '$countri.country',
            cities: '$citi.cityName',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',
            dob: '$dob',
            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            },
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: '$profilpict.fsTargetUri',
              medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

            },
            interest: '$interes_data',
          }
        },
        {
          $addFields: {

            concat: '/profilepict',
            pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          },
        },
        {
          $project: {

            createdAt: '$createdAt',
            interest: '$interest',
            username: '$auth.username',
            fullName: '$fullName',
            countries: '$countri.country',
            area: '$areas.stateName',
            cities: '$citi.cityName',
            dob: '$dob',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',

            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            }, avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

            },
          },
        },

        {
          $lookup: {
            from: "activityevents",
            localField: "email",
            foreignField: "payload.email",
            as: "activity_data"
          }
        },
        {
          "$unwind": {
            "path": "$activity_data",
            "preserveNullAndEmptyArrays": false
          }
        },
        { "$match": { "activity_data.event": "AWAKE" } },
        { "$sort": { "activity_data.createdAt": -1 }, },

        {
          "$group": {
            "_id": "$_id",
            "name": { "$first": "$fullName" },
            "tables": { "$push": "$activity_data" },
            "createdAt": { "$push": "$createdAt" },
            "fullName": { "$push": "$fullName" },
            "interest": { "$push": "$interest" },
            "username": { "$push": "$username" },
            "avatar": { "$push": "$avatar" },
            "insight": { "$push": "$insight" },
            "countries": { "$push": "$countries" },
            "area": { "$push": "$area" },
            "cities": { "$push": "$cities" },
            "dob": { "$push": "$dob" },
            "age": { "$push": "$age" },
            "email": { "$push": "$email" },
            "gender": { "$push": "$gender" },
            "bio": { "$push": "$bio" },
            "idProofNumber": { "$push": "$idProofNumber" },
            "mobileNumber": { "$push": "$mobileNumber" },
            "roles": { "$push": "$roles" },

            "event": { "$push": "$event" },
            "isComplete": { "$push": "$isComplete" },
            "status": { "$push": "$status" },
            "langIso": { "$push": "$langIso" },
          }
        },
        {
          $project: {
            createdAt: { $arrayElemAt: ['$createdAt', 0] },
            activity: { $arrayElemAt: ['$tables', 0] },
            fullName: { $arrayElemAt: ['$fullName', 0] },
            interest: { $arrayElemAt: ['$interest', 0] },
            username: { $arrayElemAt: ['$username', 0] },
            avatar: { $arrayElemAt: ['$avatar', 0] },
            insight: { $arrayElemAt: ['$insight', 0] },
            countries: { $arrayElemAt: ['$countries', 0] },
            area: { $arrayElemAt: ['$area', 0] },
            cities: { $arrayElemAt: ['$cities', 0] },
            dob: { $arrayElemAt: ['$dob', 0] },
            age: { $arrayElemAt: ['$age', 0] },
            email: { $arrayElemAt: ['$email', 0] },
            gender: { $arrayElemAt: ['$gender', 0] },
            bio: { $arrayElemAt: ['$bio', 0] },
            idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
            mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
            roles: { $arrayElemAt: ['$roles', 0] },

            event: { $arrayElemAt: ['$event', 0] },
            isComplete: { $arrayElemAt: ['$isComplete', 0] },
            status: { $arrayElemAt: ['$status', 0] },
            langIso: { $arrayElemAt: ['$langIso', 0] },
          }
        },
        { $match: { fullName: { $regex: fullName }, gender: gender, roles: roles } }, { $sort: { createdAt: -1 }, }, { $skip: page },
        { $limit: 15 },
      ]);
      return query;
    }
    else if (fullName !== undefined && gender === undefined && roles === undefined && age !== undefined) {
      if (age == "<15") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },

          { $match: { fullName: { $regex: fullName }, age: { $gt: 0, $lt: 15 } } },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "15-25") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          { $match: { fullName: { $regex: fullName }, age: { $gt: 14, $lt: 26 } } },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "26-35") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          { $match: { fullName: { $regex: fullName }, age: { $gt: 25, $lt: 36 } } },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "36-50") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          { $match: { fullName: { $regex: fullName }, age: { $gt: 35, $lt: 51 } } },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == ">50") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          { $match: { fullName: { $regex: fullName }, age: { $gt: 50 } } },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
    }
    else if (fullName === undefined && gender !== undefined && roles !== undefined && age === undefined) {
      const query = await this.getuserprofilesModel.aggregate([

        {
          $addFields: {
            userAuth_id: '$userAuth.$id',
            countries_id: '$countries.$id',
            cities_id: '$cities.$id',
            areas_id: '$states.$id',
            languages_id: '$languages.$id',
            insight_id: '$insight.$id',
            profilePict_id: '$profilePict.$id',
            interest_id: '$userInterests.$id',
            concat: '/profilepict',
            email: '$email',
            age: {
              $round: [{
                $divide: [{
                  $subtract: [new Date(), {
                    $toDate: '$dob'
                  }]
                }, (365 * 24 * 60 * 60 * 1000)]
              }]
            }
          },
        },
        {
          $lookup: {
            from: 'interests_repo2',
            localField: 'interest_id',
            foreignField: '_id',
            as: 'interes_data',
          },
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilePict_id',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'countries2',
            localField: 'countries_id',
            foreignField: '_id',
            as: 'countries_data',
          },
        },
        {
          $lookup: {
            from: 'languages2',
            localField: 'languages_id',
            foreignField: '_id',
            as: 'languages_data',
          },
        },
        {
          $lookup: {
            from: 'cities2',
            localField: 'cities_id',
            foreignField: '_id',
            as: 'cities_data',
          },
        },
        {
          $lookup: {
            from: 'areas2',
            localField: 'areas_id',
            foreignField: '_id',
            as: 'areas_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
            localField: 'insight_id',
            foreignField: '_id',
            as: 'insight_data',
          },
        },
        {
          $lookup: {
            from: 'userauths',
            localField: 'userAuth_id',
            foreignField: '_id',
            as: 'userAuth_data',
          },
        },

        {
          $project: {
            activity: '$activity',
            createdAt: '$createdAt',
            auth: { $arrayElemAt: ['$userAuth_data', 0] },
            citi: { $arrayElemAt: ['$cities_data', 0] },
            countri: { $arrayElemAt: ['$countries_data', 0] },
            language: { $arrayElemAt: ['$languages_data', 0] },
            areas: { $arrayElemAt: ['$areas_data', 0] },
            insights: { $arrayElemAt: ['$insight_data', 0] },
            profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
            fullName: '$fullName',
            username: '$auth.userName',
            area: '$areas.stateName',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            countries: '$countri.country',
            cities: '$citi.cityName',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',
            dob: '$dob',
            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            },
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: '$profilpict.fsTargetUri',
              medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

            },
            interest: '$interes_data',
          }
        },
        {
          $addFields: {

            concat: '/profilepict',
            pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          },
        },
        {
          $project: {

            createdAt: '$createdAt',
            interest: '$interest',
            username: '$auth.username',
            fullName: '$fullName',
            countries: '$countri.country',
            area: '$areas.stateName',
            cities: '$citi.cityName',
            dob: '$dob',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',

            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            }, avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

            },
          },
        },

        {
          $lookup: {
            from: "activityevents",
            localField: "email",
            foreignField: "payload.email",
            as: "activity_data"
          }
        },
        {
          "$unwind": {
            "path": "$activity_data",
            "preserveNullAndEmptyArrays": false
          }
        },
        { "$match": { "activity_data.event": "AWAKE" } },
        { "$sort": { "activity_data.createdAt": -1 }, },

        {
          "$group": {
            "_id": "$_id",
            "name": { "$first": "$fullName" },
            "tables": { "$push": "$activity_data" },
            "createdAt": { "$push": "$createdAt" },
            "fullName": { "$push": "$fullName" },
            "interest": { "$push": "$interest" },
            "username": { "$push": "$username" },
            "avatar": { "$push": "$avatar" },
            "insight": { "$push": "$insight" },
            "countries": { "$push": "$countries" },
            "area": { "$push": "$area" },
            "cities": { "$push": "$cities" },
            "dob": { "$push": "$dob" },
            "age": { "$push": "$age" },
            "email": { "$push": "$email" },
            "gender": { "$push": "$gender" },
            "bio": { "$push": "$bio" },
            "idProofNumber": { "$push": "$idProofNumber" },
            "mobileNumber": { "$push": "$mobileNumber" },
            "roles": { "$push": "$roles" },

            "event": { "$push": "$event" },
            "isComplete": { "$push": "$isComplete" },
            "status": { "$push": "$status" },
            "langIso": { "$push": "$langIso" },
          }
        },
        {
          $project: {
            createdAt: { $arrayElemAt: ['$createdAt', 0] },
            activity: { $arrayElemAt: ['$tables', 0] },
            fullName: { $arrayElemAt: ['$fullName', 0] },
            interest: { $arrayElemAt: ['$interest', 0] },
            username: { $arrayElemAt: ['$username', 0] },
            avatar: { $arrayElemAt: ['$avatar', 0] },
            insight: { $arrayElemAt: ['$insight', 0] },
            countries: { $arrayElemAt: ['$countries', 0] },
            area: { $arrayElemAt: ['$area', 0] },
            cities: { $arrayElemAt: ['$cities', 0] },
            dob: { $arrayElemAt: ['$dob', 0] },
            age: { $arrayElemAt: ['$age', 0] },
            email: { $arrayElemAt: ['$email', 0] },
            gender: { $arrayElemAt: ['$gender', 0] },
            bio: { $arrayElemAt: ['$bio', 0] },
            idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
            mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
            roles: { $arrayElemAt: ['$roles', 0] },

            event: { $arrayElemAt: ['$event', 0] },
            isComplete: { $arrayElemAt: ['$isComplete', 0] },
            status: { $arrayElemAt: ['$status', 0] },
            langIso: { $arrayElemAt: ['$langIso', 0] },
          }
        },
        { $match: { gender: gender, roles: roles } }, { $sort: { createdAt: -1 }, }, { $skip: page },
        { $limit: 15 },
      ]);
      return query;
    }
    else if (fullName === undefined && gender !== undefined && roles === undefined && age !== undefined) {
      if (age == "<15") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },

          { $match: { gender: gender, age: { $gt: 0, $lt: 15 } } },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "15-25") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          { $match: { gender: gender, age: { $gt: 14, $lt: 26 } } },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "26-35") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          { $match: { gender: gender, age: { $gt: 25, $lt: 36 } } },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "36-50") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          { $match: { gender: gender, age: { $gt: 35, $lt: 51 } } },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == ">50") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          { $match: { gender: gender, age: { $gt: 50 } } },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
    }
    else if (fullName === undefined && gender === undefined && roles !== undefined && age !== undefined) {
      if (age == "<15") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },

          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { roles: roles, age: { $gt: 0, $lt: 15 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "15-25") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { roles: roles, age: { $gt: 14, $lt: 26 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "26-35") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { roles: roles, age: { $gt: 25, $lt: 36 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "36-50") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { roles: roles, age: { $gt: 35, $lt: 51 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == ">50") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { roles: roles, age: { $gt: 50 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
    }
    else if (fullName === undefined && gender !== undefined && roles !== undefined && age !== undefined) {
      if (age == "<15") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },

          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { gender: gender, roles: roles, age: { $gt: 0, $lt: 15 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "15-25") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { gender: gender, roles: roles, age: { $gt: 14, $lt: 26 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "26-35") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { gender: gender, roles: roles, age: { $gt: 25, $lt: 36 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "36-50") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { gender: gender, roles: roles, age: { $gt: 35, $lt: 51 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == ">50") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { gender: gender, roles: roles, age: { $gt: 50 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
    }
    else if (fullName !== undefined && gender !== undefined && roles !== undefined && age !== undefined) {
      if (age == "<15") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { fullName: { $regex: fullName }, gender: gender, roles: roles, age: { $gt: 0, $lt: 15 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "15-25") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },

          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { fullName: { $regex: fullName }, gender: gender, roles: roles, age: { $gt: 14, $lt: 26 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "26-35") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },

          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { fullName: { $regex: fullName }, gender: gender, roles: roles, age: { $gt: 25, $lt: 36 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "36-50") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { fullName: { $regex: fullName }, gender: gender, roles: roles, age: { $gt: 35, $lt: 51 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == ">50") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { fullName: { $regex: fullName }, gender: gender, roles: roles, age: { $gt: 50 } } },
          { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
    }
    else if (fullName !== undefined && gender !== undefined && roles === undefined && age !== undefined) {
      if (age == "<15") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { fullName: { $regex: fullName }, gender: gender, age: { $gt: 0, $lt: 15 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "15-25") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },

          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { fullName: { $regex: fullName }, gender: gender, age: { $gt: 14, $lt: 26 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "26-35") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },

          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { fullName: { $regex: fullName }, gender: gender, age: { $gt: 25, $lt: 36 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == "36-50") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },

          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { fullName: { $regex: fullName }, gender: gender, age: { $gt: 35, $lt: 51 } } }, { $sort: { createdAt: -1 }, }, { $skip: page },
          { $limit: 15 },
        ]);
        return query;
      }
      else if (age == ">50") {
        const query = await this.getuserprofilesModel.aggregate([

          {
            $addFields: {
              userAuth_id: '$userAuth.$id',
              countries_id: '$countries.$id',
              cities_id: '$cities.$id',
              areas_id: '$states.$id',
              languages_id: '$languages.$id',
              insight_id: '$insight.$id',
              profilePict_id: '$profilePict.$id',
              interest_id: '$userInterests.$id',
              concat: '/profilepict',
              email: '$email',
              age: {
                $round: [{
                  $divide: [{
                    $subtract: [new Date(), {
                      $toDate: '$dob'
                    }]
                  }, (365 * 24 * 60 * 60 * 1000)]
                }]
              }
            },
          },
          {
            $lookup: {
              from: 'interests_repo2',
              localField: 'interest_id',
              foreignField: '_id',
              as: 'interes_data',
            },
          },

          {
            $lookup: {
              from: 'mediaprofilepicts2',
              localField: 'profilePict_id',
              foreignField: '_id',
              as: 'profilePict_data',
            },
          },
          {
            $lookup: {
              from: 'countries2',
              localField: 'countries_id',
              foreignField: '_id',
              as: 'countries_data',
            },
          },
          {
            $lookup: {
              from: 'languages2',
              localField: 'languages_id',
              foreignField: '_id',
              as: 'languages_data',
            },
          },
          {
            $lookup: {
              from: 'cities2',
              localField: 'cities_id',
              foreignField: '_id',
              as: 'cities_data',
            },
          },
          {
            $lookup: {
              from: 'areas2',
              localField: 'areas_id',
              foreignField: '_id',
              as: 'areas_data',
            },
          },
          {
            $lookup: {
              from: 'insights2',
              localField: 'insight_id',
              foreignField: '_id',
              as: 'insight_data',
            },
          },
          {
            $lookup: {
              from: 'userauths',
              localField: 'userAuth_id',
              foreignField: '_id',
              as: 'userAuth_data',
            },
          },

          {
            $project: {
              activity: '$activity',
              createdAt: '$createdAt',
              auth: { $arrayElemAt: ['$userAuth_data', 0] },
              citi: { $arrayElemAt: ['$cities_data', 0] },
              countri: { $arrayElemAt: ['$countries_data', 0] },
              language: { $arrayElemAt: ['$languages_data', 0] },
              areas: { $arrayElemAt: ['$areas_data', 0] },
              insights: { $arrayElemAt: ['$insight_data', 0] },
              profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
              fullName: '$fullName',
              username: '$auth.userName',
              area: '$areas.stateName',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              countries: '$countri.country',
              cities: '$citi.cityName',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',
              dob: '$dob',
              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              },
              avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: '$profilpict.fsTargetUri',
                medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

              },
              interest: '$interes_data',
            }
          },
          {
            $addFields: {

              concat: '/profilepict',
              pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
          },
          {
            $project: {

              createdAt: '$createdAt',
              interest: '$interest',
              username: '$auth.username',
              fullName: '$fullName',
              countries: '$countri.country',
              area: '$areas.stateName',
              cities: '$citi.cityName',
              dob: '$dob',
              age: { $ifNull: ["$age", 0] },
              email: '$email',
              gender: '$gender',
              bio: '$bio',
              idProofNumber: '$idProofNumber',
              mobileNumber: '$mobileNumber',
              roles: '$auth.roles',

              event: '$event',
              isComplete: '$isComplete',
              status: '$status',
              langIso: '$language.langIso',
              insight: {
                shares: '$insights.shares',
                followers: '$insights.followers',
                comments: '$insights.comments',
                followings: '$insights.followings',
                reactions: '$insights.reactions',
                posts: '$insights.posts',
                views: '$insights.views',
                likes: '$insights.likes'
              }, avatar: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

              },
            },
          },


          {
            $lookup: {
              from: "activityevents",
              localField: "email",
              foreignField: "payload.email",
              as: "activity_data"
            }
          },
          {
            "$unwind": {
              "path": "$activity_data",
              "preserveNullAndEmptyArrays": false
            }
          },
          { "$match": { "activity_data.event": "AWAKE" } },
          { "$sort": { "activity_data.createdAt": -1 }, },

          {
            "$group": {
              "_id": "$_id",
              "name": { "$first": "$fullName" },
              "tables": { "$push": "$activity_data" },
              "createdAt": { "$push": "$createdAt" },
              "fullName": { "$push": "$fullName" },
              "interest": { "$push": "$interest" },
              "username": { "$push": "$username" },
              "avatar": { "$push": "$avatar" },
              "insight": { "$push": "$insight" },
              "countries": { "$push": "$countries" },
              "area": { "$push": "$area" },
              "cities": { "$push": "$cities" },
              "dob": { "$push": "$dob" },
              "age": { "$push": "$age" },
              "email": { "$push": "$email" },
              "gender": { "$push": "$gender" },
              "bio": { "$push": "$bio" },
              "idProofNumber": { "$push": "$idProofNumber" },
              "mobileNumber": { "$push": "$mobileNumber" },
              "roles": { "$push": "$roles" },

              "event": { "$push": "$event" },
              "isComplete": { "$push": "$isComplete" },
              "status": { "$push": "$status" },
              "langIso": { "$push": "$langIso" },
            }
          },
          {
            $project: {
              createdAt: { $arrayElemAt: ['$createdAt', 0] },
              activity: { $arrayElemAt: ['$tables', 0] },
              fullName: { $arrayElemAt: ['$fullName', 0] },
              interest: { $arrayElemAt: ['$interest', 0] },
              username: { $arrayElemAt: ['$username', 0] },
              avatar: { $arrayElemAt: ['$avatar', 0] },
              insight: { $arrayElemAt: ['$insight', 0] },
              countries: { $arrayElemAt: ['$countries', 0] },
              area: { $arrayElemAt: ['$area', 0] },
              cities: { $arrayElemAt: ['$cities', 0] },
              dob: { $arrayElemAt: ['$dob', 0] },
              age: { $arrayElemAt: ['$age', 0] },
              email: { $arrayElemAt: ['$email', 0] },
              gender: { $arrayElemAt: ['$gender', 0] },
              bio: { $arrayElemAt: ['$bio', 0] },
              idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
              mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
              roles: { $arrayElemAt: ['$roles', 0] },

              event: { $arrayElemAt: ['$event', 0] },
              isComplete: { $arrayElemAt: ['$isComplete', 0] },
              status: { $arrayElemAt: ['$status', 0] },
              langIso: { $arrayElemAt: ['$langIso', 0] },
            }
          },
          { $match: { fullName: { $regex: fullName }, gender: gender, age: { $gt: 50 } } }, { $skip: page },
          { $limit: 15 },
          { $sort: { createdAt: -1 }, },
        ]);
        return query;
      }
    }
    else {
      const query = await this.getuserprofilesModel.aggregate([
        {
          $addFields: {
            userAuth_id: '$userAuth.$id',
            countries_id: '$countries.$id',
            cities_id: '$cities.$id',
            areas_id: '$states.$id',
            languages_id: '$languages.$id',
            insight_id: '$insight.$id',
            profilePict_id: '$profilePict.$id',
            interest_id: '$userInterests.$id',
            concat: '/profilepict',
            email: '$email',
            age: {
              $round: [{
                $divide: [{
                  $subtract: [new Date(), {
                    $toDate: '$dob'
                  }]
                }, (365 * 24 * 60 * 60 * 1000)]
              }]
            }
          },
        },
        {
          $lookup: {
            from: 'interests_repo2',
            localField: 'interest_id',
            foreignField: '_id',
            as: 'interes_data',
          },
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilePict_id',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'countries2',
            localField: 'countries_id',
            foreignField: '_id',
            as: 'countries_data',
          },
        },
        {
          $lookup: {
            from: 'languages2',
            localField: 'languages_id',
            foreignField: '_id',
            as: 'languages_data',
          },
        },
        {
          $lookup: {
            from: 'cities2',
            localField: 'cities_id',
            foreignField: '_id',
            as: 'cities_data',
          },
        },
        {
          $lookup: {
            from: 'areas2',
            localField: 'areas_id',
            foreignField: '_id',
            as: 'areas_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
            localField: 'insight_id',
            foreignField: '_id',
            as: 'insight_data',
          },
        },
        {
          $lookup: {
            from: 'userauths',
            localField: 'userAuth_id',
            foreignField: '_id',
            as: 'userAuth_data',
          },
        },

        {
          $project: {
            activity: '$activity',
            createdAt: '$createdAt',
            auth: { $arrayElemAt: ['$userAuth_data', 0] },
            citi: { $arrayElemAt: ['$cities_data', 0] },
            countri: { $arrayElemAt: ['$countries_data', 0] },
            language: { $arrayElemAt: ['$languages_data', 0] },
            areas: { $arrayElemAt: ['$areas_data', 0] },
            insights: { $arrayElemAt: ['$insight_data', 0] },
            profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
            fullName: '$fullName',
            username: '$auth.userName',
            area: '$areas.stateName',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            countries: '$countri.country',
            cities: '$citi.cityName',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',
            dob: '$dob',
            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            },
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: '$profilpict.fsTargetUri',
              medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

            },
            interest: '$interes_data',
          }
        },
        {
          $addFields: {

            concat: '/profilepict',
            pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          },
        },
        {
          $project: {

            createdAt: '$createdAt',
            interest: '$interest',
            username: '$auth.username',
            fullName: '$fullName',
            countries: '$countri.country',
            area: '$areas.stateName',
            cities: '$citi.cityName',
            dob: '$dob',
            age: { $ifNull: ["$age", 0] },
            email: '$email',
            gender: '$gender',
            bio: '$bio',
            idProofNumber: '$idProofNumber',
            mobileNumber: '$mobileNumber',
            roles: '$auth.roles',

            event: '$event',
            isComplete: '$isComplete',
            status: '$status',
            langIso: '$language.langIso',
            insight: {
              shares: '$insights.shares',
              followers: '$insights.followers',
              comments: '$insights.comments',
              followings: '$insights.followings',
              reactions: '$insights.reactions',
              posts: '$insights.posts',
              views: '$insights.views',
              likes: '$insights.likes'
            }, avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

            },
          },
        },

        {
          $lookup: {
            from: "activityevents",
            localField: "email",
            foreignField: "payload.email",
            as: "activity_data"
          }
        },
        {
          "$unwind": {
            "path": "$activity_data",
            "preserveNullAndEmptyArrays": false
          }
        },
        { "$match": { "activity_data.event": "AWAKE" } },
        { "$sort": { "activity_data.createdAt": -1 }, },

        {
          "$group": {
            "_id": "$_id",
            "name": { "$first": "$fullName" },
            "tables": { "$push": "$activity_data" },
            "createdAt": { "$push": "$createdAt" },
            "fullName": { "$push": "$fullName" },
            "interest": { "$push": "$interest" },
            "username": { "$push": "$username" },
            "avatar": { "$push": "$avatar" },
            "insight": { "$push": "$insight" },
            "countries": { "$push": "$countries" },
            "area": { "$push": "$area" },
            "cities": { "$push": "$cities" },
            "dob": { "$push": "$dob" },
            "age": { "$push": "$age" },
            "email": { "$push": "$email" },
            "gender": { "$push": "$gender" },
            "bio": { "$push": "$bio" },
            "idProofNumber": { "$push": "$idProofNumber" },
            "mobileNumber": { "$push": "$mobileNumber" },
            "roles": { "$push": "$roles" },

            "event": { "$push": "$event" },
            "isComplete": { "$push": "$isComplete" },
            "status": { "$push": "$status" },
            "langIso": { "$push": "$langIso" },
          }
        },
        {
          $project: {
            createdAt: { $arrayElemAt: ['$createdAt', 0] },
            activity: { $arrayElemAt: ['$tables', 0] },
            fullName: { $arrayElemAt: ['$fullName', 0] },
            interest: { $arrayElemAt: ['$interest', 0] },
            username: { $arrayElemAt: ['$username', 0] },
            avatar: { $arrayElemAt: ['$avatar', 0] },
            insight: { $arrayElemAt: ['$insight', 0] },
            countries: { $arrayElemAt: ['$countries', 0] },
            area: { $arrayElemAt: ['$area', 0] },
            cities: { $arrayElemAt: ['$cities', 0] },
            dob: { $arrayElemAt: ['$dob', 0] },
            age: { $arrayElemAt: ['$age', 0] },
            email: { $arrayElemAt: ['$email', 0] },
            gender: { $arrayElemAt: ['$gender', 0] },
            bio: { $arrayElemAt: ['$bio', 0] },
            idProofNumber: { $arrayElemAt: ['$idProofNumber', 0] },
            mobileNumber: { $arrayElemAt: ['$mobileNumber', 0] },
            roles: { $arrayElemAt: ['$roles', 0] },

            event: { $arrayElemAt: ['$event', 0] },
            isComplete: { $arrayElemAt: ['$isComplete', 0] },
            status: { $arrayElemAt: ['$status', 0] },
            langIso: { $arrayElemAt: ['$langIso', 0] },
          }
        },
        { $sort: { createdAt: -1 }, }, { $skip: page },
        { $limit: 15 },
      ]);
      return query;
    }


  }

  async totalcount() {
    const query = await this.getuserprofilesModel.aggregate([{
      $group: {
        _id: null,
        countrow: {
          $sum: 1
        }
      }
    }, {
      $project: {
        _id: 0
      }
    }]);
    return query;
  }

  async delete(id: string) {
    const deletedCat = await this.getuserprofilesModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
