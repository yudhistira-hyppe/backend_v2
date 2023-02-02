import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateGetusercontentsDto } from './dto/create-getusercontents.dto';
import { Getusercontents, GetusercontentsDocument } from './schemas/getusercontents.schema';
import { PostsService } from '../../content/posts/posts.service';
import { MediavideosService } from '../../content/mediavideos/mediavideos.service';
import { MediapictsService } from '../../content/mediapicts/mediapicts.service';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
import { MediadiariesService } from '../../content/mediadiaries/mediadiaries.service';

import { InsightsService } from '../../content/insights/insights.service';
import { DisqusService } from '../../content/disqus/disqus.service';
import { DisquslogsService } from '../../content/disquslogs/disquslogs.service';
import { PostContentService } from '../../content/posts/postcontent.service';
//import { CountriesService } from '../../infra/countries/countries.service';
import { ContenteventsService } from '../../content/contentevents/contentevents.service';
@Injectable()
export class GetusercontentsService {

  constructor(
    @InjectModel(Getusercontents.name, 'SERVER_FULL')
    private readonly getusercontentsModel: Model<GetusercontentsDocument>,
    private readonly postsService: PostsService,
    private readonly mediavideosService: MediavideosService,
    private readonly mediapictsService: MediapictsService,
    private readonly mediaprofilepictsService: MediaprofilepictsService,
    private readonly mediadiariesService: MediadiariesService,
    private readonly insightsService: InsightsService,
    private readonly disqusService: DisqusService,
    private readonly disquslogsService: DisquslogsService,
    private readonly postContentService: PostContentService,
    private readonly contenteventsService: ContenteventsService,
    // private readonly countriesService: CountriesService,

  ) { }

  async getapsara(obj: object, n: number) {
    let idapsara = null;
    let apsara = null;
    let apsaradefine = null;
    let idapsaradefine = null;
    let pict = null;

    try {
      idapsara = obj[n].apsaraId;
    } catch (e) {
      idapsara = "";
    }
    try {
      apsara = obj[n].isApsara;
    } catch (e) {
      apsara = false;
    }

    if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
      apsaradefine = false;
    } else {
      apsaradefine = true;
    }

    if (idapsara === undefined || idapsara === "" || idapsara === null || idapsara === "other") {
      idapsaradefine = "";
    } else {
      idapsaradefine = idapsara;
    }
    var type = obj[n].postType;
    pict = [idapsara];

    if (idapsara === "") {

    } else {
      if (type === "pict") {

        try {
          obj[n].apsaraId = idapsaradefine;
          obj[n].apsara = apsaradefine;
          obj[n].media = await this.postContentService.getImageApsara(pict);
        } catch (e) {
          obj[n].media = {};
        }
      }
      else if (type === "vid") {
        try {
          obj[n].apsaraId = idapsaradefine;
          obj[n].apsara = apsaradefine;
          obj[n].media = await this.postContentService.getVideoApsara(pict);
        } catch (e) {
          obj[n].media = {};
        }

      }
      else if (type === "story") {
        try {
          obj[n].apsaraId = idapsaradefine;
          obj[n].apsara = apsaradefine;
          obj[n].media = await this.postContentService.getVideoApsara(pict);
        } catch (e) {
          obj[n].media = {};
        }
      }
      else if (type === "diary") {
        try {
          obj[n].apsaraId = idapsaradefine;
          obj[n].apsara = apsaradefine;
          obj[n].media = await this.postContentService.getVideoApsara(pict);
        } catch (e) {
          obj[n].media = {};

        }
      }
    }

    return obj;
  }

  async getapsaraDatabase(obj: object, n: number) {
    let idapsara = null;
    let apsara = null;
    let apsaradefine = null;
    let idapsaradefine = null;
    let pict = null;
    var mediaType = null;
    try {
      idapsara = obj[n].apsaraId;
    } catch (e) {
      idapsara = "";
    }
    try {
      apsara = obj[n].apsara;
    } catch (e) {
      apsara = false;
    }

    if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
      apsaradefine = false;
    } else {
      apsaradefine = true;
    }

    if (idapsara === undefined || idapsara === "" || idapsara === null || idapsara === "other") {
      idapsaradefine = "";
    } else {
      idapsaradefine = idapsara;
    }
    var type = obj[n].postType;
    var mediaType = obj[n].mediaType;
    pict = [idapsara];

    if (idapsara === "") {

    } else {
      if (type === "pict") {

        try {
          obj[n].apsaraId = idapsaradefine;
          obj[n].apsara = apsaradefine;
          obj[n].media = await this.postContentService.getImageApsara(pict);
        } catch (e) {
          obj[n].media = {};
        }
      }
      else if (type === "vid") {
        try {
          obj[n].apsaraId = idapsaradefine;
          obj[n].apsara = apsaradefine;
          obj[n].media = await this.postContentService.getVideoApsara(pict);
        } catch (e) {
          obj[n].media = {};
        }

      }
      else if (type === "story") {
        if (mediaType === "image") {

          try {
            obj[n].apsaraId = idapsaradefine;
            obj[n].apsara = apsaradefine;
            obj[n].media = await this.postContentService.getImageApsara(pict);
          } catch (e) {
            obj[n].media = {};
          }
        } else {
          try {
            obj[n].apsaraId = idapsaradefine;
            obj[n].apsara = apsaradefine;
            obj[n].media = await this.postContentService.getVideoApsara(pict);
          } catch (e) {
            obj[n].media = {};
          }
        }
      }
      else if (type === "diary") {
        try {
          obj[n].apsaraId = idapsaradefine;
          obj[n].apsara = apsaradefine;
          obj[n].media = await this.postContentService.getVideoApsara(pict);
        } catch (e) {
          obj[n].media = {};

        }
      }
    }

    return obj;
  }

  async getapsaraDatabaseAds(obj: object, n: number) {
    let idapsara = null;
    let apsara = null;
    let apsaradefine = null;
    let idapsaradefine = null;
    let pict = null;

    try {
      idapsara = obj[n].idApsara;
    } catch (e) {
      idapsara = "";
    }
    try {
      apsara = obj[n].apsara;
    } catch (e) {
      apsara = false;
    }

    if (idapsara === undefined || idapsara === "" || idapsara === null) {
      idapsaradefine = "";
      apsaradefine = false
    } else {
      idapsaradefine = idapsara;
      apsaradefine = true
    }
    var type = obj[n].type;
    pict = [idapsara];

    if (idapsara === "") {

    } else {
      if (type === "images") {

        try {
          obj[n].apsaraId = idapsaradefine;
          obj[n].apsara = apsaradefine;
          obj[n].media = await this.postContentService.getImageApsara(pict);
        } catch (e) {
          obj[n].media = {};
        }
      }
      else if (type === "video") {
        try {
          obj[n].apsaraId = idapsaradefine;
          obj[n].apsara = apsaradefine;
          obj[n].media = await this.postContentService.getVideoApsara(pict);
        } catch (e) {
          obj[n].media = {};
        }

      }

    }

    return obj;
  }


  async getapsaraDatabaseDetail(obj: object, days: any, hours: any, minutes: any, seconds: any, age: any[], gender: any[], wilayah: any[]) {
    let idapsara = null;
    let apsara = null;
    let apsaradefine = null;
    let idapsaradefine = null;
    let pict = null;
    var mediaType = null;
    try {
      idapsara = obj[0].apsaraId;
    } catch (e) {
      idapsara = "";
    }
    try {
      apsara = obj[0].apsara;
    } catch (e) {
      apsara = false;
    }

    if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
      apsaradefine = false;
    } else {
      apsaradefine = true;
    }

    if (idapsara === undefined || idapsara === "" || idapsara === null || idapsara === "other") {
      idapsaradefine = "";
    } else {
      idapsaradefine = idapsara;
    }
    var type = obj[0].postType;
    mediaType = obj[0].mediaType;
    pict = [idapsara];

    if (idapsara === "") {

    } else {
      if (type === "pict") {

        try {
          obj[0].apsaraId = idapsaradefine;
          obj[0].apsara = apsaradefine;
          obj[0].total = ((parseInt(days) * 24) + parseInt(hours)).toString() + ":" + minutes + ":" + seconds;
          obj[0].age = age;
          obj[0].gender = gender;
          obj[0].wilayah = wilayah;
          obj[0].media = await this.postContentService.getImageApsara(pict);
        } catch (e) {
          obj[0].media = {};
        }
      }
      else if (type === "vid") {
        try {
          obj[0].apsaraId = idapsaradefine;
          obj[0].apsara = apsaradefine;
          obj[0].total = ((parseInt(days) * 24) + parseInt(hours)).toString() + ":" + minutes + ":" + seconds;
          obj[0].age = age;
          obj[0].gender = gender;
          obj[0].wilayah = wilayah;
          obj[0].media = await this.postContentService.getVideoApsara(pict);
        } catch (e) {
          obj[0].media = {};
        }

      }
      else if (type === "story") {


        if (mediaType === "image") {

          try {
            obj[0].apsaraId = idapsaradefine;
            obj[0].apsara = apsaradefine;
            obj[0].total = ((parseInt(days) * 24) + parseInt(hours)).toString() + ":" + minutes + ":" + seconds;
            obj[0].age = age;
            obj[0].gender = gender;
            obj[0].wilayah = wilayah;
            obj[0].media = await this.postContentService.getImageApsara(pict);
          } catch (e) {
            obj[0].media = {};
          }
        } else {
          try {
            obj[0].apsaraId = idapsaradefine;
            obj[0].apsara = apsaradefine;
            obj[0].total = ((parseInt(days) * 24) + parseInt(hours)).toString() + ":" + minutes + ":" + seconds;
            obj[0].age = age;
            obj[0].gender = gender;
            obj[0].wilayah = wilayah;
            obj[0].media = await this.postContentService.getVideoApsara(pict);
          } catch (e) {
            obj[0].media = {};
          }
        }
      }
      else if (type === "diary") {
        try {
          obj[0].apsaraId = idapsaradefine;
          obj[0].apsara = apsaradefine;
          obj[0].total = ((parseInt(days) * 24) + parseInt(hours)).toString() + ":" + minutes + ":" + seconds;
          obj[0].age = age;
          obj[0].gender = gender;
          obj[0].wilayah = wilayah;
          obj[0].media = await this.postContentService.getVideoApsara(pict);
        } catch (e) {
          obj[0].media = {};

        }
      }
    }

    return obj;
  }

  async getapsaraContenBoostDetail(obj: object, age: any[], gender: any[], wilayah: any[], summary: any[], total: number, likes: number, comments: number) {
    let idapsara = null;
    let apsara = null;
    let apsaradefine = null;
    let idapsaradefine = null;
    let pict = null;
    var mediaType = null;
    try {
      idapsara = obj[0].data[0].apsaraId;
    } catch (e) {
      idapsara = "";
    }
    try {
      apsara = obj[0].data[0].apsara;
    } catch (e) {
      apsara = false;
    }

    if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
      apsaradefine = false;
    } else {
      apsaradefine = true;
    }

    if (idapsara === undefined || idapsara === "" || idapsara === null || idapsara === "other") {
      idapsaradefine = "";
    } else {
      idapsaradefine = idapsara;
    }
    var type = obj[0].data[0].postType;
    mediaType = obj[0].data[0].mediaType;
    pict = [idapsara];

    if (idapsara === "") {

    } else {
      if (type === "pict") {

        try {
          obj[0].data[0].apsaraId = idapsaradefine;
          obj[0].data[0].apsara = apsaradefine;
          obj[0].data[0].likes = likes;
          obj[0].data[0].comments = comments;
          obj[0].age = age;
          obj[0].gender = gender;
          obj[0].wilayah = wilayah;
          obj[0].summary = summary;
          obj[0].data[0].media = await this.postContentService.getImageApsara(pict);
          obj[0].total = total;
        } catch (e) {
          obj[0].data[0].media = {};
        }
      }
      else if (type === "vid") {
        try {
          obj[0].data[0].apsaraId = idapsaradefine;
          obj[0].data[0].apsara = apsaradefine;
          obj[0].data[0].likes = likes;
          obj[0].data[0].comments = comments;
          obj[0].age = age;
          obj[0].gender = gender;
          obj[0].wilayah = wilayah;
          obj[0].summary = summary;
          obj[0].data[0].media = await this.postContentService.getVideoApsara(pict);
          obj[0].total = total;
        } catch (e) {
          obj[0].data[0].media = {};
        }

      }
      else if (type === "story") {


        if (mediaType === "image") {

          try {
            obj[0].data[0].apsaraId = idapsaradefine;
            obj[0].data[0].apsara = apsaradefine;
            obj[0].data[0].likes = likes;
            obj[0].data[0].comments = comments;
            obj[0].age = age;
            obj[0].gender = gender;
            obj[0].wilayah = wilayah;
            obj[0].summary = summary;
            obj[0].data[0].media = await this.postContentService.getImageApsara(pict);
            obj[0].total = total;
          } catch (e) {
            obj[0].data[0].media = {};
          }
        } else {
          try {
            obj[0].data[0].apsaraId = idapsaradefine;
            obj[0].data[0].apsara = apsaradefine;
            obj[0].data[0].likes = likes;
            obj[0].data[0].comments = comments;
            obj[0].age = age;
            obj[0].gender = gender;
            obj[0].wilayah = wilayah;
            obj[0].summary = summary;
            obj[0].data[0].media = await this.postContentService.getVideoApsara(pict);
            obj[0].total = total;
          } catch (e) {
            obj[0].data[0].media = {};
          }
        }
      }
      else if (type === "diary") {
        try {
          obj[0].data[0].apsaraId = idapsaradefine;
          obj[0].data[0].apsara = apsaradefine;
          obj[0].data[0].likes = likes;
          obj[0].data[0].comments = comments;
          obj[0].age = age;
          obj[0].gender = gender;
          obj[0].wilayah = wilayah;
          obj[0].summary = summary;
          obj[0].data[0].media = await this.postContentService.getVideoApsara(pict);
          obj[0].total = total;
        } catch (e) {
          obj[0].data[0].media = {};

        }
      }
    }

    return obj;
  }

  async getapsaraBoostconsole(obj: object, n: number) {
    let idapsara = null;
    let apsara = null;
    let apsaradefine = null;
    let idapsaradefine = null;
    let pict = null;
    var mediaType = null;
    try {
      idapsara = obj[n].apsaraId;
    } catch (e) {
      idapsara = "";
    }
    try {
      apsara = obj[n].apsara;
    } catch (e) {
      apsara = false;
    }

    if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
      apsaradefine = false;
    } else {
      apsaradefine = true;
    }

    if (idapsara === undefined || idapsara === "" || idapsara === null || idapsara === "other") {
      idapsaradefine = "";
    } else {
      idapsaradefine = idapsara;
    }
    var type = obj[n].postType;
    var mediaType = obj[n].mediaType;
    pict = [idapsara];

    if (idapsara === "") {

    } else {
      if (type === "pict") {

        try {
          obj[n].apsaraId = idapsaradefine;
          obj[n].apsara = apsaradefine;
          obj[n].media = await this.postContentService.getImageApsara(pict);
        } catch (e) {
          obj[n].media = {};
        }
      }
      else if (type === "vid") {
        try {
          obj[n].apsaraId = idapsaradefine;
          obj[n].apsara = apsaradefine;
          obj[n].media = await this.postContentService.getVideoApsara(pict);
        } catch (e) {
          obj[n].media = {};
        }

      }
      else if (type === "story") {
        if (mediaType === "image") {

          try {
            obj[n].apsaraId = idapsaradefine;
            obj[n].apsara = apsaradefine;
            obj[n].media = await this.postContentService.getImageApsara(pict);
          } catch (e) {
            obj[n].media = {};
          }
        } else {
          try {
            obj[n].apsaraId = idapsaradefine;
            obj[n].apsara = apsaradefine;
            obj[n].media = await this.postContentService.getVideoApsara(pict);
          } catch (e) {
            obj[n].media = {};
          }
        }
      }
      else if (type === "diary") {
        try {
          obj[n].apsaraId = idapsaradefine;
          obj[n].apsara = apsaradefine;
          obj[n].media = await this.postContentService.getVideoApsara(pict);
        } catch (e) {
          obj[n].media = {};

        }
      }
    }

    return obj;
  }
  async findAll(): Promise<Getusercontents[]> {
    return this.getusercontentsModel.find().exec();
  }
  async findcountfilter(email: string) {
    const query = await this.getusercontentsModel.aggregate([

      {
        $match: {
          email: email
        }
      },
      {
        $group: {
          _id: "$email",
          totalpost: {
            $sum: 1
          }
        }
      }
    ]);
    return query;
  }

  async findcountall() {
    const query = await this.getusercontentsModel.aggregate([

      {
        $group: {
          _id: null,
          totalpost: {
            $sum: 1
          }
        }
      }
    ]);
    return query;
  }

  async findcountfilterall(keys: string, postType: string) {
    const query = await this.getusercontentsModel.aggregate([
      {
        $match: {
          $or: [{
            description: {
              $regex: keys, $options: 'i'
            }, postType: postType
          }, {
            tags: {
              $regex: keys, $options: 'i'
            }, postType: postType
          }]
        }
      },
      {
        $group: {
          _id: null,
          totalpost: {
            $sum: 1
          }
        }
      }
    ]);
    return query;
  }

  async findcountfilteTag(keys: string) {
    const query = await this.getusercontentsModel.aggregate([
      {
        $match: {

          tags: {
            $regex: keys, $options: 'i'
          }


        }
      },
      {
        $group: {
          _id: null,
          totalpost: {
            $sum: 1
          }
        }
      }
    ]);
    return query;
  }

  async findcountfilteTagAll() {
    const query = await this.getusercontentsModel.aggregate([
      {
        $group: {
          _id: null,
          totalpost: {
            $sum: 1
          }
        }
      }
    ]);
    return query;
  }

  async findalldata(email: string, monetize: any, popular: any, startdate: string, enddate: string, page: number, limit: number) {
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }

    var pipeline = [];

    pipeline.push(
      {
        $addFields: {

          salePrice: {
            $cmp: ["$saleAmount", 0]
          }
        },

      },
      {
        $project: {
          refs: {
            $arrayElemAt: ['$contentMedias', 0]
          },
          createdAt: 1,
          reportedStatus: 1,
          reportedUserCount: 1,
          updatedAt: 1,
          postID: 1,
          email: 1,
          postType: 1,
          description: 1,
          title: 1,
          active: 1,
          metadata: 1,
          location: 1,
          tags: 1,
          likes: 1,
          shares: 1,
          reaction: 1,
          comments: 1,
          isOwned: 1,
          views: 1,
          visibility: 1,
          allowComments: 1,
          certified: 1,
          isViewed:
          {
            $cond: {
              if: {
                $eq: ["$views", 0]
              },
              then: false,
              else: true
            }
          },
          saleLike: {
            $cond: {
              if: {
                $eq: ["$saleLike", - 1]
              },
              then: false,
              else: "$saleLike"
            }
          },
          saleView: {
            $cond: {
              if: {
                $eq: ["$saleView", - 1]
              },
              then: false,
              else: "$saleView"
            }
          },
          saleAmount: {
            $cond: {
              if: {
                $eq: ["$salePrice", - 1]
              },
              then: 0,
              else: "$saleAmount"
            }
          },

          monetize: {
            $cond: {
              if: {
                $or: [{
                  $eq: ["$salePrice", -1]
                }, {
                  $eq: ["$salePrice", 0]
                },]
              },
              then: false,
              else: true
            },

          },

        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          reportedStatus: 1,
          reportedUserCount: 1,
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          email: 1,
          postType: 1,
          description: 1,
          title: 1,
          active: 1,
          metadata: 1,
          location: 1,
          tags: 1,
          likes: 1,
          shares: 1,
          reaction: 1,
          comments: 1,
          isOwned: 1,
          views: 1,
          visibility: 1,
          isViewed: 1,
          allowComments: 1,
          certified: 1,
          saleLike: 1,
          saleView: 1,
          saleAmount: 1,
          monetize: 1,
          refe: '$refs.ref',


        }
      },
      {
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',

        },

      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',

        },

      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',

        },

      },
      {
        $project: {
          mediapict: {
            $arrayElemAt: ['$mediaPict_data', 0]
          },
          mediadiaries: {
            $arrayElemAt: ['$mediadiaries_data', 0]
          },
          mediavideos: {
            $arrayElemAt: ['$mediavideos_data', 0]
          },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: 1,
          reportedStatus: 1,
          reportedUserCount: 1,
          idmedia: 1,
          rotate: '$mediadiaries.rotate',
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          email: 1,
          postType: 1,
          description: 1,
          title: 1,
          active: 1,
          metadata: 1,
          location: 1,
          tags: 1,
          likes: 1,
          shares: 1,
          reaction: 1,
          comments: 1,
          isOwned: 1,
          views: 1,
          visibility: 1,
          privacy: 1,
          isViewed: 1,
          allowComments: 1,
          certified: 1,
          saleLike: 1,
          saleView: 1,
          saleAmount: 1,
          monetize: 1,


        }
      },
      {
        $addFields: {

          concatmediapict: '/pict',
          media_pict: {
            $replaceOne: {
              input: "$mediapict.mediaUri",
              find: "_0001.jpeg",
              replacement: ""
            }
          },
          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',
          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },

      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': '$mediapict.mediaBasePath'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': '$mediadiaries.mediaBasePath'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': '$mediavideos.mediaBasePath'
                }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': '$mediapict.mediaUri'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': '$mediadiaries.mediaUri'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': '$mediavideos.mediaUri'
                }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': '$mediapict.mediaType'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': '$mediadiaries.mediaType'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': '$mediavideos.mediaType'
                }
              ],
              default: ''
            }
          },
          mediaThumbEndpoint: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': '$mediadiaries.mediaThumb'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': {
                    $concat: ["$concatthumbdiari", "/", "$postID"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': {
                    $concat: ["$concatthumbvideo", "/", "$postID"]
                  },

                }
              ],
              default: ''
            }
          },
          mediaEndpoint: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': {
                    $concat: ["$concatmediapict", "/", "$postID"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': {
                    $concat: ["$concatmediadiari", "/", "$postID"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': {
                    $concat: ["$concatmediavideo", "/", "$postID"]
                  },

                }
              ],
              default: ''
            }
          },
          mediaThumbUri: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': '$mediadiaries.mediaThumb'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': '$mediadiaries.mediaThumb'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': '$mediavideos.mediaThumb'
                }
              ],
              default: ''
            }
          },
          apsaraId: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediapict.apsaraId"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.apsaraId"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.apsaraId"
                }
              ],
              default: false
            }
          },
          apsara: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediapict.apsara"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.apsara"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.apsara"
                }
              ],
              default: false
            }
          },
          reportedStatus: 1,
          reportedUserCount: 1,
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          email: 1,
          postType: 1,
          description: 1,
          title: 1,
          active: 1,
          metadata: 1,
          location: 1,
          tags: 1,
          likes: 1,
          shares: 1,
          reaction: 1,
          comments: 1,
          isOwned: 1,
          views: 1,
          visibility: 1,
          privacy: 1,
          isViewed: 1,
          allowComments: 1,
          certified: 1,
          saleLike: 1,
          saleView: 1,
          saleAmount: 1,
          monetize: 1,


        }
      },
    );

    pipeline.push({
      $match: {
        email: email
      }
    },);

    if (monetize && monetize !== undefined) {
      pipeline.push({
        $match: {
          monetize: monetize
        }
      },);
    }
    if (startdate && startdate !== undefined) {

      pipeline.push({ $match: { createdAt: { "$gte": startdate } } });

    }
    if (enddate && enddate !== undefined) {

      pipeline.push({ $match: { createdAt: { "$lte": dateend } } });

    }

    if (popular && popular !== undefined) {
      pipeline.push({ $sort: { views: -1, likes: -1 }, },);
    } else {
      pipeline.push({ $sort: { createdAt: - 1 } });
    }

    if (page > 0) {
      pipeline.push({ $skip: (page * limit) });
    }
    if (limit > 0) {
      pipeline.push({ $limit: limit });
    }
    let query = await this.getusercontentsModel.aggregate(pipeline);

    try {
      var data = null;
      var datas = null;
      var arrdata = [];
      let pict: String[] = [];
      var objk = {};
      var type = null;
      var idapsara = null;
      var apsara = null;
      var idapsaradefine = null;
      var apsaradefine = null;
      for (var i = 0; i < query.length; i++) {
        try {
          idapsara = query[i].apsaraId;
        } catch (e) {
          idapsara = "";
        }
        try {
          apsara = query[i].apsara;
        } catch (e) {
          apsara = false;
        }
        if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
          apsaradefine = false;
        } else {
          apsaradefine = true;
        }

        if (idapsara === undefined || idapsara === "" || idapsara === null) {
          idapsaradefine = "";
        } else {
          idapsaradefine = idapsara;
        }
        var type = query[i].postType;
        pict = [idapsara];

        if (idapsara === "") {
          datas = [];
        } else {
          if (type === "pict") {

            try {
              datas = await this.postContentService.getImageApsara(pict);
            } catch (e) {
              datas = [];
            }
          }
          else if (type === "vid") {
            try {
              datas = await this.postContentService.getVideoApsara(pict);
            } catch (e) {
              datas = [];
            }

          }
          else if (type === "story") {
            try {
              datas = await this.postContentService.getVideoApsara(pict);
            } catch (e) {
              datas = [];
            }
          }
          else if (type === "diary") {
            try {
              datas = await this.postContentService.getVideoApsara(pict);
            } catch (e) {
              datas = [];
            }
          }
        }
        objk = {
          "_id": query[i]._id,
          "postID": query[i].postID,
          "email": query[i].email,
          "postType": query[i].postType,
          "description": query[i].description,
          "active": query[i].active,
          "createdAt": query[i].createdAt,
          "updatedAt": query[i].updatedAt,
          "visibility": query[i].visibility,
          "location": query[i].location,
          "isViewed": query[i].isViewed,
          "saleLike": query[i].saleLike,
          "saleView": query[i].saleView,
          "likes": query[i].likes,
          "shares": query[i].shares,
          "reaction": query[i].reaction,
          "comments": query[i].comments,
          "isOwned": query[i].isOwned,
          "views": query[i].views,
          "saleAmount": query[i].saleAmount,
          "monetize": query[i].monetize,
          "mediaType": query[i].mediaType,
          "mediaThumbEndpoint": query[i].mediaThumbEndpoint,
          "mediaEndpoint": query[i].mediaEndpoint,
          "apsaraId": idapsaradefine,
          "apsara": apsaradefine,
          "media": datas
        };

        arrdata.push(objk);
      }
      data = arrdata;
    } catch (e) {
      data = null;
    }

    return data;
  }


  async findlatesdata(email: string, skip: number, limit: number): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },
          // refe:'$refs.ref',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',

        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


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

        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

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
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },



        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }


  async findpopular(email: string, skip: number, limit: number): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },
          // refe:'$refs.ref',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',

        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


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

        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

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
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },




        }
      },

      { $sort: { views: -1, likes: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }

  async findsearch(email: string, title: string, skip: number, limit: number): Promise<object> {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email, title: { $regex: title, $options: 'i' } } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',

        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


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

        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

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
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },




        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }


  async findmonetize(email: string, skip: number, limit: number): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([

      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }


        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },
          // refe:'$refs.ref',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          certified: '$certified',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          saleAmount: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: 0, else: "$saleAmount" }
          },
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },

        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          certified: '$certified',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          saleAmount: '$saleAmount',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          certified: '$certified',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          saleAmount: '$saleAmount',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

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

        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          certified: '$certified',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          saleAmount: '$saleAmount',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
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
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },




        }
      },
      { $match: { email: email, monetize: true } },
      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }

  async findmanagementcontentall(email: string): Promise<object> {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },

      {
        "$lookup": {
          "from": "disqus",
          "let": {
            "postIDs": "$postID",
            "postTypes": "$postType"
          },
          "pipeline": [
            {
              "$match": {
                "$expr": {
                  "$eq": [
                    "$postID",
                    "$$postIDs"
                  ]
                }
              }
            },
            {
              "$lookup": {
                "from": "disquslogs",
                "let": {
                  "disqusIDs": "$disqusID"
                },
                "pipeline": [
                  {
                    "$match": {
                      "$expr": {
                        "$eq": [
                          "$disqusID",
                          "$$disqusIDs"
                        ]
                      }
                    }
                  },

                  {
                    "$lookup": {
                      "from": "disquslogsdata",
                      "let": {
                        "parentIDs": "$parentID",
                        "actives": "$active"
                      },
                      "pipeline": [
                        {
                          "$match": {
                            "$expr": {
                              "$eq": [
                                "$parentID",
                                "$$parentIDs"
                              ]
                            }
                          }
                        }
                      ],
                      "as": "replyLogs"
                    },
                  },
                  { "$match": { "active": true } },
                  { "$group": { _id: "$parentID", replyLogs: { $push: "$$ROOT" } } },
                  { "$set": { "disqusID": "$$disqusIDs", "postID": "$$postIDs", "postType": "$$postTypes" } }
                ],
                "as": "disquslogs"
              }
            }, { "$unset": "disqusLogs" },

          ],
          "as": "disqusdata"
        }
      },

      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {
          // "_id" : 0, 
          // posts : '$$ROOT',

          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',

          disqus: '$disqusdata'

        }
      },
      {
        $lookup: {
          localField: 'posts.postID',
          from: 'disqus',
          foreignField: 'postID',
          as: 'disqusdata'
        }
      }, {
        $unwind: {
          path: '$disqusdata',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: 'disquslogs',
          localField: 'disqusdata.disqusLogs.$id', // or author.$id
          foreignField: "_id",
          as: "logs"
        }
      },

      {
        $lookup: {
          from: 'disquslogs',
          localField: 'logs.replyLogs.$id', // or author.$id
          foreignField: "_id",
          as: "logs2"
        }
      },
      {
        $project: {
          // replylogs:'$logs2',
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          disqus: '$disqus',


          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          // replylogs:'$replylogs',
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


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
          disqus: '$disqus'
        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          //replylogs:'$replylogs',
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

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
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },

          disqus: '$disqus'




        }
      },
      {
        $project: {
          // replylogs:'$replylogs',
          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
          avatar: '$avatar',

          disqus: '$disqus'




        }
      },

      { $sort: { createdAt: -1 }, },
      // { $skip: 0},
      // { $limit: 10 },

    ]);

    return query;
  }
  async findmanagementcontentpopular(email: string) {



    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


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

        }
      },

      {
        $addFields: {


          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

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

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
        }
      },

      { $sort: { views: -1, likes: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }
  async findmanagementcontentlikes(email: string) {


    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


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

        }
      },

      {
        $addFields: {


          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

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

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
        }
      },

      { $sort: { likes: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }

  async findmanagementcontentshare(email: string) {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


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

        }
      },

      {
        $addFields: {


          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

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

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
        }
      },

      { $sort: { shares: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }
  async findmanagementcontentlatepos(email: string) {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


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

        }
      },

      {
        $addFields: {


          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

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

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }

  async findmanagementcontentmonetize(email: string) {

    const query = await this.getusercontentsModel.aggregate([

      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID',
          salePrice: { $cmp: ["$saleAmount", 0] }
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          monetize: '$monetize',

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

        }
      },

      {
        $addFields: {


          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          monetize: '$monetize',
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

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          monetize: '$monetize',
          insight: '$insight',
        }
      },
      { $match: { email: email, monetize: true } },
      { $sort: { createdAt: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }
  async findmanagementcontentowner(email: string) {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email, isOwned: true } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


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

        }
      },

      {
        $addFields: {


          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

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

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }
  async findmanagementcontentregion(email: string, countries: string) {

    const query = await this.getusercontentsModel.aggregate([
      {
        $match: {
          email: email,
          location: {
            $regex: countries, $options: 'i'
          }
        }
      },
      {
        $group: {
          _id: "$email",
          totalpost: {
            $sum: 1
          }
        }
      }

    ]);
    return query;
  }

  async findmanagementcontentallregion(email: string) {

    const query = await this.getusercontentsModel.find({ "email": email }).exec();
    return query;
  }

  async findmanagementcontenttrafic(email: string) {


    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


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

        }
      },

      {
        $addFields: {


          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

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

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
        }
      },

      { $sort: { views: -1, likes: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }


  async findmanagementcontentmoderate(email: string) {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


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

        }
      },

      {
        $addFields: {


          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

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

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }

  async findtime(postID: string) {

    const query = await this.getusercontentsModel.aggregate([

      {
        $match: {

          postID: postID

        }

      },
      {
        $project: {

          createdAt: "$createdAt"


        }
      },

    ]);


    return query;
  }


  async findpostid(postID: string): Promise<object> {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { postID: postID } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },
          // refe:'$refs.ref',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',

        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


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

        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

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
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },
        }
      },
      { $limit: 1 },

    ]);

    return query;
  }


  async findalldatakonten(email: string, skip: number, limit: number): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },
        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

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

        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
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
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },




        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }

  async findalldatakontenowned(email: string, skip: number, limit: number): Promise<object> {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email, isOwned: true } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },
        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

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

        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
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
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },
        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }
  async findalldatakontenmonetize(email: string, skip: number, limit: number): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([

      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },
        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

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

        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
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
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },
        }
      },
      { $match: { email: email, monetize: true } },
      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }


  async findalldatakontenpostype(email: string, postType: string, skip: number, limit: number): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email, postType: postType } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },
        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

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

        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
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
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },
        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }

  async findalldatakontendaterange(email: string, startdate: string, enddate: string, skip: number, limit: number): Promise<object> {


    var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

    var dateend = currentdate.toISOString();

    const query = await this.getusercontentsModel.aggregate([

      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },
        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

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

        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
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
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },
        }
      },
      { $match: { email: email, createdAt: { $gte: startdate, $lte: dateend } } },
      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }


  async findalldatakontenbuy(iduserbuy: Types.ObjectId, skip: number, limit: number): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'transactions',
          localField: 'postID',
          foreignField: 'postid',
          as: 'tr_data',
        },
      },
      {
        "$unwind": {
          "path": "$tr_data",
          "preserveNullAndEmptyArrays": false
        }
      },
      { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success" } },
      { "$sort": { "tr_data.createdAt": -1 }, },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },
        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

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

        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
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
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },




        }
      },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }


  async findalldatakontenmultiple(iduserbuy: Types.ObjectId, email: string, ownership: any, monetesisasi: boolean, buy: boolean, archived: boolean, reported: boolean, postType: string, startdate: string, enddate: string, skip: number, limit: number) {

    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }
    var pipeline = new Array<any>();
    if (buy && buy !== undefined) {
      pipeline = new Array<any>(
        {
          $lookup: {
            from: 'userbasics',
            localField: 'email',
            foreignField: 'email',
            as: 'basicdata',
          }
        },
        {
          $lookup: {
            from: 'userauths',
            localField: 'email',
            foreignField: 'email',
            as: 'authdata',
          }
        },
        {
          $lookup: {
            from: 'transactions',
            localField: 'postID',
            foreignField: 'postid',
            as: 'trans',
          }
        },
        {
          $unwind: {
            path: '$trans',
            preserveNullAndEmptyArrays: false
          }
        },

        {
          $addFields: {
            'auth': { $arrayElemAt: ['$authdata', 0] },
            'basic': { $arrayElemAt: ['$basicdata', 0] },
            'profilepictid': { $arrayElemAt: ['$basicdata.profilePict.$id', 0] },
            'insightid': { $arrayElemAt: ['$basicdata.insight.$id', 0] },
            'mediaid': { $arrayElemAt: ['$contentMedias.$id', 0] },
            'mediaref': { $arrayElemAt: ['$contentMedias.$ref', 0] },
            'isViewed': {
              '$cond': { if: { '$eq': ['$views', 0] }, then: false, else: true }
            },
            salePrice: "$trans.amount",
            monetize: true
          }
        },
        {
          $lookup: {
            from: 'mediaprofilepicts',
            localField: 'profilepictid',
            foreignField: '_id',
            as: 'avatardata',
          }
        },
        {
          $lookup: {
            from: 'insights',
            localField: 'insightid',
            foreignField: '_id',
            as: 'insightdata',
          }
        },
        {
          $lookup: {
            from: 'mediapicts',
            localField: 'mediaid',
            foreignField: '_id',
            as: 'picturedata',
          }
        },
        {
          $lookup: {
            from: 'mediadiaries',
            localField: 'mediaid',
            foreignField: '_id',
            as: 'diarydata',
          }
        },
        {
          $lookup: {
            from: 'mediavideos',
            localField: 'mediaid',
            foreignField: '_id',
            as: 'videodata',
          }
        },
        {
          $addFields: {
            'avatar': { $arrayElemAt: ['$avatardata', 0] },
            'insight': { $arrayElemAt: ['$insightdata', 0] },
            'picture': { $arrayElemAt: ['$picturedata', 0] },
            'diary': { $arrayElemAt: ['$diarydata', 0] },
            'video': { $arrayElemAt: ['$videodata', 0] },
          }
        },
        {
          $addFields: {
            pathavatar: '/profilepict',

            pathpicture: '/pict',
            mediapicture: { $replaceOne: { input: "$picture.mediaUri", find: "_0001.jpeg", replacement: "" } },

            pathdiary: '/stream',
            paththumbdiary: '/thumb',
            mediadiary: '$diary.mediaUri',

            pathvideo: '/stream',
            paththumbvideo: '/thumb',
            mediavideo: '$video.mediaUri'
          }
        },
        {
          $project: {
            _id: 1,
            insight: {
              shares: '$insight.shares',
              followers: '$insight.followers',
              comments: '$insight.comments',
              followings: '$insight.followings',
              reactions: '$insight.reactions',
              posts: '$insight.posts',
              views: '$insight.views',
              likes: '$insight.likes'
            },
            avatar: {
              mediaBasePath: '$avatar.mediaBasePath',
              mediaUri: '$avatar.mediaUri',
              mediaType: '$avatar.mediaType',
              mediaEndpoint: '$avatar.fsTargetUri',
              medreplace: { $replaceOne: { input: "$avatar.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
            fullName: "$basic.fullName",
            username: "$auth.username",
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            email: 1,
            postType: 1,
            description: 1,
            title: 1,
            active: 1,
            metadata: 1,
            location: 1,
            tags: 1,
            likes: 1,
            views: 1,
            shares: 1,
            comments: 1,
            isOwned: 1,
            certified: 1,
            privacy: {
              isPostPrivate: '$basic.isPostPrivate',
              isCelebrity: '$basic.isCelebrity',
              isPrivate: '$basic.isPrivate'
            },
            isViewed: '$isViewed',
            allowComments: 1,
            isSafe: 1,
            saleLike: 1,
            saleView: 1,
            monetize: "$monetize",
            salePrice: "$salePrice",
            mediaref: "$mediaref",
            rotate: '$diary.rotate',
            trans: 1,
            mediaBasePath: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaBasePath' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaBasePath' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaBasePath' }
                ],
                default: ''
              }
            },
            mediaUri: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaUri' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaUri' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaUri' }
                ],
                default: ''
              }
            },
            mediaType: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaType' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaType' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaType' }
                ],
                default: ''
              }
            },
            mediaThumbEndpoint: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaThumb' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': { $concat: ["$paththumbdiary", "/", "$mediadiary"] }, },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': { $concat: ["$paththumbvideo", "/", "$mediavideo"] }, }
                ],
                default: ''
              }
            },

            mediaEndpoint: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': { $concat: ["$pathpicture", "/", "$mediapicture"] }, },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': { $concat: ["$pathdiary", "/", "$mediadiary"] }, },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': { $concat: ["$pathvideo", "/", "$mediavideo"] }, }
                ],
                default: ''
              }
            },

            mediaThumbUri: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$diary.mediaThumb' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaThumb' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaThumb' }
                ],
                default: ''
              }
            },
            apsaraId: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        "$mediaref",
                        "mediapicts"
                      ]
                    },
                    then: "$picture.apsaraId"
                  },
                  {
                    case: {
                      $eq: [
                        "$mediaref",
                        "mediadiaries"
                      ]
                    },
                    then: "$diary.apsaraId"
                  },
                  {
                    case: {
                      $eq: [
                        "$mediaref",
                        "mediavideos"
                      ]
                    },
                    then: "$video.apsaraId"
                  }
                ],
                default: ""
              }
            },
            apsara: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        "$mediaref",
                        "mediapicts"
                      ]
                    },
                    then: "$picture.apsara"
                  },
                  {
                    case: {
                      $eq: [
                        "$mediaref",
                        "mediadiaries"
                      ]
                    },
                    then: "$diary.apsara"
                  },
                  {
                    case: {
                      $eq: [
                        "$mediaref",
                        "mediavideos"
                      ]
                    },
                    then: "$video.apsara"
                  }
                ],
                default: false
              }
            },
          }
        },
      );
      pipeline.push({ $match: { "trans.iduserbuyer": iduserbuy, "trans.status": "Success" } });
    }
    else {
      console.log("not monetized");
      pipeline = new Array<any>(
        {
          $lookup: {
            from: 'userbasics',
            localField: 'email',
            foreignField: 'email',
            as: 'basicdata',
          }
        },
        {
          $lookup: {
            from: 'userauths',
            localField: 'email',
            foreignField: 'email',
            as: 'authdata',
          }
        },
        {
          $addFields: {
            'auth': { $arrayElemAt: ['$authdata', 0] },
            'basic': { $arrayElemAt: ['$basicdata', 0] },
            'profilepictid': { $arrayElemAt: ['$basicdata.profilePict.$id', 0] },
            'insightid': { $arrayElemAt: ['$basicdata.insight.$id', 0] },
            'mediaid': { $arrayElemAt: ['$contentMedias.$id', 0] },
            'mediaref': { $arrayElemAt: ['$contentMedias.$ref', 0] },
            'isViewed': {
              '$cond': { if: { '$eq': ['$views', 0] }, then: false, else: true }
            },
            salePrice: "$saleAmount",
            monetize: {
              $cond: { if: { $eq: ["$saleAmount", 0] }, then: false, else: true }
            }
          }
        },
        {
          $lookup: {
            from: 'mediaprofilepicts',
            localField: 'profilepictid',
            foreignField: '_id',
            as: 'avatardata',
          }
        },
        {
          $lookup: {
            from: 'insights',
            localField: 'insightid',
            foreignField: '_id',
            as: 'insightdata',
          }
        },
        {
          $lookup: {
            from: 'mediapicts',
            localField: 'mediaid',
            foreignField: '_id',
            as: 'picturedata',
          }
        },
        {
          $lookup: {
            from: 'mediadiaries',
            localField: 'mediaid',
            foreignField: '_id',
            as: 'diarydata',
          }
        },
        {
          $lookup: {
            from: 'mediavideos',
            localField: 'mediaid',
            foreignField: '_id',
            as: 'videodata',
          }
        },
        {
          $addFields: {
            'avatar': { $arrayElemAt: ['$avatardata', 0] },
            'insight': { $arrayElemAt: ['$insightdata', 0] },
            'picture': { $arrayElemAt: ['$picturedata', 0] },
            'diary': { $arrayElemAt: ['$diarydata', 0] },
            'video': { $arrayElemAt: ['$videodata', 0] },
          }
        },
        {
          $addFields: {
            pathavatar: '/profilepict',

            pathpicture: '/pict',
            mediapicture: { $replaceOne: { input: "$picture.mediaUri", find: "_0001.jpeg", replacement: "" } },

            pathdiary: '/stream',
            paththumbdiary: '/thumb',
            mediadiary: '$diary.mediaUri',

            pathvideo: '/stream',
            paththumbvideo: '/thumb',
            mediavideo: '$video.mediaUri'
          }
        },
        {
          $project: {
            _id: 1,
            insight: {
              shares: '$insight.shares',
              followers: '$insight.followers',
              comments: '$insight.comments',
              followings: '$insight.followings',
              reactions: '$insight.reactions',
              posts: '$insight.posts',
              views: '$insight.views',
              likes: '$insight.likes'
            },
            avatar: {
              mediaBasePath: '$avatar.mediaBasePath',
              mediaUri: '$avatar.mediaUri',
              mediaType: '$avatar.mediaType',
              mediaEndpoint: '$avatar.fsTargetUri',
              medreplace: { $replaceOne: { input: "$avatar.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
            fullName: "$basic.fullName",
            username: "$auth.username",
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            email: 1,
            postType: 1,
            description: 1,
            title: 1,
            active: 1,
            metadata: 1,
            location: 1,
            tags: 1,
            likes: 1,
            views: 1,
            shares: 1,
            comments: 1,
            isOwned: 1,
            certified: 1,
            privacy: {
              isPostPrivate: '$basic.isPostPrivate',
              isCelebrity: '$basic.isCelebrity',
              isPrivate: '$basic.isPrivate'
            },
            isViewed: '$isViewed',
            allowComments: 1,
            isSafe: 1,
            saleLike: 1,
            saleView: 1,
            reportedUserCount: 1,
            monetize: "$monetize",
            salePrice: "$salePrice",
            mediaref: "$mediaref",
            rotate: '$diary.rotate',
            mediaBasePath: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaBasePath' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaBasePath' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaBasePath' }
                ],
                default: ''
              }
            },
            mediaUri: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaUri' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaUri' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaUri' }
                ],
                default: ''
              }
            },
            mediaType: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaType' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaType' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaType' }
                ],
                default: ''
              }
            },
            mediaThumbEndpoint: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaThumb' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': { $concat: ["$paththumbdiary", "/", "$mediadiary"] }, },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': { $concat: ["$paththumbvideo", "/", "$mediavideo"] }, }
                ],
                default: ''
              }
            },

            mediaEndpoint: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': { $concat: ["$pathpicture", "/", "$mediapicture"] }, },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': { $concat: ["$pathdiary", "/", "$mediadiary"] }, },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': { $concat: ["$pathvideo", "/", "$mediavideo"] }, }
                ],
                default: ''
              }
            },

            mediaThumbUri: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$diary.mediaThumb' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaThumb' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaThumb' }
                ],
                default: ''
              }
            },
            apsaraId: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        "$mediaref",
                        "mediapicts"
                      ]
                    },
                    then: "$picture.apsaraId"
                  },
                  {
                    case: {
                      $eq: [
                        "$mediaref",
                        "mediadiaries"
                      ]
                    },
                    then: "$diary.apsaraId"
                  },
                  {
                    case: {
                      $eq: [
                        "$mediaref",
                        "mediavideos"
                      ]
                    },
                    then: "$video.apsaraId"
                  }
                ],
                default: ""
              }
            },
            apsara: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        "$mediaref",
                        "mediapicts"
                      ]
                    },
                    then: "$picture.apsara"
                  },
                  {
                    case: {
                      $eq: [
                        "$mediaref",
                        "mediadiaries"
                      ]
                    },
                    then: "$diary.apsara"
                  },
                  {
                    case: {
                      $eq: [
                        "$mediaref",
                        "mediavideos"
                      ]
                    },
                    then: "$video.apsara"
                  }
                ],
                default: false
              }
            },
          }
        }
      );
      pipeline.push({ $match: { email: email, active: true } });
      if (ownership !== undefined && ownership === true) {
        pipeline.push({ $match: { certified: true } });
      }
      if (archived && archived !== undefined) {
        pipeline.push({ $match: { postType: "story" } });
      }
    }

    if (postType && postType !== undefined) {
      pipeline.push({ $match: { postType: postType } });
    }
    if (monetesisasi !== undefined) {
      pipeline.push({ $match: { monetize: monetesisasi } });
    }
    if (startdate && startdate !== undefined) {
      pipeline.push({ $match: { createdAt: { "$gte": startdate } } });
    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { createdAt: { "$lte": dateend } } });
    }
    if (reported !== undefined) {
      if (reported)
        pipeline.push({ $match: { "reportedUserCount": { $gt: 0 } } })
      else
        pipeline.push({ $match: { "reportedUserCount": 0 } })
    }

    if (buy !== undefined) {
      pipeline.push({ $sort: { "trans.createdAt": -1 } });
    }
    else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });
    const util = require('util')
    console.log(util.inspect(pipeline, { showHidden: false, depth: null, colors: true }));

    const query = await this.getusercontentsModel.aggregate(pipeline);
    var data = null;
    var arrdata = [];
    let pict: String[] = [];
    var objk = {};
    var type = null;
    var idapsara = null;
    for (var i = 0; i < query.length; i++) {
      try {
        idapsara = query[i].apsaraId;
      } catch (e) {
        idapsara = "";
      }

      var type = query[i].postType;
      pict = [idapsara];

      if (idapsara === "") {
        data = [];
      } else {
        if (type === "pict") {

          try {
            data = await this.postContentService.getImageApsara(pict);
          } catch (e) {
            data = [];
          }
        }
        else if (type === "vid") {
          try {
            data = await this.postContentService.getVideoApsara(pict);
          } catch (e) {
            data = [];
          }

        }
        else if (type === "story") {
          try {
            data = await this.postContentService.getVideoApsara(pict);
          } catch (e) {
            data = [];
          }
        }
        else if (type === "diary") {
          try {
            data = await this.postContentService.getVideoApsara(pict);
          } catch (e) {
            data = [];
          }
        }
      }
      objk = {
        "_id": query[i]._id,
        "insight": query[i].insight,
        "avatar": query[i].avatar,
        "mediaType": query[i].mediaType,
        "mediaThumbEndpoint": query[i].mediaThumbEndpoint,
        "mediaEndpoint": query[i].mediaEndpoint,
        "apsaraId": query[i].apsaraId,
        "apsara": query[i].apsara,
        "fullName": query[i].fullName,
        "username": query[i].username,
        "createdAt": query[i].createdAt,
        "updatedAt": query[i].updatedAt,
        "postID": query[i].postID,
        "email": query[i].email,
        "postType": query[i].postType,
        "description": query[i].description,
        "title": query[i].title,
        "active": query[i].active,
        "metadata": query[i].metadata,
        "location": query[i].location,
        "tags": query[i].tags,
        "likes": query[i].likes,
        "shares": query[i].shares,
        "isOwned": query[i].isOwned,
        "views": query[i].views,
        "privacy": query[i].privacy,
        "isViewed": query[i].isViewed,
        "allowComments": query[i].allowComments,
        "saleLike": query[i].saleLike,
        "saleView": query[i].saleView,
        "monetize": query[i].monetize,
        "salePrice": query[i].salePrice,
        "certified": query[i].certified,
        "media": data,
        "trans": query[i].trans
      };

      arrdata.push(objk);
    }
    return arrdata;

  }

  async findpopularanalitic(email: string): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          profilevisit: { $cmp: ["$profilevisit", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },
          // refe:'$refs.ref',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visit: {
            $cond: { if: { $eq: ["$profilevisit", -1] }, then: 0, else: 1 }
          },
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',

        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visit: '$visit',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visit: '$visit',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes',

          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },

        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visit: '$visit',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes',

          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },

        }
      },

      { $sort: { likes: -1, comments: -1 }, },
      { $limit: 1 },

    ]);

    return query;
  }
  async findcontenbuy(postID: string) {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { postID: postID } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: {
            $cond: { if: { $eq: ["$saleLike", -1] }, then: false, else: "$saleLike" }
          },
          saleView: {
            $cond: { if: { $eq: ["$saleView", -1] }, then: false, else: "$saleView" }
          },
          saleAmount: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: 0, else: "$saleAmount" }
          },
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },
        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      // {
      //   $lookup: {
      //     from: 'insights2',
      //     localField: 'insight_id',
      //     foreignField: '_id',
      //     as: 'insight_data',
      //   },
      // },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
        },
      },
      {
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          // insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',

          // insight: {
          //   shares: '$insights.shares',
          //   followers: '$insights.followers',
          //   comments: '$insights.comments',
          //   followings: '$insights.followings',
          //   reactions: '$insights.reactions',
          //   posts: '$insights.posts',
          //   views: '$insights.views',
          //   likes: '$insights.likes'
          // },
          // avatar: {
          //   mediaBasePath: '$profilpict.mediaBasePath',
          //   mediaUri: '$profilpict.mediaUri',
          //   mediaType: '$profilpict.mediaType',
          //   mediaEndpoint: '$profilpict.fsTargetUri',
          //   medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          // },

        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          // insight: {
          //   shares: '$insights.shares',
          //   followers: '$insights.followers',
          //   comments: '$insights.comments',
          //   followings: '$insights.followings',
          //   reactions: '$insights.reactions',
          //   posts: '$insights.posts',
          //   views: '$insights.views',
          //   likes: '$insights.likes'
          // },
          // avatar: {
          //   mediaBasePath: '$profilpict.mediaBasePath',
          //   mediaUri: '$profilpict.mediaUri',
          //   mediaType: '$profilpict.mediaType',
          //   mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          // },
        }
      }

    ]);
    return query;
  }


  async findcontentfilter(keys: string, postType: string, skip: number, limit: number) {

    const query = await this.getusercontentsModel.aggregate([
      {
        $match: {
          $or: [{
            description: {
              $regex: keys, $options: 'i'
            }, postType: postType, visibility: "PUBLIC", active: true
          }, {
            tags: {
              $regex: keys, $options: 'i'
            }, postType: postType, visibility: "PUBLIC", active: true
          }]
        }
      },


      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          reaction: '$reaction',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visibility: '$visibility',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: {
            $cond: { if: { $eq: ["$saleLike", -1] }, then: false, else: "$saleLike" }
          },
          saleView: {
            $cond: { if: { $eq: ["$saleView", -1] }, then: false, else: "$saleView" }
          },
          saleAmount: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: 0, else: "$saleAmount" }
          },
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },


        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          isOwned: '$isOwned',
          visibility: '$visibility',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          refe: '$refs.ref',
          insight: {
            shares: '$shares',
            comments: '$comments',
            reaction: '$reaction',
            views: '$views',
            likes: '$likes',
          },
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
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
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          // insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          isOwned: '$isOwned',
          visibility: '$visibility',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          insight: '$insight',



        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$postID"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$postID"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$postID"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$postID"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$postID"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          isOwned: '$isOwned',
          visibility: '$visibility',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          insight: '$insight',

        }
      },
      { $sort: { description: -1 }, },
      { $skip: skip },
      { $limit: limit },
    ]);
    return query;
  }


  async findcontentfilterTags(keys: string, skip: number, limit: number) {

    const query = await this.getusercontentsModel.aggregate([
      {
        $match: {

          tags: {
            $regex: keys, $options: 'i'
          }

        }
      },
      { $sort: { tags: 1 }, },
      { $skip: skip },
      { $limit: limit },
      {
        $group: {
          _id: '$tags',
          total: {
            $sum: 1
          }
        }
      }
    ]);
    return query;
  }

  async findcontentAllTags(skip: number, limit: number) {

    const query = await this.getusercontentsModel.aggregate([


      {
        $group: {
          _id: '$tags',
          total: {
            $sum: 1
          }
        }
      },
      { $sort: { tags: 1 }, },
      { $skip: skip },
      { $limit: limit },
    ]);
    return query;
  }


  async findcontentfilterbyuser(username: string, postType: string, skip: number, limit: number) {

    const query = await this.getusercontentsModel.aggregate([


      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visibility: '$visibility',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: {
            $cond: { if: { $eq: ["$saleLike", -1] }, then: false, else: "$saleLike" }
          },
          saleView: {
            $cond: { if: { $eq: ["$saleView", -1] }, then: false, else: "$saleView" }
          },
          saleAmount: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: 0, else: "$saleAmount" }
          },
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },
        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visibility: '$visibility',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
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
          "userAuth_data.username": username,
          "postType": postType
        }
      },

      {
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          // insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: '$userAuth_data',
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visibility: '$visibility',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',


        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$postID"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$postID"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$postID"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$postID"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$postID"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          visibility: '$visibility',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',

        }
      },
      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },
    ]);
    return query;
  }

  async findcontentfilterbyuserCount(username: string, postType: string) {

    const query = await this.getusercontentsModel.aggregate([


      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: {
            $cond: { if: { $eq: ["$saleLike", -1] }, then: false, else: "$saleLike" }
          },
          saleView: {
            $cond: { if: { $eq: ["$saleView", -1] }, then: false, else: "$saleView" }
          },
          saleAmount: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: 0, else: "$saleAmount" }
          },
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },
        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
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
          "userAuth_data.username": username,
          "postType": postType
        }
      },

      {
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          // insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: '$userAuth_data',
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',


        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },

          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',

        }
      },
      { $sort: { createdAt: -1 }, }
    ]);
    return query;
  }
  async findPostIDsByEmail(email: string) {
    const posts = await this.getusercontentsModel.find({
      "email": email,
    }, {
      postID: 1, _id: 0
    });
    var postIDs = [];
    for (var i = 0; i < posts.length; i++) {
      postIDs.push(posts[i].postID);
    }
    // console.log(postIDs);
    return postIDs;
  }


  async databasenew(buy: string, report: string, iduser: Object, username: string, description: string, kepemilikan: any[], statusjual: any[], postType: any[], kategori: any[], startdate: string, enddate: string, startmount: number, endmount: number, descending: boolean, page: number, limit: number, popular: any) {

    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();

      var dt = dateend.substring(0, 10);
    } catch (e) {
      dateend = "";
    }

    var order = null;

    if (descending === true) {
      order = -1;
    } else {
      order = 1;
    }

    var arrkategori = [];
    var idkategori = null;
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    var lengkategori = null;

    try {
      lengkategori = kategori.length;
    } catch (e) {
      lengkategori = 0;
    }
    if (lengkategori > 0) {

      for (let i = 0; i < lengkategori; i++) {
        let idkat = kategori[i];
        idkategori = mongoose.Types.ObjectId(idkat);
        arrkategori.push(idkategori);
      }
    }

    var pipeline = [];
    if (popular !== undefined && popular === true) {
      pipeline.push({
        $sort: {
          views: - 1,
          likes: - 1
        },

      },);
    } else {
      pipeline.push({
        $sort: {
          createdAt: order
        },

      },);
    }

    if (iduser && iduser !== undefined) {
      pipeline.push(
        {

          $match: {

            active: true
          }
        },
        {
          "$lookup": {
            "from": "userbasics",
            "as": "databasic",
            "let": {
              "local_id": "$email",

            },
            "pipeline": [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$email', '$$local_id']
                  }
                }
              },
              {
                $project: {
                  iduser: "$_id",

                }
              },

            ],

          },

        },
        {
          $unwind: {
            path: "$databasic",

          }
        },
        {
          $match: {
            'databasic.iduser': iduser,

          }
        },
        {
          $addFields: {

            salePrice: {
              $cmp: ["$saleAmount", 0]
            },
            sLike: {
              $cmp: ["$saleLike", 0]
            },
            sView: {
              $cmp: ["$saleView", 0]
            },
            certi: {
              $cmp: ["$certified", 0]
            },
            reportedCount: {
              $cmp: ["$reportedUserCount", 0]
            },

          }
        },
        {
          $lookup: {
            from: 'userauths',
            localField: 'email',
            foreignField: 'email',
            as: 'authdata',

          }
        },
        {
          "$lookup": {
            "from": "userbasics",
            "as": "basicdata",
            "let": {
              "local_id": "$email",

            },
            "pipeline": [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$email', '$$local_id']
                  }
                }
              },
              {
                $project: {
                  iduser: "$_id",

                }
              },

            ],

          },

        },
        {
          "$lookup": {
            "from": "transactions",
            "as": "trans",
            "let": {
              "local_id": "$postID",

            },
            "pipeline": [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$postid', '$$local_id']
                  }
                }
              },
              {
                $project: {
                  iduserbuyer: 1,
                  idusersell: 1,
                  noinvoice: 1,
                  status: 1,
                  amount: 1,
                  timestamp: 1
                }
              },
              {
                $match: {
                  "iduserbuyer": iduser,
                  "status": "Success"
                }
              },
              {
                $sort: {
                  timestamp: - 1
                },

              },
              {
                $limit: 1
              },
              {
                "$lookup": {
                  "from": "userbasics",
                  "as": "penjual",
                  "let": {
                    "local_id": "$idusersell"
                  },
                  "pipeline": [
                    {
                      "$match": {
                        "$expr": {
                          "$eq": [
                            "$_id",
                            "$$local_id"
                          ]
                        }
                      }
                    },
                    {
                      $project: {
                        email: 1
                      }
                    },

                  ],

                }
              },
              {
                $project: {
                  emailpenjual: {
                    $arrayElemAt: ['$penjual.email', 0]
                  },
                  amount: 1,
                  status: 1,
                  noinvoice: 1,
                  timestamp: 1
                }
              },
              {
                "$lookup": {
                  "from": "userauths",
                  "as": "authpenjual",
                  "let": {
                    "local_id": "$emailpenjual"
                  },
                  "pipeline": [
                    {
                      "$match": {
                        "$expr": {
                          "$eq": [
                            "$email",
                            "$$local_id"
                          ]
                        }
                      }
                    },

                  ],

                }
              },
              {
                $project: {
                  penjual: {
                    $arrayElemAt: ['$authpenjual.username', 0]
                  },
                  amount: 1,
                  status: 1,
                  noinvoice: 1,
                  timestamp: 1
                }
              },

            ],

          },

        },
        {
          $addFields: {


            'auth': {
              $arrayElemAt: ['$authdata', 0]
            },
            'iduser': {
              $arrayElemAt: ['$basicdata.iduser', 0]
            },

          }
        },
        {
          "$lookup": {
            "from": "interests_repo",
            "as": "kategori",
            "let": {
              "local_id": "$category.$id",

            },
            "pipeline": [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {

                        $in: ['$_id', {
                          $ifNull: ['$$local_id', []]
                        }]
                      }
                    },

                  ]
                }
              },
              {
                $project: {
                  interestName: 1,

                }
              },

            ],

          },

        },
        {
          $project: {
            refs: {
              $arrayElemAt: ['$contentMedias', 0]
            },
            username: "$auth.username",
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            iduser: 1,
            email: 1,
            postType: 1,
            views: 1,
            likes: 1,
            comments: 1,
            shares: 1,
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            reportedUserCount: 1,
            trans:
            {
              $size: "$trans"
            },
            certified:
            {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$certi", - 1]
                  }, {
                    $eq: ["$certi", 0]
                  }]
                },
                then: false,
                else: "$certified"
              }
            },
            tr: "$trans",
            visibility: 1,
            saleAmount: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$salePrice", - 1]
                  }, {
                    $eq: ["$salePrice", 0]
                  }]
                },
                then: 0,
                else: "$saleAmount"
              }
            },
            monetize: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$salePrice", - 1]
                  }, {
                    $eq: ["$salePrice", 0]
                  }]
                },
                then: false,
                else: true
              }
            },
            reported: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$reportedCount", - 1]
                  }, {
                    $eq: ["$reportedCount", 0]
                  }]
                },
                then: "TIDAK",
                else: "YA"
              }
            },

          }
        },
        {
          $project: {
            refs: '$refs.$ref',
            idmedia: '$refs.$id',
            username: 1,
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            postType: 1,
            iduser: 1,
            email: 1,
            reported: 1,
            views: 1,
            likes: 1,
            shares: 1,
            comments: 1,
            tr: 1,
            buy: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$trans", 0]
                  }]
                },
                then: "TIDAK",
                else: "YA"
              }
            },
            type: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$postType', 'pict']
                    },
                    'then': "HyppePic"
                  },
                  {
                    'case': {
                      '$eq': ['$postType', 'vid']
                    },
                    'then': "HyppeVid"
                  },
                  {
                    'case': {
                      '$eq': ['$postType', 'diary']
                    },
                    'then': "HyppeDiary"
                  },
                  {
                    'case': {
                      '$eq': ['$postType', 'story']
                    },
                    'then': "HyppeStory"
                  },

                ],
                default: ''
              }
            },
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            kepemilikan:
            {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$certified", false]
                  }, {
                    $eq: ["$certified", ""]
                  }]
                },
                then: "TIDAK",
                else: "YA"
              }
            },
            visibility: 1,
            saleAmount: 1,
            statusJual:
            {
              $cond: {
                if: {

                  $eq: ["$monetize", false]
                },
                then: "TIDAK",
                else: "YA"
              }
            },

          }
        },
        {
          $lookup: {
            from: 'mediapicts',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',

          },

        },
        {
          $lookup: {
            from: 'mediadiaries',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',

          },

        },
        {
          $lookup: {
            from: 'mediavideos',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediavideos_data',

          },

        },
        {
          $lookup: {
            from: 'mediastories',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediastories_data',

          },

        },
        {
          $project: {
            mediapict: {
              $arrayElemAt: ['$mediaPict_data', 0]
            },
            mediadiaries: {
              $arrayElemAt: ['$mediadiaries_data', 0]
            },
            mediavideos: {
              $arrayElemAt: ['$mediavideos_data', 0]
            },
            mediastories: {
              $arrayElemAt: ['$mediastories_data', 0]
            },
            refs: 1,
            idmedia: 1,
            username: 1,
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            postType: 1,
            iduser: 1,
            email: 1,
            views: 1,
            likes: 1,
            shares: 1,
            comments: 1,
            type: 1,
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            kepemilikan: 1,
            visibility: 1,
            amount: "$saleAmount",
            statusJual: 1,
            reported: 1,
            buy: 1,
            tr: 1,

          }
        },
        {
          $addFields: {


            pict: {
              $replaceOne: {
                input: "$profilpict.mediaUri",
                find: "_0001.jpeg",
                replacement: ""
              }
            },
            concatmediapict: '/pict',
            media_pict: {
              $replaceOne: {
                input: "$mediapict.mediaUri",
                find: "_0001.jpeg",
                replacement: ""
              }
            },
            concatmediadiari: '/stream',
            concatthumbdiari: '/thumb',
            media_diari: '$mediadiaries.mediaUri',
            concatmediavideo: '/stream',
            concatthumbvideo: '/thumb',
            media_video: '$mediavideos.mediaUri',
            concatmediastory:
            {
              $cond: {
                if: {

                  $eq: ["$mediastories.mediaType", "image"]
                },
                then: '/pict',
                else: '/stream',

              }
            },
            concatthumbstory: '/thumb',
            media_story: '$mediastories.mediaUri'
          },

        },
        {
          $project: {

            username: 1,
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            postType: 1,
            iduser: 1,
            tr: 1,
            email: 1,
            type: 1,
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            kepemilikan: 1,
            visibility: 1,
            saleAmount: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$buy", "TIDAK"]
                  },]
                },
                then: "$amount",
                else: {
                  $arrayElemAt: ['$tr.amount', 0]
                }
              }
            },
            penjual: {
              $arrayElemAt: ['$tr.penjual', 0]
            },
            statusJual: 1,
            reported: 1,
            buy: 1,
            views: 1,
            likes: 1,
            shares: 1,
            comments: 1,
            mediaBasePath: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$refs', 'mediapicts']
                    },
                    'then': '$mediapict.mediaBasePath'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediadiaries']
                    },
                    'then': '$mediadiaries.mediaBasePath'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediavideos']
                    },
                    'then': '$mediavideos.mediaBasePath'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediastories']
                    },
                    'then': '$mediastories.mediaBasePath'
                  }
                ],
                default: ''
              }
            },
            mediaUri: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$refs', 'mediapicts']
                    },
                    'then': '$mediapict.mediaUri'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediadiaries']
                    },
                    'then': '$mediadiaries.mediaUri'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediavideos']
                    },
                    'then': '$mediavideos.mediaUri'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediastories']
                    },
                    'then': '$mediastories.mediaUri'
                  }
                ],
                default: ''
              }
            },
            mediaType: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$refs', 'mediapicts']
                    },
                    'then': '$mediapict.mediaType'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediadiaries']
                    },
                    'then': '$mediadiaries.mediaType'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediavideos']
                    },
                    'then': '$mediavideos.mediaType'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediastories']
                    },
                    'then': '$mediastories.mediaType'
                  }
                ],
                default: ''
              }
            },
            mediaThumbEndpoint: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$refs', 'mediapicts']
                    },
                    'then': '$mediadiaries.mediaThumb'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediadiaries']
                    },
                    'then': {
                      $concat: ["$concatthumbdiari", "/", "$postID"]
                    },

                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediavideos']
                    },
                    'then': {
                      $concat: ["$concatthumbvideo", "/", "$postID"]
                    },

                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediastories']
                    },
                    'then': {
                      $concat: ["$concatthumbstory", "/", "$postID"]
                    },

                  },

                ],
                default: ''
              }
            },
            mediaEndpoint: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$refs', 'mediapicts']
                    },
                    'then': {
                      $concat: ["$concatmediapict", "/", "$postID"]
                    },

                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediadiaries']
                    },
                    'then': {
                      $concat: ["$concatmediadiari", "/", "$postID"]
                    },

                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediavideos']
                    },
                    'then': {
                      $concat: ["$concatmediavideo", "/", "$postID"]
                    },

                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediastories']
                    },
                    'then': {
                      $concat: ["$concatmediastory", "/", "$postID"]
                    },

                  }
                ],
                default: ''
              }
            },
            mediaThumbUri: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$refs', 'mediapicts']
                    },
                    'then': '$mediadiaries.mediaThumb'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediadiaries']
                    },
                    'then': '$mediadiaries.mediaThumb'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediavideos']
                    },
                    'then': '$mediavideos.mediaThumb'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediastories']
                    },
                    'then': '$mediastories.mediaThumb'
                  }
                ],
                default: ''
              }
            },
            apsaraId: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediapicts"
                      ]
                    },
                    then: "$mediapict.apsaraId"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediadiaries"
                      ]
                    },
                    then: "$mediadiaries.apsaraId"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediavideos"
                      ]
                    },
                    then: "$mediavideos.apsaraId"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediastories"
                      ]
                    },
                    then: "$mediastories.apsaraId"
                  }
                ],
                default: false
              }
            },
            apsara: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediapicts"
                      ]
                    },
                    then: "$mediapict.apsara"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediadiaries"
                      ]
                    },
                    then: "$mediadiaries.apsara"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediavideos"
                      ]
                    },
                    then: "$mediavideos.apsara"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediastories"
                      ]
                    },
                    then: "$mediastories.apsara"
                  }
                ],
                default: false
              }
            },

          }
        },
        {
          $project: {

            username: 1,
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            postType: 1,
            iduser: 1,
            email: 1,
            type: 1,
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            kepemilikan: 1,
            visibility: 1,
            saleAmount: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$saleAmount", null]
                  },]
                },
                then: 0,
                else: "$saleAmount"
              }
            },
            statusJual: 1,
            reported: 1,
            buy: 1,
            views: 1,
            likes: 1,
            shares: 1,
            comments: 1,
            mediaBasePath: 1,
            mediaUri: 1,
            mediaType: 1,
            mediaThumbEndpoint: 1,
            mediaEndpoint: 1,
            mediaThumbUri: 1,
            apsaraId: 1,
            apsara: 1,
            penjual: 1,

          }
        },
      );

    }
    else {
      pipeline.push(
        {

          $match: {

            active: true
          }
        },
        {
          $addFields: {

            salePrice: {
              $cmp: ["$saleAmount", 0]
            },
            sLike: {
              $cmp: ["$saleLike", 0]
            },
            sView: {
              $cmp: ["$saleView", 0]
            },
            certi: {
              $cmp: ["$certified", 0]
            },
            reportedCount: {
              $cmp: ["$reportedUserCount", 0]
            },

          }
        },

        {
          $lookup: {
            from: 'userauths',
            localField: 'email',
            foreignField: 'email',
            as: 'authdata',

          }
        },

        {
          $addFields: {


            'auth': {
              $arrayElemAt: ['$authdata', 0]
            },

          }
        },
        {
          "$lookup": {
            "from": "interests_repo",
            "as": "kategori",
            "let": {
              "local_id": "$category.$id",

            },
            "pipeline": [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {

                        $in: ['$_id', {
                          $ifNull: ['$$local_id', []]
                        }]
                      }
                    },

                  ]
                }
              },
              {
                $project: {
                  interestName: 1,

                }
              },

            ],

          },

        },
        {
          $project: {
            refs: {
              $arrayElemAt: ['$contentMedias', 0]
            },
            username: "$auth.username",
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            email: 1,
            postType: 1,
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            reportedUserCount: 1,
            views: 1,
            likes: 1,
            shares: 1,
            comments: 1,
            certified:
            {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$certi", - 1]
                  }, {
                    $eq: ["$certi", 0]
                  }]
                },
                then: false,
                else: "$certified"
              }
            },
            visibility: 1,
            saleAmount: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$salePrice", - 1]
                  }, {
                    $eq: ["$salePrice", 0]
                  }]
                },
                then: 0,
                else: "$saleAmount"
              }
            },
            monetize: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$salePrice", - 1]
                  }, {
                    $eq: ["$salePrice", 0]
                  }]
                },
                then: false,
                else: true
              }
            },
            reported: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$reportedCount", - 1]
                  }, {
                    $eq: ["$reportedCount", 0]
                  }]
                },
                then: "TIDAK",
                else: "YA"
              }
            },

          }
        },
        {
          $project: {
            refs: '$refs.$ref',
            idmedia: '$refs.$id',
            username: 1,
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            postType: 1,
            email: 1,
            reported: 1,
            views: 1,
            likes: 1,
            shares: 1,
            comments: 1,
            type: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$postType', 'pict']
                    },
                    'then': "HyppePic"
                  },
                  {
                    'case': {
                      '$eq': ['$postType', 'vid']
                    },
                    'then': "HyppeVid"
                  },
                  {
                    'case': {
                      '$eq': ['$postType', 'diary']
                    },
                    'then': "HyppeDiary"
                  },
                  {
                    'case': {
                      '$eq': ['$postType', 'story']
                    },
                    'then': "HyppeStory"
                  },

                ],
                default: ''
              }
            },
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            kepemilikan:
            {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$certified", false]
                  }, {
                    $eq: ["$certified", ""]
                  }]
                },
                then: "TIDAK",
                else: "YA"
              }
            },
            visibility: 1,
            saleAmount: 1,
            statusJual:
            {
              $cond: {
                if: {

                  $eq: ["$monetize", false]
                },
                then: "TIDAK",
                else: "YA"
              }
            },

          }
        },
        {
          $lookup: {
            from: 'mediapicts',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',

          },

        },
        {
          $lookup: {
            from: 'mediadiaries',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',

          },

        },
        {
          $lookup: {
            from: 'mediavideos',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediavideos_data',

          },

        },
        {
          $lookup: {
            from: 'mediastories',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediastories_data',

          },

        },
        {
          $project: {
            mediapict: {
              $arrayElemAt: ['$mediaPict_data', 0]
            },
            mediadiaries: {
              $arrayElemAt: ['$mediadiaries_data', 0]
            },
            mediavideos: {
              $arrayElemAt: ['$mediavideos_data', 0]
            },
            mediastories: {
              $arrayElemAt: ['$mediastories_data', 0]
            },
            refs: 1,
            idmedia: 1,
            username: 1,
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            postType: 1,
            iduser: 1,
            email: 1,
            type: 1,
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            kepemilikan: 1,
            visibility: 1,
            saleAmount: 1,
            statusJual: 1,
            reported: 1,
            views: 1,
            likes: 1,
            shares: 1,
            comments: 1,
          }
        },
        {
          $addFields: {


            pict: {
              $replaceOne: {
                input: "$profilpict.mediaUri",
                find: "_0001.jpeg",
                replacement: ""
              }
            },
            concatmediapict: '/pict',
            media_pict: {
              $replaceOne: {
                input: "$mediapict.mediaUri",
                find: "_0001.jpeg",
                replacement: ""
              }
            },
            concatmediadiari: '/stream',
            concatthumbdiari: '/thumb',
            media_diari: '$mediadiaries.mediaUri',
            concatmediavideo: '/stream',
            concatthumbvideo: '/thumb',
            media_video: '$mediavideos.mediaUri',
            concatmediastory:
            {
              $cond: {
                if: {

                  $eq: ["$mediastories.mediaType", "image"]
                },
                then: '/pict',
                else: '/stream',

              }
            },
            concatthumbstory: '/thumb',
            media_story: '$mediastories.mediaUri'
          },

        },
        {
          $project: {

            username: 1,
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            postType: 1,
            email: 1,
            type: 1,
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            kepemilikan: 1,
            visibility: 1,
            saleAmount: 1,
            statusJual: 1,
            reported: 1,
            views: 1,
            likes: 1,
            shares: 1,
            comments: 1,
            mediaBasePath: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$refs', 'mediapicts']
                    },
                    'then': '$mediapict.mediaBasePath'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediadiaries']
                    },
                    'then': '$mediadiaries.mediaBasePath'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediavideos']
                    },
                    'then': '$mediavideos.mediaBasePath'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediastories']
                    },
                    'then': '$mediastories.mediaBasePath'
                  }
                ],
                default: ''
              }
            },
            mediaUri: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$refs', 'mediapicts']
                    },
                    'then': '$mediapict.mediaUri'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediadiaries']
                    },
                    'then': '$mediadiaries.mediaUri'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediavideos']
                    },
                    'then': '$mediavideos.mediaUri'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediastories']
                    },
                    'then': '$mediastories.mediaUri'
                  }
                ],
                default: ''
              }
            },
            mediaType: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$refs', 'mediapicts']
                    },
                    'then': '$mediapict.mediaType'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediadiaries']
                    },
                    'then': '$mediadiaries.mediaType'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediavideos']
                    },
                    'then': '$mediavideos.mediaType'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediastories']
                    },
                    'then': '$mediastories.mediaType'
                  }
                ],
                default: ''
              }
            },
            mediaThumbEndpoint: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$refs', 'mediapicts']
                    },
                    'then': '$mediadiaries.mediaThumb'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediadiaries']
                    },
                    'then': {
                      $concat: ["$concatthumbdiari", "/", "$postID"]
                    },

                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediavideos']
                    },
                    'then': {
                      $concat: ["$concatthumbvideo", "/", "$postID"]
                    },

                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediastories']
                    },
                    'then': {
                      $concat: ["$concatthumbstory", "/", "$postID"]
                    },

                  },

                ],
                default: ''
              }
            },
            mediaEndpoint: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$refs', 'mediapicts']
                    },
                    'then': {
                      $concat: ["$concatmediapict", "/", "$postID"]
                    },

                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediadiaries']
                    },
                    'then': {
                      $concat: ["$concatmediadiari", "/", "$postID"]
                    },

                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediavideos']
                    },
                    'then': {
                      $concat: ["$concatmediavideo", "/", "$postID"]
                    },

                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediastories']
                    },
                    'then': {
                      $concat: ["$concatmediastory", "/", "$postID"]
                    },

                  }
                ],
                default: ''
              }
            },
            mediaThumbUri: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$refs', 'mediapicts']
                    },
                    'then': '$mediadiaries.mediaThumb'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediadiaries']
                    },
                    'then': '$mediadiaries.mediaThumb'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediavideos']
                    },
                    'then': '$mediavideos.mediaThumb'
                  },
                  {
                    'case': {
                      '$eq': ['$refs', 'mediastories']
                    },
                    'then': '$mediastories.mediaThumb'
                  }
                ],
                default: ''
              }
            },
            apsaraId: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediapicts"
                      ]
                    },
                    then: "$mediapict.apsaraId"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediadiaries"
                      ]
                    },
                    then: "$mediadiaries.apsaraId"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediavideos"
                      ]
                    },
                    then: "$mediavideos.apsaraId"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediastories"
                      ]
                    },
                    then: "$mediastories.apsaraId"
                  }
                ],
                default: false
              }
            },
            apsara: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediapicts"
                      ]
                    },
                    then: "$mediapict.apsara"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediadiaries"
                      ]
                    },
                    then: "$mediadiaries.apsara"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediavideos"
                      ]
                    },
                    then: "$mediavideos.apsara"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediastories"
                      ]
                    },
                    then: "$mediastories.apsara"
                  }
                ],
                default: false
              }
            },

          }
        },
      );
    }


    if (username && username !== undefined) {

      pipeline.push({
        $match: {
          username: {
            $regex: username,
            $options: 'i'
          },

        }
      },);

    }


    if (description && description !== undefined) {

      pipeline.push({
        $match: {
          description: {
            $regex: description,
            $options: 'i'
          },

        }
      },);

    }

    if (kepemilikan && kepemilikan !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              kepemilikan: {
                $in: kepemilikan
              }
            },

          ]
        }
      },);
    }

    if (statusjual && statusjual !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              statusJual: {
                $in: statusjual
              }
            },

          ]
        }
      },);
    }
    if (buy !== undefined && buy === "YA") {
      pipeline.push({
        $match: {
          buy: buy
        }
      },);
    }
    if (report && report !== undefined) {
      pipeline.push({
        $match: {
          reported: report
        }
      },);
    }

    if (kategori && kategori !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              'kategori._id': {
                $in: arrkategori
              }
            },

          ]
        }
      },);
    }
    if (postType && postType !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              type: {
                $in: postType
              }
            },

          ]
        }
      },);
    }
    if (startmount && startmount !== undefined) {
      pipeline.push({ $match: { saleAmount: { $gte: startmount } } });
    }
    if (endmount && endmount !== undefined) {
      pipeline.push({ $match: { saleAmount: { $lte: endmount } } });
    }
    if (startdate && startdate !== undefined) {
      pipeline.push({ $match: { createdAt: { $gte: startdate } } });
    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { createdAt: { $lte: dt } } });
    }



    if (page > 0) {
      pipeline.push({ $skip: (page * limit) });
    }
    if (limit > 0) {
      pipeline.push({ $limit: limit });
    }

    let query = await this.getusercontentsModel.aggregate(pipeline);


    var data = [];

    for (var i = 0; i < query.length; i++) {
      let dataconten = await this.getapsaraDatabase(query, i);

      data.push(dataconten[i]);
    }

    return data;
  }

  async databasenewcount(buy: string, report: string, iduser: Object, username: string, description: string, kepemilikan: any[], statusjual: any[], postType: any[], kategori: any[], startdate: string, enddate: string, startmount: number, endmount: number, descending: boolean) {

    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();

      var dt = dateend.substring(0, 10);
    } catch (e) {
      dateend = "";
    }

    var order = null;

    if (descending === true) {
      order = -1;
    } else {
      order = 1;
    }

    var arrkategori = [];
    var idkategori = null;
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    var lengkategori = null;

    try {
      lengkategori = kategori.length;
    } catch (e) {
      lengkategori = 0;
    }
    if (lengkategori > 0) {

      for (let i = 0; i < lengkategori; i++) {
        let idkat = kategori[i];
        idkategori = mongoose.Types.ObjectId(idkat);
        arrkategori.push(idkategori);
      }
    }

    var pipeline = [];




    if (iduser && iduser !== undefined) {
      pipeline.push(
        {

          $match: {

            active: true
          }
        },
        {
          $addFields: {

            salePrice: {
              $cmp: ["$saleAmount", 0]
            },
            sLike: {
              $cmp: ["$saleLike", 0]
            },
            sView: {
              $cmp: ["$saleView", 0]
            },
            certi: {
              $cmp: ["$certified", 0]
            },
            reportedCount: {
              $cmp: ["$reportedUserCount", 0]
            },

          }
        },

        {
          $lookup: {
            from: 'userauths',
            localField: 'email',
            foreignField: 'email',
            as: 'authdata',

          }
        },
        {
          "$lookup": {
            "from": "userbasics",
            "as": "basicdata",
            "let": {
              "local_id": "$email",

            },
            "pipeline": [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$email', '$$local_id']
                  }
                }
              },
              {
                $project: {
                  iduser: "$_id",

                }
              },


            ],

          },

        },
        {
          "$lookup": {
            "from": "transactions",
            "as": "trans",
            "let": {
              "local_id": "$postID",

            },
            "pipeline": [
              {
                $match:
                {
                  $expr: {
                    $eq: ['$postid', '$$local_id']
                  }
                }
              },
              {
                $project: {
                  iduserbuyer: 1,
                  status: 1,
                  timestamp: 1
                }
              },
              {
                $match: {
                  "iduserbuyer": iduser,
                  "status": "Success"
                }
              },
              {
                $sort: {
                  timestamp: - 1
                },

              },
              {
                $limit: 1
              },

            ],

          },

        },
        {
          $addFields: {


            'auth': {
              $arrayElemAt: ['$authdata', 0]
            },
            'iduser': {
              $arrayElemAt: ['$basicdata.iduser', 0]
            },


          }
        },
        {
          "$lookup": {
            "from": "interests_repo",
            "as": "kategori",
            "let": {
              "local_id": "$category.$id",

            },
            "pipeline": [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {

                        $in: ['$_id', {
                          $ifNull: ['$$local_id', []]
                        }]
                      }
                    },

                  ]
                }
              },
              {
                $project: {
                  interestName: 1,

                }
              },

            ],

          },

        },
        {
          $project: {

            username: "$auth.username",
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            iduser: 1,
            email: 1,
            postType: 1,
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            reportedUserCount: 1,
            trans:
            {
              $size: "$trans"
            },
            certified:
            {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$certi", - 1]
                  }, {
                    $eq: ["$certi", 0]
                  }]
                },
                then: false,
                else: "$certified"
              }
            },
            visibility: 1,
            saleAmount: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$salePrice", - 1]
                  }, {
                    $eq: ["$salePrice", 0]
                  }]
                },
                then: 0,
                else: "$saleAmount"
              }
            },
            monetize: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$salePrice", - 1]
                  }, {
                    $eq: ["$salePrice", 0]
                  }]
                },
                then: false,
                else: true
              }
            },
            reported: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$reportedCount", - 1]
                  }, {
                    $eq: ["$reportedCount", 0]
                  }]
                },
                then: "TIDAK",
                else: "YA"
              }
            },

          }
        },
        {
          $project: {

            username: 1,
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            postType: 1,
            iduser: 1,
            email: 1,
            reported: 1,
            buy: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$trans", 0]
                  }]
                },
                then: "TIDAK",
                else: "YA"
              }
            },
            type: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$postType', 'pict']
                    },
                    'then': "HyppePic"
                  },
                  {
                    'case': {
                      '$eq': ['$postType', 'vid']
                    },
                    'then': "HyppeVid"
                  },
                  {
                    'case': {
                      '$eq': ['$postType', 'diary']
                    },
                    'then': "HyppeDiary"
                  },
                  {
                    'case': {
                      '$eq': ['$postType', 'story']
                    },
                    'then': "HyppeStory"
                  },

                ],
                default: ''
              }
            },
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            kepemilikan:
            {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$certified", false]
                  }, {
                    $eq: ["$certified", ""]
                  }]
                },
                then: "TIDAK",
                else: "YA"
              }
            },
            visibility: 1,
            saleAmount: 1,
            statusJual:
            {
              $cond: {
                if: {

                  $eq: ["$monetize", false]
                },
                then: "TIDAK",
                else: "YA"
              }
            },

          }
        },

        {
          $project: {


            username: 1,
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            postType: 1,
            iduser: 1,
            email: 1,
            type: 1,
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            kepemilikan: 1,
            visibility: 1,
            saleAmount: 1,
            statusJual: 1,
            reported: 1,
            buy: 1,

          }
        },

        {
          $project: {

            username: 1,
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            postType: 1,
            iduser: 1,
            email: 1,
            type: 1,
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            kepemilikan: 1,
            visibility: 1,
            saleAmount: 1,
            statusJual: 1,
            reported: 1,
            buy: 1,


          }
        },
        {
          $match: {
            iduser: iduser
          }
        }
      );


    } else {
      pipeline.push(
        {

          $match: {

            active: true
          }
        },
        {
          $addFields: {

            salePrice: {
              $cmp: ["$saleAmount", 0]
            },
            sLike: {
              $cmp: ["$saleLike", 0]
            },
            sView: {
              $cmp: ["$saleView", 0]
            },
            certi: {
              $cmp: ["$certified", 0]
            },
            reportedCount: {
              $cmp: ["$reportedUserCount", 0]
            },

          }
        },

        {
          $lookup: {
            from: 'userauths',
            localField: 'email',
            foreignField: 'email',
            as: 'authdata',

          }
        },

        {
          $addFields: {


            'auth': {
              $arrayElemAt: ['$authdata', 0]
            },

          }
        },
        {
          "$lookup": {
            "from": "interests_repo",
            "as": "kategori",
            "let": {
              "local_id": "$category.$id",

            },
            "pipeline": [
              {
                $match:
                {
                  $and: [
                    {
                      $expr: {

                        $in: ['$_id', {
                          $ifNull: ['$$local_id', []]
                        }]
                      }
                    },

                  ]
                }
              },
              {
                $project: {
                  interestName: 1,

                }
              },

            ],

          },

        },
        {
          $project: {

            username: "$auth.username",
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            email: 1,
            postType: 1,
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            reportedUserCount: 1,
            certified:
            {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$certi", - 1]
                  }, {
                    $eq: ["$certi", 0]
                  }]
                },
                then: false,
                else: "$certified"
              }
            },
            visibility: 1,
            saleAmount: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$salePrice", - 1]
                  }, {
                    $eq: ["$salePrice", 0]
                  }]
                },
                then: 0,
                else: "$saleAmount"
              }
            },
            monetize: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$salePrice", - 1]
                  }, {
                    $eq: ["$salePrice", 0]
                  }]
                },
                then: false,
                else: true
              }
            },
            reported: {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$reportedCount", - 1]
                  }, {
                    $eq: ["$reportedCount", 0]
                  }]
                },
                then: "TIDAK",
                else: "YA"
              }
            },

          }
        },
        {
          $project: {

            username: 1,
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            postType: 1,
            email: 1,
            reported: 1,
            type: {
              $switch: {
                branches: [
                  {
                    'case': {
                      '$eq': ['$postType', 'pict']
                    },
                    'then': "HyppePic"
                  },
                  {
                    'case': {
                      '$eq': ['$postType', 'vid']
                    },
                    'then': "HyppeVid"
                  },
                  {
                    'case': {
                      '$eq': ['$postType', 'diary']
                    },
                    'then': "HyppeDiary"
                  },
                  {
                    'case': {
                      '$eq': ['$postType', 'story']
                    },
                    'then': "HyppeStory"
                  },

                ],
                default: ''
              }
            },
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            kepemilikan:
            {
              $cond: {
                if: {
                  $or: [{
                    $eq: ["$certified", false]
                  }, {
                    $eq: ["$certified", ""]
                  }]
                },
                then: "TIDAK",
                else: "YA"
              }
            },
            visibility: 1,
            saleAmount: 1,
            statusJual:
            {
              $cond: {
                if: {

                  $eq: ["$monetize", false]
                },
                then: "TIDAK",
                else: "YA"
              }
            },

          }
        },

        {
          $project: {


            username: 1,
            createdAt: 1,
            updatedAt: 1,
            postID: 1,
            postType: 1,
            email: 1,
            type: 1,
            description: 1,
            title: 1,
            active: 1,
            kategori: 1,
            kepemilikan: 1,
            visibility: 1,
            saleAmount: 1,
            statusJual: 1,
            reported: 1

          }
        },



      );
    }

    if (username && username !== undefined) {

      pipeline.push({
        $match: {
          username: {
            $regex: username,
            $options: 'i'
          },

        }
      },);

    }



    if (description && description !== undefined) {

      pipeline.push({
        $match: {
          description: {
            $regex: description,
            $options: 'i'
          },

        }
      },);

    }

    if (kepemilikan && kepemilikan !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              kepemilikan: {
                $in: kepemilikan
              }
            },

          ]
        }
      },);
    }

    if (statusjual && statusjual !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              statusJual: {
                $in: statusjual
              }
            },

          ]
        }
      },);
    }

    if (kategori && kategori !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              'kategori._id': {
                $in: arrkategori
              }
            },

          ]
        }
      },);
    }
    if (postType && postType !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              type: {
                $in: postType
              }
            },

          ]
        }
      },);
    }

    if (buy !== undefined && buy === "YA") {
      pipeline.push({
        $match: {
          buy: buy
        }
      },);
    }
    if (report && report !== undefined) {
      pipeline.push({
        $match: {
          reported: report
        }
      },);
    }
    if (startmount && startmount !== undefined) {
      pipeline.push({ $match: { saleAmount: { $gte: startmount } } });
    }
    if (endmount && endmount !== undefined) {
      pipeline.push({ $match: { saleAmount: { $lte: endmount } } });
    }
    if (startdate && startdate !== undefined) {
      pipeline.push({ $match: { createdAt: { $gte: startdate } } });
    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { createdAt: { $lte: dt } } });
    }

    pipeline.push({
      $group: {
        _id: null,
        totalpost: {
          $sum: 1
        }
      }
    });

    let query = await this.getusercontentsModel.aggregate(pipeline);

    return query;
  }

  async detailcontent(postID: string, page: number, limit: number) {
    let query = await this.getusercontentsModel.aggregate([
      {
        $match: {
          postID: postID
        },

      },
      {
        $addFields: {

          salePrice: {
            $cmp: ["$saleAmount", 0]
          },
          sLike: {
            $cmp: ["$saleLike", 0]
          },
          sView: {
            $cmp: ["$saleView", 0]
          },
          certi: {
            $cmp: ["$certified", 0]
          },

        }
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'email',
          foreignField: 'email',
          as: 'authdata',

        }
      },
      {
        "$lookup": {
          "from": "mediamusic",
          "as": "music",
          "let": {
            "local_id": "$musicId",

          },
          "pipeline": [
            {
              $match:
              {

                $expr: {

                  $eq: ['$_id', '$$local_id']
                }
              }
            },
            {
              $project: {
                musicTitle: 1,
                albumName: 1
              }
            },

          ],

        },

      },
      {
        $addFields: {


          'auth': {
            $arrayElemAt: ['$authdata', 0]
          },
          'basic': {
            $arrayElemAt: ['$basicdata', 0]
          },

        }
      },
      {
        "$lookup": {
          "from": "interests_repo",
          "as": "kategori",
          "let": {
            "local_id": "$category.$id",

          },
          "pipeline": [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {

                      $in: ['$_id', {
                        $ifNull: ['$$local_id', []]
                      }]
                    }
                  },

                ]
              }
            },
            {
              $project: {
                interestName: 1,

              }
            },

          ],

        },

      },
      {
        $project: {
          refs: {
            $arrayElemAt: ['$contentMedias', 0]
          },
          music: {
            $arrayElemAt: ['$music', 0]
          },
          username: "$auth.username",
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          musicId: 1,
          email: 1,
          postType: 1,
          description: 1,
          title: 1,
          active: 1,
          likes: 1,
          views: 1,
          shares: 1,
          comments: 1,
          kategori: 1,
          tagPeople: 1,
          tagDescription: 1,
          visibility: 1,
          location: 1,
          tags: 1,
          allowComments: 1,
          certified:
          {
            $cond: {
              if: {
                $or: [{
                  $eq: ["$certi", - 1]
                }, {
                  $eq: ["$certi", 0]
                }]
              },
              then: false,
              else: "$certified"
            }
          },
          saleAmount: {
            $cond: {
              if: {
                $or: [{
                  $eq: ["$salePrice", - 1]
                }, {
                  $eq: ["$salePrice", 0]
                }]
              },
              then: 0,
              else: "$saleAmount"
            }
          },
          saleView: {
            $cond: {
              if: {
                $or: [{
                  $eq: ["$sView", - 1]
                }, {
                  $eq: ["$sView", 0]
                }]
              },
              then: false,
              else: "$saleView"
            }
          },
          saleLike: {
            $cond: {
              if: {
                $or: [{
                  $eq: ["$sLike", - 1]
                }, {
                  $eq: ["$sLike", 0]
                }]
              },
              then: false,
              else: "$saleLike"
            }
          },
          monetize: {
            $cond: {
              if: {
                $or: [{
                  $eq: ["$salePrice", - 1]
                }, {
                  $eq: ["$salePrice", 0]
                }]
              },
              then: false,
              else: true
            }
          },

        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          musicTitle: '$music.musicTitle',
          albumName: '$music.albumName',
          username: 1,
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          musicId: 1,
          postType: 1,
          likes: 1,
          views: 1,
          shares: 1,
          saleView: 1,
          saleLike: 1,
          comments: 1,
          email: 1,
          tagPeople: 1,
          tagDescription: 1,
          visibility: 1,
          location: 1,
          tags: 1,
          allowComments: 1,
          type: {

            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$postType', 'pict']
                  },
                  'then': "HyppePic"
                },
                {
                  'case': {
                    '$eq': ['$postType', 'vid']
                  },
                  'then': "HyppeVid"
                },
                {
                  'case': {
                    '$eq': ['$postType', 'diary']
                  },
                  'then': "HyppeDiary"
                },
                {
                  'case': {
                    '$eq': ['$postType', 'story']
                  },
                  'then': "HyppeStory"
                },

              ],
              default: ''
            }
          },
          description: 1,
          title: 1,
          active: 1,
          kategori: 1,
          kepemilikan:
          {
            $cond: {
              if: {
                $or: [{
                  $eq: ["$certified", false]
                }, {
                  $eq: ["$certified", ""]
                }]
              },
              then: "TIDAK",
              else: "YA"
            }
          },
          saleAmount: 1,
          statusJual:
          {
            $cond: {
              if: {

                $eq: ["$monetize", false]
              },
              then: "TIDAK",
              else: "YA"
            }
          },

        }
      },
      {
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',

        },

      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',

        },

      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',

        },

      },
      {
        $lookup: {
          from: 'mediastories',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediastories_data',

        },

      },
      {
        $project: {
          mediapict: {
            $arrayElemAt: ['$mediaPict_data', 0]
          },
          mediadiaries: {
            $arrayElemAt: ['$mediadiaries_data', 0]
          },
          mediavideos: {
            $arrayElemAt: ['$mediavideos_data', 0]
          },
          mediastories: {
            $arrayElemAt: ['$mediastories_data', 0]
          },
          refs: 1,
          idmedia: 1,
          username: 1,
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          musicId: 1,
          postType: 1,
          email: 1,
          type: 1,
          description: 1,
          title: 1,
          active: 1,
          likes: 1,
          views: 1,
          shares: 1,
          comments: 1,
          kategori: 1,
          kepemilikan: 1,
          visibility: 1,
          saleAmount: 1,
          statusJual: 1,
          saleView: 1,
          saleLike: 1,
          tagPeople: 1,
          tagDescription: 1,
          location: 1,
          tags: 1,
          allowComments: 1,
          musicTitle: 1,
          albumName: 1,

        }
      },
      {
        $addFields: {


          pict: {
            $replaceOne: {
              input: "$profilpict.mediaUri",
              find: "_0001.jpeg",
              replacement: ""
            }
          },
          concatmediapict: '/pict',
          media_pict: {
            $replaceOne: {
              input: "$mediapict.mediaUri",
              find: "_0001.jpeg",
              replacement: ""
            }
          },
          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',
          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri',
          concatmediastory:
          {
            $cond: {
              if: {

                $eq: ["$mediastories.mediaType", "image"]
              },
              then: '/pict',
              else: '/stream',

            }
          },
          concatthumbstory: '/thumb',
          media_story: '$mediastories.mediaUri'
        },

      },
      {
        $project: {

          username: 1,
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          musicId: 1,
          postType: 1,
          email: 1,
          type: 1,
          description: 1,
          title: 1,
          active: 1,
          kategori: 1,
          kepemilikan: 1,
          visibility: 1,
          likes: 1,
          views: 1,
          shares: 1,
          comments: 1,
          saleAmount: 1,
          statusJual: 1,
          saleView: 1,
          saleLike: 1,
          tagPeople: 1,
          tagDescription: 1,
          location: 1,
          tags: 1,
          allowComments: 1,
          musicTitle: 1,
          albumName: 1,
          mediaBasePath: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': '$mediapict.mediaBasePath'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': '$mediadiaries.mediaBasePath'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': '$mediavideos.mediaBasePath'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediastories']
                  },
                  'then': '$mediastories.mediaBasePath'
                }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': '$mediapict.mediaUri'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': '$mediadiaries.mediaUri'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': '$mediavideos.mediaUri'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediastories']
                  },
                  'then': '$mediastories.mediaUri'
                }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': '$mediapict.mediaType'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': '$mediadiaries.mediaType'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': '$mediavideos.mediaType'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediastories']
                  },
                  'then': '$mediastories.mediaType'
                }
              ],
              default: ''
            }
          },
          mediaThumbEndpoint: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': '$mediadiaries.mediaThumb'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': {
                    $concat: ["$concatthumbdiari", "/", "$postID"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': {
                    $concat: ["$concatthumbvideo", "/", "$postID"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediastories']
                  },
                  'then': {
                    $concat: ["$concatthumbstory", "/", "$postID"]
                  },

                },

              ],
              default: ''
            }
          },
          mediaEndpoint: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': {
                    $concat: ["$concatmediapict", "/", "$postID"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': {
                    $concat: ["$concatmediadiari", "/", "$postID"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': {
                    $concat: ["$concatmediavideo", "/", "$postID"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediastories']
                  },
                  'then': {
                    $concat: ["$concatmediastory", "/", "$postID"]
                  },

                }
              ],
              default: ''
            }
          },
          mediaThumbUri: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': '$mediadiaries.mediaThumb'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': '$mediadiaries.mediaThumb'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': '$mediavideos.mediaThumb'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediastories']
                  },
                  'then': '$mediastories.mediaThumb'
                }
              ],
              default: ''
            }
          },
          apsaraId: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediapict.apsaraId"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.apsaraId"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.apsaraId"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediastories"
                    ]
                  },
                  then: "$mediastories.apsaraId"
                }
              ],
              default: false
            }
          },
          apsara: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediapict.apsara"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.apsara"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.apsara"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediastories"
                    ]
                  },
                  then: "$mediastories.apsara"
                }
              ],
              default: false
            }
          },
          originalName: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediapict.originalName"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.originalName"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.originalName"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediastories"
                    ]
                  },
                  then: "$mediastories.originalName"
                }
              ],
              default: ""
            }
          },
          rotate: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediapict.rotate"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.rotate"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.rotate"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediastories"
                    ]
                  },
                  then: "$mediastories.rotate"
                }
              ],
              default: 0
            }
          },

        }
      },
      {
        "$lookup": {
          "from": "contentevents",
          "as": "age",
          "let": {
            "local_id": "$postID",

          },
          "pipeline": [
            {
              $match:
              {

                $expr: {

                  $eq: ['$postID', '$$local_id']
                }
              }
            },
            {
              $project: {
                postID: 1,
                senderParty: 1,
                eventType: 1,
                event: 1,
                active: 1
              }
            },
            {
              $match: {
                eventType: "VIEW",
                event: "ACCEPT",
                active: true
              }
            },
            {
              "$lookup": {
                "from": "userbasics",
                "as": "ubasic",
                "let": {
                  "local_id": "$senderParty"
                },
                "pipeline": [
                  {
                    "$match": {
                      "$expr": {
                        "$eq": [
                          "$email",
                          "$$local_id"
                        ]
                      }
                    }
                  },

                ],

              }
            },
            {
              $project: {
                ubasic: {
                  $arrayElemAt: ['$ubasic', 0]
                },

              }
            },
            {
              $project: {
                dob: '$ubasic.dob',

              }
            },
            {
              $project: {

                age: {
                  $cond: {
                    if: {
                      $and: [
                        '$dob',
                        {
                          $ne: ["$dob", ""]
                        }
                      ]
                    },
                    then: {
                      $toInt: {
                        $divide: [{
                          $subtract: [new Date(), {
                            $toDate: "$dob"
                          }]
                        }, (365 * 24 * 60 * 60 * 1000)]
                      }
                    },
                    else: 0
                  }
                },

              }
            },
            {
              $project: {

                ageQualication: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $gt: ["$age", 44]
                        },
                        then: "< 44 Tahun"
                      },
                      {
                        case: {
                          $and: [{
                            $gte: ["$age", 36]
                          }, {
                            $lte: ["$age", 44]
                          }]
                        },
                        then: "35-44 Tahun"
                      },
                      {
                        case: {
                          $and: [{
                            $gte: ["$age", 25]
                          }, {
                            $lte: ["$age", 35]
                          }]
                        },
                        then: "24-35 Tahun"
                      },
                      {
                        case: {
                          $and: [{
                            $gte: ["$age", 14]
                          }, {
                            $lte: ["$age", 24]
                          }]
                        },
                        then: "14-24 Tahun"
                      },
                      {
                        case: {
                          $and: [{
                            $gte: ["$age", 1]
                          }, {
                            $lt: ["$age", 14]
                          }]
                        },
                        then: "< 14 Tahun"
                      }
                    ],
                    "default": "other"
                  }
                },

              }
            },
            {
              "$group": {
                "_id": "$ageQualication",
                "count": {
                  "$sum": 1
                }
              }
            }
          ],

        },

      },
      {
        "$lookup": {
          "from": "contentevents",
          "as": "gender",
          "let": {
            "local_id": "$postID",

          },
          "pipeline": [
            {
              $match:
              {

                $expr: {

                  $eq: ['$postID', '$$local_id']
                }
              }
            },
            {
              $project: {
                postID: 1,
                senderParty: 1,
                eventType: 1,
                event: 1,
                active: 1
              }
            },
            {
              $match: {
                eventType: "VIEW",
                event: "ACCEPT",
                active: true
              }
            },
            {
              "$lookup": {
                "from": "userbasics",
                "as": "ubasic",
                "let": {
                  "local_id": "$senderParty"
                },
                "pipeline": [
                  {
                    "$match": {
                      "$expr": {
                        "$eq": [
                          "$email",
                          "$$local_id"
                        ]
                      }
                    }
                  },

                ],

              }
            },
            {
              $project: {
                ubasic: {
                  $arrayElemAt: ['$ubasic', 0]
                },

              }
            },
            {
              $project: {

                gender: '$ubasic.gender',

              }
            },
            {
              $project: {

                gender: {

                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: ['$gender', 'FEMALE']
                        },
                        then: 'FEMALE',

                      },
                      {
                        case: {
                          $eq: ['$gender', ' FEMALE']
                        },
                        then: 'FEMALE',

                      },
                      {
                        case: {
                          $eq: ['$gender', 'Perempuan']
                        },
                        then: 'FEMALE',

                      },
                      {
                        case: {
                          $eq: ['$gender', 'Wanita']
                        },
                        then: 'FEMALE',

                      },
                      {
                        case: {
                          $eq: ['$gender', 'MALE']
                        },
                        then: 'MALE',

                      },
                      {
                        case: {
                          $eq: ['$gender', ' MALE']
                        },
                        then: 'MALE',

                      },
                      {
                        case: {
                          $eq: ['$gender', 'Laki-laki']
                        },
                        then: 'MALE',

                      },
                      {
                        case: {
                          $eq: ['$gender', 'Pria']
                        },
                        then: 'MALE',

                      },

                    ],
                    default: "OTHER",

                  },

                },

              }
            },
            {
              $project: {
                gender: 1,

              }
            },
            {
              $project: {
                gender: 1,

              }
            },
            {
              "$group": {
                "_id": "$gender",
                "count": {
                  "$sum": 1
                }
              }
            }
          ],

        },

      },
      {
        "$lookup": {
          "from": "contentevents",
          "as": "wilayah",
          "let": {
            "local_id": "$postID",

          },
          "pipeline": [
            {
              $match:
              {

                $expr: {

                  $eq: ['$postID', '$$local_id']
                }
              }
            },
            {
              $project: {

                senderParty: 1,
                eventType: 1,
                event: 1,
                active: 1
              }
            },
            {
              $match: {
                eventType: "VIEW",
                event: "ACCEPT",
                active: true
              }
            },
            {
              "$lookup": {
                "from": "userbasics",
                "as": "ubasic",
                "let": {
                  "local_id": "$senderParty"
                },
                "pipeline": [
                  {
                    "$match": {
                      "$expr": {
                        "$eq": [
                          "$email",
                          "$$local_id"
                        ]
                      }
                    }
                  },

                ],

              }
            },
            {
              $project: {
                ubasic: {
                  $arrayElemAt: ['$ubasic', 0]
                },

              }
            },
            {
              $project: {

                states: '$ubasic.states',

              }
            },
            {
              $project: {

                states: 1,

              }
            },
            {
              $lookup: {
                from: 'areas',
                localField: 'states.$id',
                foreignField: '_id',
                as: 'areas_data',

              },

            },
            {
              $unwind: {
                path: "$areas_data",

              }
            },
            {
              $project: {

                stateName: '$areas_data.stateName'
              }
            },
            {
              "$group": {
                "_id": "$stateName",
                "count": {
                  "$sum": 1
                }
              }
            }
          ],

        },

      },
      {
        "$lookup": {
          "from": "transactions",
          "as": "riwayat",
          "let": {
            "local_id": "$postID",

          },
          "pipeline": [
            {
              $match:
              {

                $expr: {

                  $eq: ['$postid', '$$local_id']
                }
              }
            },
            {
              $project: {
                idusersell: 1,
                iduserbuyer: 1,
                postID: '$postid',
                amount: 1,
                status: 1,
                noinvoice: 1,
                timestamp: 1
              }
            },
            {
              $match: {
                status: "Success"
              }
            },
            { $sort: { timestamp: -1 } },
            {
              $skip: (page * limit)
            },
            {
              $limit: limit
            },
            {
              "$lookup": {
                "from": "userbasics",
                "as": "penjual",
                "let": {
                  "local_id": "$idusersell"
                },
                "pipeline": [
                  {
                    "$match": {
                      "$expr": {
                        "$eq": [
                          "$_id",
                          "$$local_id"
                        ]
                      }
                    }
                  },

                ],

              }
            },
            {
              "$lookup": {
                "from": "userbasics",
                "as": "pembeli",
                "let": {
                  "local_id": "$iduserbuyer"
                },
                "pipeline": [
                  {
                    "$match": {
                      "$expr": {
                        "$eq": [
                          "$_id",
                          "$$local_id"
                        ]
                      }
                    }
                  },

                ],

              }
            },
            {
              $project: {
                penjual: {
                  $arrayElemAt: ['$penjual', 0]
                },
                pembeli: {
                  $arrayElemAt: ['$pembeli', 0]
                },
                postID: 1,
                amount: 1,
                status: 1,
                noinvoice: 1,
                timestamp: 1
              }
            },
            {
              $project: {
                postID: 1,
                emailpenjual: '$penjual.email',
                emailpembeli: '$pembeli.email',
                amount: 1,
                status: 1,
                noinvoice: 1,
                timestamp: 1
              }
            },
            {
              "$lookup": {
                "from": "userauths",
                "as": "authpembeli",
                "let": {
                  "local_id": "$emailpembeli"
                },
                "pipeline": [
                  {
                    "$match": {
                      "$expr": {
                        "$eq": [
                          "$email",
                          "$$local_id"
                        ]
                      }
                    }
                  },

                ],

              }
            },
            {
              "$lookup": {
                "from": "userauths",
                "as": "authpenjual",
                "let": {
                  "local_id": "$emailpenjual"
                },
                "pipeline": [
                  {
                    "$match": {
                      "$expr": {
                        "$eq": [
                          "$email",
                          "$$local_id"
                        ]
                      }
                    }
                  },

                ],

              }
            },
            {
              $project: {
                authpembeli: {
                  $arrayElemAt: ['$authpembeli', 0]
                },
                authpenjual: {
                  $arrayElemAt: ['$authpenjual', 0]
                },
                postID: 1,
                amount: 1,
                status: 1,
                noinvoice: 1,
                timestamp: 1
              }
            },
            {
              $project: {
                pembeli: '$authpembeli.username',
                penjual: '$authpenjual.username',
                postID: 1,
                amount: 1,
                status: 1,
                noinvoice: 1,
                timestamp: 1
              }
            },

          ],

        },

      },
      {
        "$lookup": {
          "from": "disquslogs",
          "as": "comment",
          "let": {
            "local_id": "$postID"
          },
          "pipeline": [
            {
              "$match": {
                "$expr": {
                  "$eq": [
                    "$postID",
                    "$$local_id"
                  ]
                }
              }
            },
            {
              $project: {
                postID: 1,
                txtMessages: 1,
                sender: 1,
                receiver: 1,
                createdAt: 1,
                active: 1
              }
            },
            {
              $match: {
                active: true
              }
            },
            { $sort: { createdAt: -1 } },
            {
              $skip: (page * limit)
            },
            {
              $limit: limit
            },
            {
              "$lookup": {
                "from": "userauths",
                "as": "authsender",
                "let": {
                  "local_id": "$sender"
                },
                "pipeline": [
                  {
                    "$match": {
                      "$expr": {
                        "$eq": [
                          "$email",
                          "$$local_id"
                        ]
                      }
                    }
                  },

                ],

              }
            },
            {
              $project: {
                authsender: {
                  $arrayElemAt: ['$authsender', 0]
                },
                receiver: 1,
                postID: 1,
                txtMessages: 1,
                createdAt: 1,
                active: 1
              }
            },
            {
              "$lookup": {
                "from": "userauths",
                "as": "authreceiver",
                "let": {
                  "local_id": "$receiver"
                },
                "pipeline": [
                  {
                    "$match": {
                      "$expr": {
                        "$eq": [
                          "$email",
                          "$$local_id"
                        ]
                      }
                    }
                  },

                ],

              }
            },
            {
              $project: {
                emailsender: '$authsender.email',
                sender: '$authsender.username',
                authreceive: {
                  $arrayElemAt: ['$authreceiver', 0]
                },
                postID: 1,
                txtMessages: 1,
                receiver: 1,
                createdAt: 1,
                active: 1
              }
            },
            {
              $project: {
                emailsender: 1,
                sender: 1,
                receiver: '$authreceive.username',
                postID: 1,
                txtMessages: 1,
                createdAt: 1,
                active: 1
              }
            },
            {
              "$lookup": {
                "from": "userbasics",
                "as": "ubasic",
                "let": {
                  "local_id": "$emailsender"
                },
                "pipeline": [
                  {
                    "$match": {
                      "$expr": {
                        "$eq": [
                          "$email",
                          "$$local_id"
                        ]
                      }
                    }
                  },

                ],

              }
            },
            {
              $project: {
                ubasic: {
                  $arrayElemAt: ['$ubasic', 0]
                },
                sender: 1,
                receiver: 1,
                postID: 1,
                txtMessages: 1,
                createdAt: 1,
                active: 1,
                emailsender: 1

              }
            },
            {
              $project: {

                sender: 1,
                receiver: 1,
                postID: 1,
                txtMessages: 1,
                createdAt: 1,
                active: 1,
                emailsender: 1,
                ubasic: 1

              }
            },
            {
              $project: {

                sender: 1,
                receiver: 1,
                postID: 1,
                txtMessages: 1,
                createdAt: 1,
                active: 1,
                emailsender: 1,

                profilePict: '$ubasic.profilePict.$id'
              }
            },
            // {
            //   "$lookup": {
            //     from: "mediaprofilepicts",
            //     as: "avatar",
            //     let: {
            //       localID: '$profilePict'
            //     },
            //     pipeline: [
            //       {
            //         $match:
            //         {

            //           $expr: {
            //             $eq: ['$mediaID', '$$localID']
            //           }
            //         }
            //       },
            //       {
            //         $project: {
            //           "mediaBasePath": 1,
            //           "mediaUri": 1,
            //           "originalName": 1,
            //           "fsSourceUri": 1,
            //           "fsSourceName": 1,
            //           "fsTargetUri": 1,
            //           "mediaType": 1,
            //           "mediaEndpoint": {
            //             "$concat": ["/profilepict/", "$mediaID"]
            //           }
            //         }
            //       }
            //     ],

            //   }
            // },

            {
              $project: {

                sender: 1,
                receiver: 1,
                postID: 1,
                txtMessages: 1,
                createdAt: 1,
                active: 1,
                emailsender: 1,

                avatar: [{
                  mediaEndpoint: { "$concat": ["/profilepict/", "$profilePict"] }
                }]
              }
            },

          ],

        }
      },

    ]);

    return query;

  }


  async detaildasbor(email: string) {
    const query = await this.getusercontentsModel.aggregate([
      {
        $match: {
          email: email
        }
      },
      {
        $addFields: {

          salePrice: {
            $cmp: ["$saleAmount", 0]
          },
          sLike: {
            $cmp: ["$saleLike", 0]
          },
          sView: {
            $cmp: ["$saleView", 0]
          },
          certi: {
            $cmp: ["$certified", 0]
          },
          reportCount: {
            $cmp: ["$reportedUserCount", 0]
          },

        }
      },
      {
        $facet: {
          "popular": [
            {
              $project: {
                refs: {
                  $arrayElemAt: ['$contentMedias', 0]
                },
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                email: 1,
                postType: 1,
                description: 1,
                title: 1,
                active: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                jenis: "POPULAR",
                countReport:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$reportCount", - 1]
                      }, {
                        $eq: ["$reportCount", 0]
                      }]
                    },
                    then: 0,
                    else: "$reportedUserCount"
                  }
                },
                certified:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$certi", - 1]
                      }, {
                        $eq: ["$certi", 0]
                      }]
                    },
                    then: false,
                    else: "$certified"
                  }
                },
                visibility: 1,
                saleAmount: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$salePrice", - 1]
                      }, {
                        $eq: ["$salePrice", 0]
                      }]
                    },
                    then: 0,
                    else: "$saleAmount"
                  }
                },
                monetize: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$salePrice", - 1]
                      }, {
                        $eq: ["$salePrice", 0]
                      }]
                    },
                    then: false,
                    else: true
                  }
                },

              }
            },
            {
              $project: {
                refs: '$refs.$ref',
                idmedia: '$refs.$id',
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1,
                type: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$postType', 'pict']
                        },
                        'then': "HyppePic"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'vid']
                        },
                        'then': "HyppeVid"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'diary']
                        },
                        'then': "HyppeDiary"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'story']
                        },
                        'then': "HyppeStory"
                      },

                    ],
                    default: ''
                  }
                },
                description: 1,
                title: 1,
                active: 1,
                kepemilikan:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$certified", false]
                      }, {
                        $eq: ["$certified", ""]
                      }]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },
                visibility: 1,
                saleAmount: 1,
                statusJual:
                {
                  $cond: {
                    if: {

                      $eq: ["$monetize", false]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },

              }
            },
            {
              $lookup: {
                from: 'mediapicts',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediaPict_data',

              },

            },
            {
              $lookup: {
                from: 'mediadiaries',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediadiaries_data',

              },

            },
            {
              $lookup: {
                from: 'mediavideos',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediavideos_data',

              },

            },
            {
              $lookup: {
                from: 'mediastories',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediastories_data',

              },

            },
            {
              $project: {
                mediapict: {
                  $arrayElemAt: ['$mediaPict_data', 0]
                },
                mediadiaries: {
                  $arrayElemAt: ['$mediadiaries_data', 0]
                },
                mediavideos: {
                  $arrayElemAt: ['$mediavideos_data', 0]
                },
                mediastories: {
                  $arrayElemAt: ['$mediastories_data', 0]
                },
                refs: 1,
                idmedia: 1,
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: 1,
                statusJual: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1
              }
            },
            {
              $addFields: {


                concatmediapict: '/pict',
                media_pict: {
                  $replaceOne: {
                    input: "$mediapict.mediaUri",
                    find: "_0001.jpeg",
                    replacement: ""
                  }
                },
                concatmediadiari: '/stream',
                concatthumbdiari: '/thumb',
                media_diari: '$mediadiaries.mediaUri',
                concatmediavideo: '/stream',
                concatthumbvideo: '/thumb',
                media_video: '$mediavideos.mediaUri',
                concatmediastory:
                {
                  $cond: {
                    if: {

                      $eq: ["$mediastories.mediaType", "image"]
                    },
                    then: '/pict',
                    else: '/stream',

                  }
                },
                concatthumbstory: '/thumb',
                media_story: '$mediastories.mediaUri'
              },

            },
            {
              $project: {

                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: 1,
                statusJual: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1,
                mediaBasePath: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaBasePath'
                      }
                    ],
                    default: ''
                  }
                },
                mediaUri: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaUri'
                      }
                    ],
                    default: ''
                  }
                },
                mediaType: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaType'
                      }
                    ],
                    default: ''
                  }
                },
                mediaThumbEndpoint: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': {
                          $concat: ["$concatthumbdiari", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': {
                          $concat: ["$concatthumbvideo", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': {
                          $concat: ["$concatthumbstory", "/", "$postID"]
                        },

                      },

                    ],
                    default: ''
                  }
                },
                mediaEndpoint: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': {
                          $concat: ["$concatmediapict", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': {
                          $concat: ["$concatmediadiari", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': {
                          $concat: ["$concatmediavideo", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': {
                          $concat: ["$concatmediastory", "/", "$postID"]
                        },

                      }
                    ],
                    default: ''
                  }
                },
                mediaThumbUri: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaThumb'
                      }
                    ],
                    default: ''
                  }
                },
                apsaraId: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediapicts"
                          ]
                        },
                        then: "$mediapict.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediadiaries"
                          ]
                        },
                        then: "$mediadiaries.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediavideos"
                          ]
                        },
                        then: "$mediavideos.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediastories"
                          ]
                        },
                        then: "$mediastories.apsaraId"
                      }
                    ],
                    default: false
                  }
                },
                apsara: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediapicts"
                          ]
                        },
                        then: "$mediapict.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediadiaries"
                          ]
                        },
                        then: "$mediadiaries.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediavideos"
                          ]
                        },
                        then: "$mediavideos.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediastories"
                          ]
                        },
                        then: "$mediastories.apsara"
                      }
                    ],
                    default: false
                  }
                },

              }
            },
            {
              $sort: {
                views: - 1,
                likes: - 1
              },

            },
            {
              $skip: 0
            },
            {
              $limit: 1
            },

          ],
          "likes": [
            {
              $project: {
                refs: {
                  $arrayElemAt: ['$contentMedias', 0]
                },
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                email: 1,
                postType: 1,
                description: 1,
                title: 1,
                active: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                jenis: "MOSTLIKES",
                countReport:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$reportCount", - 1]
                      }, {
                        $eq: ["$reportCount", 0]
                      }]
                    },
                    then: 0,
                    else: "$reportedUserCount"
                  }
                },
                certified:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$certi", - 1]
                      }, {
                        $eq: ["$certi", 0]
                      }]
                    },
                    then: false,
                    else: "$certified"
                  }
                },
                visibility: 1,
                saleAmount: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$salePrice", - 1]
                      }, {
                        $eq: ["$salePrice", 0]
                      }]
                    },
                    then: 0,
                    else: "$saleAmount"
                  }
                },
                monetize: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$salePrice", - 1]
                      }, {
                        $eq: ["$salePrice", 0]
                      }]
                    },
                    then: false,
                    else: true
                  }
                },

              }
            },
            {
              $project: {
                refs: '$refs.$ref',
                idmedia: '$refs.$id',
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1,
                type: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$postType', 'pict']
                        },
                        'then': "HyppePic"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'vid']
                        },
                        'then': "HyppeVid"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'diary']
                        },
                        'then': "HyppeDiary"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'story']
                        },
                        'then': "HyppeStory"
                      },

                    ],
                    default: ''
                  }
                },
                description: 1,
                title: 1,
                active: 1,
                kepemilikan:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$certified", false]
                      }, {
                        $eq: ["$certified", ""]
                      }]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },
                visibility: 1,
                saleAmount: 1,
                statusJual:
                {
                  $cond: {
                    if: {

                      $eq: ["$monetize", false]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },

              }
            },
            {
              $lookup: {
                from: 'mediapicts',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediaPict_data',

              },

            },
            {
              $lookup: {
                from: 'mediadiaries',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediadiaries_data',

              },

            },
            {
              $lookup: {
                from: 'mediavideos',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediavideos_data',

              },

            },
            {
              $lookup: {
                from: 'mediastories',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediastories_data',

              },

            },
            {
              $project: {
                mediapict: {
                  $arrayElemAt: ['$mediaPict_data', 0]
                },
                mediadiaries: {
                  $arrayElemAt: ['$mediadiaries_data', 0]
                },
                mediavideos: {
                  $arrayElemAt: ['$mediavideos_data', 0]
                },
                mediastories: {
                  $arrayElemAt: ['$mediastories_data', 0]
                },
                refs: 1,
                idmedia: 1,
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: 1,
                statusJual: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1
              }
            },
            {
              $addFields: {


                concatmediapict: '/pict',
                media_pict: {
                  $replaceOne: {
                    input: "$mediapict.mediaUri",
                    find: "_0001.jpeg",
                    replacement: ""
                  }
                },
                concatmediadiari: '/stream',
                concatthumbdiari: '/thumb',
                media_diari: '$mediadiaries.mediaUri',
                concatmediavideo: '/stream',
                concatthumbvideo: '/thumb',
                media_video: '$mediavideos.mediaUri',
                concatmediastory:
                {
                  $cond: {
                    if: {

                      $eq: ["$mediastories.mediaType", "image"]
                    },
                    then: '/pict',
                    else: '/stream',

                  }
                },
                concatthumbstory: '/thumb',
                media_story: '$mediastories.mediaUri'
              },

            },
            {
              $project: {

                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: 1,
                statusJual: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1,
                mediaBasePath: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaBasePath'
                      }
                    ],
                    default: ''
                  }
                },
                mediaUri: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaUri'
                      }
                    ],
                    default: ''
                  }
                },
                mediaType: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaType'
                      }
                    ],
                    default: ''
                  }
                },
                mediaThumbEndpoint: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': {
                          $concat: ["$concatthumbdiari", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': {
                          $concat: ["$concatthumbvideo", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': {
                          $concat: ["$concatthumbstory", "/", "$postID"]
                        },

                      },

                    ],
                    default: ''
                  }
                },
                mediaEndpoint: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': {
                          $concat: ["$concatmediapict", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': {
                          $concat: ["$concatmediadiari", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': {
                          $concat: ["$concatmediavideo", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': {
                          $concat: ["$concatmediastory", "/", "$postID"]
                        },

                      }
                    ],
                    default: ''
                  }
                },
                mediaThumbUri: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaThumb'
                      }
                    ],
                    default: ''
                  }
                },
                apsaraId: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediapicts"
                          ]
                        },
                        then: "$mediapict.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediadiaries"
                          ]
                        },
                        then: "$mediadiaries.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediavideos"
                          ]
                        },
                        then: "$mediavideos.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediastories"
                          ]
                        },
                        then: "$mediastories.apsaraId"
                      }
                    ],
                    default: false
                  }
                },
                apsara: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediapicts"
                          ]
                        },
                        then: "$mediapict.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediadiaries"
                          ]
                        },
                        then: "$mediadiaries.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediavideos"
                          ]
                        },
                        then: "$mediavideos.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediastories"
                          ]
                        },
                        then: "$mediastories.apsara"
                      }
                    ],
                    default: false
                  }
                },

              }
            },
            {
              $sort: {
                likes: - 1
              },

            },
            {
              $skip: 0
            },
            {
              $limit: 1
            },

          ],
          "shares": [
            {
              $project: {
                refs: {
                  $arrayElemAt: ['$contentMedias', 0]
                },
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                email: 1,
                postType: 1,
                description: 1,
                title: 1,
                active: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                jenis: "MOSTSHARES",
                countReport:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$reportCount", - 1]
                      }, {
                        $eq: ["$reportCount", 0]
                      }]
                    },
                    then: 0,
                    else: "$reportedUserCount"
                  }
                },
                certified:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$certi", - 1]
                      }, {
                        $eq: ["$certi", 0]
                      }]
                    },
                    then: false,
                    else: "$certified"
                  }
                },
                visibility: 1,
                saleAmount: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$salePrice", - 1]
                      }, {
                        $eq: ["$salePrice", 0]
                      }]
                    },
                    then: 0,
                    else: "$saleAmount"
                  }
                },
                monetize: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$salePrice", - 1]
                      }, {
                        $eq: ["$salePrice", 0]
                      }]
                    },
                    then: false,
                    else: true
                  }
                },

              }
            },
            {
              $project: {
                refs: '$refs.$ref',
                idmedia: '$refs.$id',
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1,
                type: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$postType', 'pict']
                        },
                        'then': "HyppePic"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'vid']
                        },
                        'then': "HyppeVid"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'diary']
                        },
                        'then': "HyppeDiary"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'story']
                        },
                        'then': "HyppeStory"
                      },

                    ],
                    default: ''
                  }
                },
                description: 1,
                title: 1,
                active: 1,
                kepemilikan:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$certified", false]
                      }, {
                        $eq: ["$certified", ""]
                      }]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },
                visibility: 1,
                saleAmount: 1,
                statusJual:
                {
                  $cond: {
                    if: {

                      $eq: ["$monetize", false]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },

              }
            },
            {
              $lookup: {
                from: 'mediapicts',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediaPict_data',

              },

            },
            {
              $lookup: {
                from: 'mediadiaries',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediadiaries_data',

              },

            },
            {
              $lookup: {
                from: 'mediavideos',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediavideos_data',

              },

            },
            {
              $lookup: {
                from: 'mediastories',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediastories_data',

              },

            },
            {
              $project: {
                mediapict: {
                  $arrayElemAt: ['$mediaPict_data', 0]
                },
                mediadiaries: {
                  $arrayElemAt: ['$mediadiaries_data', 0]
                },
                mediavideos: {
                  $arrayElemAt: ['$mediavideos_data', 0]
                },
                mediastories: {
                  $arrayElemAt: ['$mediastories_data', 0]
                },
                refs: 1,
                idmedia: 1,
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: 1,
                statusJual: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1
              }
            },
            {
              $addFields: {


                concatmediapict: '/pict',
                media_pict: {
                  $replaceOne: {
                    input: "$mediapict.mediaUri",
                    find: "_0001.jpeg",
                    replacement: ""
                  }
                },
                concatmediadiari: '/stream',
                concatthumbdiari: '/thumb',
                media_diari: '$mediadiaries.mediaUri',
                concatmediavideo: '/stream',
                concatthumbvideo: '/thumb',
                media_video: '$mediavideos.mediaUri',
                concatmediastory:
                {
                  $cond: {
                    if: {

                      $eq: ["$mediastories.mediaType", "image"]
                    },
                    then: '/pict',
                    else: '/stream',

                  }
                },
                concatthumbstory: '/thumb',
                media_story: '$mediastories.mediaUri'
              },

            },
            {
              $project: {

                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: 1,
                statusJual: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1,
                mediaBasePath: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaBasePath'
                      }
                    ],
                    default: ''
                  }
                },
                mediaUri: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaUri'
                      }
                    ],
                    default: ''
                  }
                },
                mediaType: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaType'
                      }
                    ],
                    default: ''
                  }
                },
                mediaThumbEndpoint: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': {
                          $concat: ["$concatthumbdiari", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': {
                          $concat: ["$concatthumbvideo", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': {
                          $concat: ["$concatthumbstory", "/", "$postID"]
                        },

                      },

                    ],
                    default: ''
                  }
                },
                mediaEndpoint: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': {
                          $concat: ["$concatmediapict", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': {
                          $concat: ["$concatmediadiari", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': {
                          $concat: ["$concatmediavideo", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': {
                          $concat: ["$concatmediastory", "/", "$postID"]
                        },

                      }
                    ],
                    default: ''
                  }
                },
                mediaThumbUri: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaThumb'
                      }
                    ],
                    default: ''
                  }
                },
                apsaraId: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediapicts"
                          ]
                        },
                        then: "$mediapict.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediadiaries"
                          ]
                        },
                        then: "$mediadiaries.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediavideos"
                          ]
                        },
                        then: "$mediavideos.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediastories"
                          ]
                        },
                        then: "$mediastories.apsaraId"
                      }
                    ],
                    default: false
                  }
                },
                apsara: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediapicts"
                          ]
                        },
                        then: "$mediapict.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediadiaries"
                          ]
                        },
                        then: "$mediadiaries.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediavideos"
                          ]
                        },
                        then: "$mediavideos.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediastories"
                          ]
                        },
                        then: "$mediastories.apsara"
                      }
                    ],
                    default: false
                  }
                },

              }
            },
            {
              $sort: {
                shares: - 1
              },

            },
            {
              $skip: 0
            },
            {
              $limit: 1
            },

          ],
          "lastPost": [
            {
              $project: {
                refs: {
                  $arrayElemAt: ['$contentMedias', 0]
                },
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                email: 1,
                postType: 1,
                description: 1,
                title: 1,
                active: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                jenis: "LASTPOST",
                countReport:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$reportCount", - 1]
                      }, {
                        $eq: ["$reportCount", 0]
                      }]
                    },
                    then: 0,
                    else: "$reportedUserCount"
                  }
                },
                certified:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$certi", - 1]
                      }, {
                        $eq: ["$certi", 0]
                      }]
                    },
                    then: false,
                    else: "$certified"
                  }
                },
                visibility: 1,
                saleAmount: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$salePrice", - 1]
                      }, {
                        $eq: ["$salePrice", 0]
                      }]
                    },
                    then: 0,
                    else: "$saleAmount"
                  }
                },
                monetize: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$salePrice", - 1]
                      }, {
                        $eq: ["$salePrice", 0]
                      }]
                    },
                    then: false,
                    else: true
                  }
                },

              }
            },
            {
              $project: {
                refs: '$refs.$ref',
                idmedia: '$refs.$id',
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1,
                type: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$postType', 'pict']
                        },
                        'then': "HyppePic"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'vid']
                        },
                        'then': "HyppeVid"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'diary']
                        },
                        'then': "HyppeDiary"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'story']
                        },
                        'then': "HyppeStory"
                      },

                    ],
                    default: ''
                  }
                },
                description: 1,
                title: 1,
                active: 1,
                kepemilikan:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$certified", false]
                      }, {
                        $eq: ["$certified", ""]
                      }]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },
                visibility: 1,
                saleAmount: 1,
                statusJual:
                {
                  $cond: {
                    if: {

                      $eq: ["$monetize", false]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },

              }
            },
            {
              $lookup: {
                from: 'mediapicts',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediaPict_data',

              },

            },
            {
              $lookup: {
                from: 'mediadiaries',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediadiaries_data',

              },

            },
            {
              $lookup: {
                from: 'mediavideos',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediavideos_data',

              },

            },
            {
              $lookup: {
                from: 'mediastories',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediastories_data',

              },

            },
            {
              $project: {
                mediapict: {
                  $arrayElemAt: ['$mediaPict_data', 0]
                },
                mediadiaries: {
                  $arrayElemAt: ['$mediadiaries_data', 0]
                },
                mediavideos: {
                  $arrayElemAt: ['$mediavideos_data', 0]
                },
                mediastories: {
                  $arrayElemAt: ['$mediastories_data', 0]
                },
                refs: 1,
                idmedia: 1,
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: 1,
                statusJual: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1
              }
            },
            {
              $addFields: {


                concatmediapict: '/pict',
                media_pict: {
                  $replaceOne: {
                    input: "$mediapict.mediaUri",
                    find: "_0001.jpeg",
                    replacement: ""
                  }
                },
                concatmediadiari: '/stream',
                concatthumbdiari: '/thumb',
                media_diari: '$mediadiaries.mediaUri',
                concatmediavideo: '/stream',
                concatthumbvideo: '/thumb',
                media_video: '$mediavideos.mediaUri',
                concatmediastory:
                {
                  $cond: {
                    if: {

                      $eq: ["$mediastories.mediaType", "image"]
                    },
                    then: '/pict',
                    else: '/stream',

                  }
                },
                concatthumbstory: '/thumb',
                media_story: '$mediastories.mediaUri'
              },

            },
            {
              $project: {

                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: 1,
                statusJual: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1,
                mediaBasePath: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaBasePath'
                      }
                    ],
                    default: ''
                  }
                },
                mediaUri: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaUri'
                      }
                    ],
                    default: ''
                  }
                },
                mediaType: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaType'
                      }
                    ],
                    default: ''
                  }
                },
                mediaThumbEndpoint: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': {
                          $concat: ["$concatthumbdiari", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': {
                          $concat: ["$concatthumbvideo", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': {
                          $concat: ["$concatthumbstory", "/", "$postID"]
                        },

                      },

                    ],
                    default: ''
                  }
                },
                mediaEndpoint: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': {
                          $concat: ["$concatmediapict", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': {
                          $concat: ["$concatmediadiari", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': {
                          $concat: ["$concatmediavideo", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': {
                          $concat: ["$concatmediastory", "/", "$postID"]
                        },

                      }
                    ],
                    default: ''
                  }
                },
                mediaThumbUri: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaThumb'
                      }
                    ],
                    default: ''
                  }
                },
                apsaraId: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediapicts"
                          ]
                        },
                        then: "$mediapict.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediadiaries"
                          ]
                        },
                        then: "$mediadiaries.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediavideos"
                          ]
                        },
                        then: "$mediavideos.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediastories"
                          ]
                        },
                        then: "$mediastories.apsaraId"
                      }
                    ],
                    default: false
                  }
                },
                apsara: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediapicts"
                          ]
                        },
                        then: "$mediapict.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediadiaries"
                          ]
                        },
                        then: "$mediadiaries.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediavideos"
                          ]
                        },
                        then: "$mediavideos.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediastories"
                          ]
                        },
                        then: "$mediastories.apsara"
                      }
                    ],
                    default: false
                  }
                },

              }
            },
            {
              $sort: {
                createdAt: - 1
              },

            },
            {
              $skip: 0
            },
            {
              $limit: 1
            },

          ],
          "ownership": [
            {
              $project: {
                refs: {
                  $arrayElemAt: ['$contentMedias', 0]
                },
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                email: 1,
                postType: 1,
                description: 1,
                title: 1,
                active: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                jenis: "OWNERSHIP",
                countReport:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$reportCount", - 1]
                      }, {
                        $eq: ["$reportCount", 0]
                      }]
                    },
                    then: 0,
                    else: "$reportedUserCount"
                  }
                },
                certified:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$certi", - 1]
                      }, {
                        $eq: ["$certi", 0]
                      }]
                    },
                    then: false,
                    else: "$certified"
                  }
                },
                visibility: 1,
                saleAmount: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$salePrice", - 1]
                      }, {
                        $eq: ["$salePrice", 0]
                      }]
                    },
                    then: 0,
                    else: "$saleAmount"
                  }
                },
                monetize: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$salePrice", - 1]
                      }, {
                        $eq: ["$salePrice", 0]
                      }]
                    },
                    then: false,
                    else: true
                  }
                },

              }
            },
            {
              $project: {
                refs: '$refs.$ref',
                idmedia: '$refs.$id',
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1,
                type: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$postType', 'pict']
                        },
                        'then': "HyppePic"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'vid']
                        },
                        'then': "HyppeVid"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'diary']
                        },
                        'then': "HyppeDiary"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'story']
                        },
                        'then': "HyppeStory"
                      },

                    ],
                    default: ''
                  }
                },
                description: 1,
                title: 1,
                active: 1,
                kepemilikan:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$certified", false]
                      }, {
                        $eq: ["$certified", ""]
                      }]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },
                visibility: 1,
                saleAmount: 1,
                statusJual:
                {
                  $cond: {
                    if: {

                      $eq: ["$monetize", false]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },

              }
            },
            {
              $lookup: {
                from: 'mediapicts',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediaPict_data',

              },

            },
            {
              $lookup: {
                from: 'mediadiaries',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediadiaries_data',

              },

            },
            {
              $lookup: {
                from: 'mediavideos',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediavideos_data',

              },

            },
            {
              $lookup: {
                from: 'mediastories',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediastories_data',

              },

            },
            {
              $project: {
                mediapict: {
                  $arrayElemAt: ['$mediaPict_data', 0]
                },
                mediadiaries: {
                  $arrayElemAt: ['$mediadiaries_data', 0]
                },
                mediavideos: {
                  $arrayElemAt: ['$mediavideos_data', 0]
                },
                mediastories: {
                  $arrayElemAt: ['$mediastories_data', 0]
                },
                refs: 1,
                idmedia: 1,
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: 1,
                statusJual: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1
              }
            },
            {
              $addFields: {


                concatmediapict: '/pict',
                media_pict: {
                  $replaceOne: {
                    input: "$mediapict.mediaUri",
                    find: "_0001.jpeg",
                    replacement: ""
                  }
                },
                concatmediadiari: '/stream',
                concatthumbdiari: '/thumb',
                media_diari: '$mediadiaries.mediaUri',
                concatmediavideo: '/stream',
                concatthumbvideo: '/thumb',
                media_video: '$mediavideos.mediaUri',
                concatmediastory:
                {
                  $cond: {
                    if: {

                      $eq: ["$mediastories.mediaType", "image"]
                    },
                    then: '/pict',
                    else: '/stream',

                  }
                },
                concatthumbstory: '/thumb',
                media_story: '$mediastories.mediaUri'
              },

            },
            {
              $project: {

                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: 1,
                statusJual: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1,
                mediaBasePath: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaBasePath'
                      }
                    ],
                    default: ''
                  }
                },
                mediaUri: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaUri'
                      }
                    ],
                    default: ''
                  }
                },
                mediaType: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaType'
                      }
                    ],
                    default: ''
                  }
                },
                mediaThumbEndpoint: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': {
                          $concat: ["$concatthumbdiari", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': {
                          $concat: ["$concatthumbvideo", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': {
                          $concat: ["$concatthumbstory", "/", "$postID"]
                        },

                      },

                    ],
                    default: ''
                  }
                },
                mediaEndpoint: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': {
                          $concat: ["$concatmediapict", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': {
                          $concat: ["$concatmediadiari", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': {
                          $concat: ["$concatmediavideo", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': {
                          $concat: ["$concatmediastory", "/", "$postID"]
                        },

                      }
                    ],
                    default: ''
                  }
                },
                mediaThumbUri: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaThumb'
                      }
                    ],
                    default: ''
                  }
                },
                apsaraId: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediapicts"
                          ]
                        },
                        then: "$mediapict.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediadiaries"
                          ]
                        },
                        then: "$mediadiaries.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediavideos"
                          ]
                        },
                        then: "$mediavideos.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediastories"
                          ]
                        },
                        then: "$mediastories.apsaraId"
                      }
                    ],
                    default: false
                  }
                },
                apsara: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediapicts"
                          ]
                        },
                        then: "$mediapict.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediadiaries"
                          ]
                        },
                        then: "$mediadiaries.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediavideos"
                          ]
                        },
                        then: "$mediavideos.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediastories"
                          ]
                        },
                        then: "$mediastories.apsara"
                      }
                    ],
                    default: false
                  }
                },

              }
            },
            {
              $match: {
                kepemilikan: "YA"
              }
            },
            {
              $sort: {
                createdAt: - 1
              },

            },
            {
              $skip: 0
            },
            {
              $limit: 1
            },

          ],
          "monetize": [
            {
              $project: {
                refs: {
                  $arrayElemAt: ['$contentMedias', 0]
                },
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                email: 1,
                postType: 1,
                description: 1,
                title: 1,
                active: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                jenis: "MONETIZE",
                countReport:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$reportCount", - 1]
                      }, {
                        $eq: ["$reportCount", 0]
                      }]
                    },
                    then: 0,
                    else: "$reportedUserCount"
                  }
                },
                certified:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$certi", - 1]
                      }, {
                        $eq: ["$certi", 0]
                      }]
                    },
                    then: false,
                    else: "$certified"
                  }
                },
                visibility: 1,
                saleAmount: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$salePrice", - 1]
                      }, {
                        $eq: ["$salePrice", 0]
                      }]
                    },
                    then: 0,
                    else: "$saleAmount"
                  }
                },
                monetize: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$salePrice", - 1]
                      }, {
                        $eq: ["$salePrice", 0]
                      }]
                    },
                    then: false,
                    else: true
                  }
                },

              }
            },
            {
              $project: {
                refs: '$refs.$ref',
                idmedia: '$refs.$id',
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1,
                type: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$postType', 'pict']
                        },
                        'then': "HyppePic"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'vid']
                        },
                        'then': "HyppeVid"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'diary']
                        },
                        'then': "HyppeDiary"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'story']
                        },
                        'then': "HyppeStory"
                      },

                    ],
                    default: ''
                  }
                },
                description: 1,
                title: 1,
                active: 1,
                kepemilikan:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$certified", false]
                      }, {
                        $eq: ["$certified", ""]
                      }]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },
                visibility: 1,
                saleAmount: 1,
                statusJual:
                {
                  $cond: {
                    if: {

                      $eq: ["$monetize", false]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },

              }
            },
            {
              $lookup: {
                from: 'mediapicts',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediaPict_data',

              },

            },
            {
              $lookup: {
                from: 'mediadiaries',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediadiaries_data',

              },

            },
            {
              $lookup: {
                from: 'mediavideos',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediavideos_data',

              },

            },
            {
              $lookup: {
                from: 'mediastories',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediastories_data',

              },

            },
            {
              $project: {
                mediapict: {
                  $arrayElemAt: ['$mediaPict_data', 0]
                },
                mediadiaries: {
                  $arrayElemAt: ['$mediadiaries_data', 0]
                },
                mediavideos: {
                  $arrayElemAt: ['$mediavideos_data', 0]
                },
                mediastories: {
                  $arrayElemAt: ['$mediastories_data', 0]
                },
                refs: 1,
                idmedia: 1,
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: 1,
                statusJual: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1
              }
            },
            {
              $addFields: {


                concatmediapict: '/pict',
                media_pict: {
                  $replaceOne: {
                    input: "$mediapict.mediaUri",
                    find: "_0001.jpeg",
                    replacement: ""
                  }
                },
                concatmediadiari: '/stream',
                concatthumbdiari: '/thumb',
                media_diari: '$mediadiaries.mediaUri',
                concatmediavideo: '/stream',
                concatthumbvideo: '/thumb',
                media_video: '$mediavideos.mediaUri',
                concatmediastory:
                {
                  $cond: {
                    if: {

                      $eq: ["$mediastories.mediaType", "image"]
                    },
                    then: '/pict',
                    else: '/stream',

                  }
                },
                concatthumbstory: '/thumb',
                media_story: '$mediastories.mediaUri'
              },

            },
            {
              $project: {

                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: 1,
                statusJual: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1,
                mediaBasePath: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaBasePath'
                      }
                    ],
                    default: ''
                  }
                },
                mediaUri: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaUri'
                      }
                    ],
                    default: ''
                  }
                },
                mediaType: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaType'
                      }
                    ],
                    default: ''
                  }
                },
                mediaThumbEndpoint: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': {
                          $concat: ["$concatthumbdiari", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': {
                          $concat: ["$concatthumbvideo", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': {
                          $concat: ["$concatthumbstory", "/", "$postID"]
                        },

                      },

                    ],
                    default: ''
                  }
                },
                mediaEndpoint: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': {
                          $concat: ["$concatmediapict", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': {
                          $concat: ["$concatmediadiari", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': {
                          $concat: ["$concatmediavideo", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': {
                          $concat: ["$concatmediastory", "/", "$postID"]
                        },

                      }
                    ],
                    default: ''
                  }
                },
                mediaThumbUri: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaThumb'
                      }
                    ],
                    default: ''
                  }
                },
                apsaraId: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediapicts"
                          ]
                        },
                        then: "$mediapict.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediadiaries"
                          ]
                        },
                        then: "$mediadiaries.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediavideos"
                          ]
                        },
                        then: "$mediavideos.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediastories"
                          ]
                        },
                        then: "$mediastories.apsaraId"
                      }
                    ],
                    default: false
                  }
                },
                apsara: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediapicts"
                          ]
                        },
                        then: "$mediapict.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediadiaries"
                          ]
                        },
                        then: "$mediadiaries.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediavideos"
                          ]
                        },
                        then: "$mediavideos.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediastories"
                          ]
                        },
                        then: "$mediastories.apsara"
                      }
                    ],
                    default: false
                  }
                },

              }
            },
            {
              $match: {
                statusJual: "YA"
              }
            },
            {
              $sort: {
                createdAt: - 1
              },

            },
            {
              $skip: 0
            },
            {
              $limit: 1
            },

          ],
          "lastreportContent": [
            {
              $project: {
                refs: {
                  $arrayElemAt: ['$contentMedias', 0]
                },
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                email: 1,
                postType: 1,
                description: 1,
                title: 1,
                active: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                jenis: "LASTREPORT",
                countReport:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$reportCount", - 1]
                      }, {
                        $eq: ["$reportCount", 0]
                      }]
                    },
                    then: 0,
                    else: "$reportedUserCount"
                  }
                },
                certified:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$certi", - 1]
                      }, {
                        $eq: ["$certi", 0]
                      }]
                    },
                    then: false,
                    else: "$certified"
                  }
                },
                visibility: 1,
                saleAmount: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$salePrice", - 1]
                      }, {
                        $eq: ["$salePrice", 0]
                      }]
                    },
                    then: 0,
                    else: "$saleAmount"
                  }
                },
                monetize: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$salePrice", - 1]
                      }, {
                        $eq: ["$salePrice", 0]
                      }]
                    },
                    then: false,
                    else: true
                  }
                },

              }
            },
            {
              $project: {
                refs: '$refs.$ref',
                idmedia: '$refs.$id',
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1,
                type: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$postType', 'pict']
                        },
                        'then': "HyppePic"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'vid']
                        },
                        'then': "HyppeVid"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'diary']
                        },
                        'then': "HyppeDiary"
                      },
                      {
                        'case': {
                          '$eq': ['$postType', 'story']
                        },
                        'then': "HyppeStory"
                      },

                    ],
                    default: ''
                  }
                },
                description: 1,
                title: 1,
                active: 1,
                kepemilikan:
                {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$certified", false]
                      }, {
                        $eq: ["$certified", ""]
                      }]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },
                visibility: 1,
                saleAmount: 1,
                statusJual:
                {
                  $cond: {
                    if: {

                      $eq: ["$monetize", false]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },

              }
            },
            {
              $lookup: {
                from: 'mediapicts',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediaPict_data',

              },

            },
            {
              $lookup: {
                from: 'mediadiaries',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediadiaries_data',

              },

            },
            {
              $lookup: {
                from: 'mediavideos',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediavideos_data',

              },

            },
            {
              $lookup: {
                from: 'mediastories',
                localField: 'idmedia',
                foreignField: '_id',
                as: 'mediastories_data',

              },

            },
            {
              $project: {
                mediapict: {
                  $arrayElemAt: ['$mediaPict_data', 0]
                },
                mediadiaries: {
                  $arrayElemAt: ['$mediadiaries_data', 0]
                },
                mediavideos: {
                  $arrayElemAt: ['$mediavideos_data', 0]
                },
                mediastories: {
                  $arrayElemAt: ['$mediastories_data', 0]
                },
                refs: 1,
                idmedia: 1,
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: 1,
                statusJual: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1
              }
            },
            {
              $addFields: {


                concatmediapict: '/pict',
                media_pict: {
                  $replaceOne: {
                    input: "$mediapict.mediaUri",
                    find: "_0001.jpeg",
                    replacement: ""
                  }
                },
                concatmediadiari: '/stream',
                concatthumbdiari: '/thumb',
                media_diari: '$mediadiaries.mediaUri',
                concatmediavideo: '/stream',
                concatthumbvideo: '/thumb',
                media_video: '$mediavideos.mediaUri',
                concatmediastory:
                {
                  $cond: {
                    if: {

                      $eq: ["$mediastories.mediaType", "image"]
                    },
                    then: '/pict',
                    else: '/stream',

                  }
                },
                concatthumbstory: '/thumb',
                media_story: '$mediastories.mediaUri'
              },

            },
            {
              $project: {

                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: 1,
                statusJual: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                countReport: 1,
                jenis: 1,
                mediaBasePath: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaBasePath'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaBasePath'
                      }
                    ],
                    default: ''
                  }
                },
                mediaUri: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaUri'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaUri'
                      }
                    ],
                    default: ''
                  }
                },
                mediaType: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediapict.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaType'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaType'
                      }
                    ],
                    default: ''
                  }
                },
                mediaThumbEndpoint: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': {
                          $concat: ["$concatthumbdiari", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': {
                          $concat: ["$concatthumbvideo", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': {
                          $concat: ["$concatthumbstory", "/", "$postID"]
                        },

                      },

                    ],
                    default: ''
                  }
                },
                mediaEndpoint: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': {
                          $concat: ["$concatmediapict", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': {
                          $concat: ["$concatmediadiari", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': {
                          $concat: ["$concatmediavideo", "/", "$postID"]
                        },

                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': {
                          $concat: ["$concatmediastory", "/", "$postID"]
                        },

                      }
                    ],
                    default: ''
                  }
                },
                mediaThumbUri: {
                  $switch: {
                    branches: [
                      {
                        'case': {
                          '$eq': ['$refs', 'mediapicts']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediadiaries']
                        },
                        'then': '$mediadiaries.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediavideos']
                        },
                        'then': '$mediavideos.mediaThumb'
                      },
                      {
                        'case': {
                          '$eq': ['$refs', 'mediastories']
                        },
                        'then': '$mediastories.mediaThumb'
                      }
                    ],
                    default: ''
                  }
                },
                apsaraId: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediapicts"
                          ]
                        },
                        then: "$mediapict.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediadiaries"
                          ]
                        },
                        then: "$mediadiaries.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediavideos"
                          ]
                        },
                        then: "$mediavideos.apsaraId"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediastories"
                          ]
                        },
                        then: "$mediastories.apsaraId"
                      }
                    ],
                    default: false
                  }
                },
                apsara: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediapicts"
                          ]
                        },
                        then: "$mediapict.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediadiaries"
                          ]
                        },
                        then: "$mediadiaries.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediavideos"
                          ]
                        },
                        then: "$mediavideos.apsara"
                      },
                      {
                        case: {
                          $eq: [
                            "$refs",
                            "mediastories"
                          ]
                        },
                        then: "$mediastories.apsara"
                      }
                    ],
                    default: false
                  }
                },

              }
            },
            {
              $match: {
                countReport: {
                  $ne: 0
                }
              }
            },
            {
              $sort: {
                createdAt: - 1
              },

            },
            {
              $skip: 0
            },
            {
              $limit: 1
            },

          ],

        }
      },
      {
        $project: {

          data: { $concatArrays: ["$popular", "$likes", "$shares", "$lastPost", "$ownership", "$monetize", "$lastreportContent"] }

        }
      }
    ]);

    var leng = null;
    var arrayData = [];
    leng = query[0].data.length;

    for (let i = 0; i < leng; i++) {
      let data = await this.getapsaraDatabase(query[0].data, i);
      arrayData.push(data[i])
    }

    // persentase 
    var genderChart = await this.contenteventsService.genderChartbyEmail(email);
    //OTHER -> FEMALE -> MALE
    var arrGenderChart = [];
    var total = parseInt('0');
    genderChart.forEach(function (data) {
      total = total + parseInt(data.count);
    });

    genderChart.forEach(function (data) {
      var temparray = {};

      temparray['gender'] = data._id;
      temparray['total'] = data.count;
      var temptotal = (parseInt(data.count) / total) * 100;
      temparray['persentase'] = temptotal.toFixed(2);
      arrGenderChart.push(temparray);
    });
    var data = [{
      arrayData, "genderViewer": arrGenderChart

    }];

    return data;
  }

  //ambil data untuk menentukan bentuk video
  async getsourcecontentdata(objectdata: object) {
    let idapsara = null;
    let datas = null;
    let apsara = null;
    let apsaradefine = null;
    let idapsaradefine = null;
    let pict = null;

    try {
      idapsara = objectdata[0].apsaraId;
    } catch (e) {
      idapsara = "";
    }
    try {
      apsara = objectdata[0].apsara;
    } catch (e) {
      apsara = false;
    }

    if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
      apsaradefine = false;
    } else {
      apsaradefine = true;
    }

    if (idapsara === undefined || idapsara === "" || idapsara === null || idapsara === "other") {
      idapsaradefine = "";
    } else {
      idapsaradefine = idapsara;
    }
    var type = objectdata[0].postType;
    pict = [idapsara];

    if (idapsara === "") {

    } else {
      if (type === "pict") {

        try {
          objectdata[0].media = await this.postContentService.getImageApsara(pict);
        } catch (e) {
          objectdata[0].media = {};
        }
      }
      else if (type === "vid") {
        try {
          objectdata[0].media = await this.postContentService.getVideoApsara(pict);
        } catch (e) {
          objectdata[0].media = {};
        }

      }
      else if (type === "story") {
        try {
          objectdata[0].media = await this.postContentService.getVideoApsara(pict);
        } catch (e) {
          objectdata[0].media = {};
        }
      }
      else if (type === "diary") {
        try {
          objectdata[0].media = await this.postContentService.getVideoApsara(pict);
        } catch (e) {
          objectdata[0].media = {};
        }
      }
    }

    return objectdata;
  }

  async getactivitygraph(email: string) {
    var getdate = new Date();
    var firsttanggal = [];
    var lasttanggal = [];

    for (var i = 5; i >= 0; i--) {
      var temp = new Date(getdate.getFullYear(), getdate.getMonth() - i, getdate.getDate() + 1).toISOString().split('T')[0];
      lasttanggal.push(temp.toString() + " 23:59:59");
      var tambahbulan = i + 1;
      var temp = new Date(getdate.getFullYear(), getdate.getMonth() - tambahbulan, getdate.getDate() + 1).toISOString().split('T')[0];
      firsttanggal.push(temp.toString() + " 00:00:00");
    }

    const query = await this.getusercontentsModel.aggregate([
      {
        $facet:
        {
          "0":
            [
              {
                $match:
                {
                  $and:
                    [
                      {
                        email: email,
                      },
                      {
                        $expr:
                        {
                          $gt: ["$views", 0,]
                        },
                      },
                      {
                        $expr:
                        {
                          $gte: ["$createdAt", firsttanggal[0],]
                        },
                      },
                      {
                        $expr:
                        {
                          $lt: ["$createdAt", lasttanggal[0],]
                        },
                      },
                    ]
                }
              },
              {
                $group:
                {
                  "_id": lasttanggal[0],
                  "count":
                  {
                    "$sum": 1
                  }
                }
              },
            ],
          "1":
            [
              {
                $match:
                {
                  $and:
                    [
                      {
                        email: email,
                      },
                      {
                        $expr:
                        {
                          $gt: ["$views", 0,]
                        },
                      },
                      {
                        $expr:
                        {
                          $gte: ["$createdAt", firsttanggal[1],]
                        },
                      },
                      {
                        $expr:
                        {
                          $lt: ["$createdAt", lasttanggal[1],]
                        },
                      },
                    ]
                }
              },
              {
                $group:
                {
                  "_id": lasttanggal[1],
                  "count":
                  {
                    "$sum": 1
                  }
                }
              },
            ],
          "2":
            [
              {
                $match:
                {
                  $and:
                    [
                      {
                        email: email,
                      },
                      {
                        $expr:
                        {
                          $gt: ["$views", 0,]
                        },
                      },
                      {
                        $expr:
                        {
                          $gte: ["$createdAt", firsttanggal[2],]
                        },
                      },
                      {
                        $expr:
                        {
                          $lt: ["$createdAt", lasttanggal[2],]
                        },
                      },
                    ]
                }
              },
              {
                $group:
                {
                  "_id": lasttanggal[2],
                  "count":
                  {
                    "$sum": 1
                  }
                }
              },
            ],
          "3":
            [
              {
                $match:
                {
                  $and:
                    [
                      {
                        email: email,
                      },
                      {
                        $expr:
                        {
                          $gt: ["$views", 0,]
                        },
                      },
                      {
                        $expr:
                        {
                          $gte: ["$createdAt", firsttanggal[3],]
                        },
                      },
                      {
                        $expr:
                        {
                          $lt: ["$createdAt", lasttanggal[3],]
                        },
                      },
                    ]
                }
              },
              {
                $group:
                {
                  "_id": lasttanggal[3],
                  "count":
                  {
                    "$sum": 1
                  }
                }
              },
            ],
          "4":
            [
              {
                $match:
                {
                  $and:
                    [
                      {
                        email: email,
                      },
                      {
                        $expr:
                        {
                          $gt: ["$views", 0,]
                        },
                      },
                      {
                        $expr:
                        {
                          $gte: ["$createdAt", firsttanggal[4],]
                        },
                      },
                      {
                        $expr:
                        {
                          $lt: ["$createdAt", lasttanggal[4],]
                        },
                      },
                    ]
                }
              },
              {
                $group:
                {
                  "_id": lasttanggal[4],
                  "count":
                  {
                    "$sum": 1
                  }
                }
              },
            ],
          "5":
            [
              {
                $match:
                {
                  $and:
                    [
                      {
                        email: email,
                      },
                      {
                        $expr:
                        {
                          $gt: ["$views", 0,]
                        },
                      },
                      {
                        $expr:
                        {
                          $gte: ["$createdAt", firsttanggal[5],]
                        },
                      },
                      {
                        $expr:
                        {
                          $lt: ["$createdAt", lasttanggal[5],]
                        },
                      },
                    ]
                }
              },
              {
                $group:
                {
                  "_id": lasttanggal[5],
                  "count":
                  {
                    "$sum": 1
                  },
                }
              },
            ],
        },
      },
      {
        $project:
        {
          arrayData:
          {
            $concatArrays:
              [
                "$0", "$1", "$2", "$3", "$4", "$5"
              ]
          }
        }
      }
    ]);

    //console.log(query[0].arrayData);

    //cek apabila data kosong atau ada yang kosong di antara hasil result database
    var tempobj = query[0].arrayData;
    var newobject = [];
    for (var i = 0; i < 6; i++) {
      const cekexist = tempobj.find(({ _id }) => _id === lasttanggal[i]);
      const temp = {};
      Object.assign(temp, { _id: lasttanggal[i].toString() });
      if (cekexist == undefined) {
        Object.assign(temp, { count: 0 });
      }
      else {
        Object.assign(temp, { count: cekexist.count });
      }

      var gettanggal = new Date(lasttanggal[i]);
      Object.assign(temp, { bulan: gettanggal.toDateString().split(" ")[1] });

      newobject.push(temp);
    }

    query[0].arrayData = newobject;

    return query;
  }

  async boostlistconsole() {
    var query = await this.getusercontentsModel.aggregate(
      [
        {
          $match: {
            $and: [{
              boosted: {
                $ne: []
              }
            }, {
              boosted: {
                $ne: null
              }
            }]
          }
        },
        {
          $facet: {
            "totalpost": [

              {
                $group: {
                  _id: null,
                  totalpost: {
                    $sum: 1
                  }
                }
              }
            ],
            "jangkauan": [

              {
                $project: {

                  view: {
                    $arrayElemAt: ["$boosted.boostViewer", 0]
                  },

                }
              },
              {
                $project: {

                  view: {
                    $size: '$view'
                  },

                }
              },
              {
                $unwind: '$view'
              },
              {
                $group: {
                  _id: null,
                  "total": {
                    $sum: "$view"
                  }
                }
              }
            ],
            "post": [

              {

                $match: {

                  active: true
                }
              },
              {
                $project: {
                  refs: {
                    $arrayElemAt: ['$contentMedias', 0]
                  },
                  createdAt: 1,
                  updatedAt: 1,
                  postID: 1,
                  email: 1,
                  postType: 1,
                  description: 1,
                  title: 1,
                  active: 1,
                  jangkauan: {
                    $size: {
                      $arrayElemAt: ['$boosted.boostViewer', 0]
                    },

                  },

                }
              },
              {
                $project: {
                  refs: '$refs.$ref',
                  idmedia: '$refs.$id',
                  createdAt: 1,
                  updatedAt: 1,
                  postID: 1,
                  postType: 1,
                  email: 1,
                  jangkauan: 1,
                  type: {
                    $switch: {
                      branches: [
                        {
                          'case': {
                            '$eq': ['$postType', 'pict']
                          },
                          'then': "HyppePic"
                        },
                        {
                          'case': {
                            '$eq': ['$postType', 'vid']
                          },
                          'then': "HyppeVid"
                        },
                        {
                          'case': {
                            '$eq': ['$postType', 'diary']
                          },
                          'then': "HyppeDiary"
                        },
                        {
                          'case': {
                            '$eq': ['$postType', 'story']
                          },
                          'then': "HyppeStory"
                        },

                      ],
                      default: ''
                    }
                  },
                  description: 1,
                  title: 1,
                  active: 1,

                }
              },
              {
                $lookup: {
                  from: 'mediapicts',
                  localField: 'idmedia',
                  foreignField: '_id',
                  as: 'mediaPict_data',

                },

              },
              {
                $lookup: {
                  from: 'mediadiaries',
                  localField: 'idmedia',
                  foreignField: '_id',
                  as: 'mediadiaries_data',

                },

              },
              {
                $lookup: {
                  from: 'mediavideos',
                  localField: 'idmedia',
                  foreignField: '_id',
                  as: 'mediavideos_data',

                },

              },
              {
                $lookup: {
                  from: 'mediastories',
                  localField: 'idmedia',
                  foreignField: '_id',
                  as: 'mediastories_data',

                },

              },
              {
                $project: {
                  mediapict: {
                    $arrayElemAt: ['$mediaPict_data', 0]
                  },
                  mediadiaries: {
                    $arrayElemAt: ['$mediadiaries_data', 0]
                  },
                  mediavideos: {
                    $arrayElemAt: ['$mediavideos_data', 0]
                  },
                  mediastories: {
                    $arrayElemAt: ['$mediastories_data', 0]
                  },
                  refs: 1,
                  idmedia: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  postID: 1,
                  postType: 1,
                  email: 1,
                  type: 1,
                  description: 1,
                  title: 1,
                  active: 1,
                  jangkauan: 1
                }
              },
              {
                $addFields: {


                  pict: {
                    $replaceOne: {
                      input: "$profilpict.mediaUri",
                      find: "_0001.jpeg",
                      replacement: ""
                    }
                  },
                  concatmediapict: '/pict',
                  media_pict: {
                    $replaceOne: {
                      input: "$mediapict.mediaUri",
                      find: "_0001.jpeg",
                      replacement: ""
                    }
                  },
                  concatmediadiari: '/stream',
                  concatthumbdiari: '/thumb',
                  media_diari: '$mediadiaries.mediaUri',
                  concatmediavideo: '/stream',
                  concatthumbvideo: '/thumb',
                  media_video: '$mediavideos.mediaUri',
                  concatmediastory:
                  {
                    $cond: {
                      if: {

                        $eq: ["$mediastories.mediaType", "image"]
                      },
                      then: '/pict',
                      else: '/stream',

                    }
                  },
                  concatthumbstory: '/thumb',
                  media_story: '$mediastories.mediaUri'
                },

              },
              {
                $project: {

                  createdAt: 1,
                  updatedAt: 1,
                  postID: 1,
                  postType: 1,
                  email: 1,
                  type: 1,
                  description: 1,
                  title: 1,
                  active: 1,
                  jangkauan: 1,
                  mediaBasePath: {
                    $switch: {
                      branches: [
                        {
                          'case': {
                            '$eq': ['$refs', 'mediapicts']
                          },
                          'then': '$mediapict.mediaBasePath'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediadiaries']
                          },
                          'then': '$mediadiaries.mediaBasePath'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediavideos']
                          },
                          'then': '$mediavideos.mediaBasePath'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediastories']
                          },
                          'then': '$mediastories.mediaBasePath'
                        }
                      ],
                      default: ''
                    }
                  },
                  mediaUri: {
                    $switch: {
                      branches: [
                        {
                          'case': {
                            '$eq': ['$refs', 'mediapicts']
                          },
                          'then': '$mediapict.mediaUri'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediadiaries']
                          },
                          'then': '$mediadiaries.mediaUri'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediavideos']
                          },
                          'then': '$mediavideos.mediaUri'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediastories']
                          },
                          'then': '$mediastories.mediaUri'
                        }
                      ],
                      default: ''
                    }
                  },
                  mediaType: {
                    $switch: {
                      branches: [
                        {
                          'case': {
                            '$eq': ['$refs', 'mediapicts']
                          },
                          'then': '$mediapict.mediaType'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediadiaries']
                          },
                          'then': '$mediadiaries.mediaType'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediavideos']
                          },
                          'then': '$mediavideos.mediaType'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediastories']
                          },
                          'then': '$mediastories.mediaType'
                        }
                      ],
                      default: ''
                    }
                  },
                  mediaThumbEndpoint: {
                    $switch: {
                      branches: [
                        {
                          'case': {
                            '$eq': ['$refs', 'mediapicts']
                          },
                          'then': '$mediadiaries.mediaThumb'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediadiaries']
                          },
                          'then': {
                            $concat: ["$concatthumbdiari", "/", "$postID"]
                          },

                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediavideos']
                          },
                          'then': {
                            $concat: ["$concatthumbvideo", "/", "$postID"]
                          },

                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediastories']
                          },
                          'then': {
                            $concat: ["$concatthumbstory", "/", "$postID"]
                          },

                        },

                      ],
                      default: ''
                    }
                  },
                  mediaEndpoint: {
                    $switch: {
                      branches: [
                        {
                          'case': {
                            '$eq': ['$refs', 'mediapicts']
                          },
                          'then': {
                            $concat: ["$concatmediapict", "/", "$postID"]
                          },

                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediadiaries']
                          },
                          'then': {
                            $concat: ["$concatmediadiari", "/", "$postID"]
                          },

                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediavideos']
                          },
                          'then': {
                            $concat: ["$concatmediavideo", "/", "$postID"]
                          },

                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediastories']
                          },
                          'then': {
                            $concat: ["$concatmediastory", "/", "$postID"]
                          },

                        }
                      ],
                      default: ''
                    }
                  },
                  mediaThumbUri: {
                    $switch: {
                      branches: [
                        {
                          'case': {
                            '$eq': ['$refs', 'mediapicts']
                          },
                          'then': '$mediadiaries.mediaThumb'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediadiaries']
                          },
                          'then': '$mediadiaries.mediaThumb'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediavideos']
                          },
                          'then': '$mediavideos.mediaThumb'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediastories']
                          },
                          'then': '$mediastories.mediaThumb'
                        }
                      ],
                      default: ''
                    }
                  },
                  apsaraId: {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediapicts"
                            ]
                          },
                          then: "$mediapict.apsaraId"
                        },
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediadiaries"
                            ]
                          },
                          then: "$mediadiaries.apsaraId"
                        },
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediavideos"
                            ]
                          },
                          then: "$mediavideos.apsaraId"
                        },
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediastories"
                            ]
                          },
                          then: "$mediastories.apsaraId"
                        }
                      ],
                      default: false
                    }
                  },
                  apsara: {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediapicts"
                            ]
                          },
                          then: "$mediapict.apsara"
                        },
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediadiaries"
                            ]
                          },
                          then: "$mediadiaries.apsara"
                        },
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediavideos"
                            ]
                          },
                          then: "$mediavideos.apsara"
                        },
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediastories"
                            ]
                          },
                          then: "$mediastories.apsara"
                        }
                      ],
                      default: false
                    }
                  },

                }
              },
              { $sort: { jangkauan: -1 } },
              { $limit: 5 }

            ]
          }
        },
        {
          $project: {

            totalpost: {
              $arrayElemAt: ["$totalpost.totalpost", 0]
            },
            jangkauan: {
              $arrayElemAt: ["$jangkauan.total", 0]
            },
            post: 1
          }
        },

      ]

    );

    var data = [];

    for (var i = 0; i < query[0].post.length; i++) {
      let dataconten = await this.getapsaraDatabase(query[0].post, i);

      data.push(dataconten[i]);
    }

    var totalpost = 0;
    var jangkauan = 0;
    var sumtotal = 0;

    try {
      totalpost = query[0].totalpost;
    } catch (e) {
      totalpost = 0;
    }
    try {
      jangkauan = query[0].jangkauan;
    } catch (e) {
      jangkauan = 0;
    }

    sumtotal = totalpost + jangkauan;
    var persentotalpost = (totalpost * 100) / sumtotal;
    var persenjangkauan = (jangkauan * 100) / sumtotal;

    return {
      "totalpost": totalpost,
      "persentotalpost": persentotalpost.toFixed(2),
      "jangkauan": jangkauan,
      "persenjangkauan": persenjangkauan.toFixed(2),
      "post": data

    };

  }

  async boostconsolebawah(email: string, startdate: string, enddate: string, type: string, sessionId: any[], statusPengajuan: any[], descending: boolean, page: number, limit: number) {
    var pipeline = [];
    var order = null;
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();

      var dt = dateend.substring(0, 10);
    } catch (e) {
      dt = "";
    }

    var arrsessionId = [];
    var idsessionId = null;
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    var lengsessionId = null;

    try {
      lengsessionId = sessionId.length;
    } catch (e) {
      lengsessionId = 0;
    }
    if (lengsessionId > 0) {

      for (let i = 0; i < lengsessionId; i++) {
        let idses = sessionId[i];
        idsessionId = mongoose.Types.ObjectId(idses);
        arrsessionId.push(idsessionId);
      }
    }

    if (descending === true) {
      order = -1;
    } else {
      order = 1;
    }
    if (email && email !== undefined) {
      pipeline.push(
        {

          $match: {

            email: email
          }
        },
      );
    }

    pipeline.push(
      {

        $match: {
          $and: [{
            boosted: {
              $ne: []
            }
          }, {
            boosted: {
              $ne: null
            }
          }],
          active: true,

        }
      },
      {
        $set: {
          "datenow":
          {
            "$dateToString": {
              "format": "%Y-%m-%d %H:%M:%S",
              "date": {
                $add: [new Date(), + 25200000]
              }
            }
          }
        }
      },
      {
        $project: {
          refs: {
            $arrayElemAt: ['$contentMedias', 0]
          },
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          email: 1,
          postType: 1,
          description: 1,
          title: 1,
          active: 1,
          datenow: 1,

          jangkauan: {
            $size: {
              $arrayElemAt: ['$boosted.boostViewer', 0]
            },

          },
          typeboost: {
            $arrayElemAt: ['$boosted.type', 0]
          },
          start: {
            $arrayElemAt: ['$boosted.boostSession.start', 0]
          },
          end: {
            $arrayElemAt: ['$boosted.boostSession.end', 0]
          },
          boostSessionid: {
            $arrayElemAt: ['$boosted.boostSession.id', 0]
          },

        }
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'email',
          foreignField: 'email',
          as: 'databasic',

        },

      },
      {
        $unwind: {
          path: "$databasic",

        }
      },
      {
        $lookup: {
          from: 'boostSession',
          localField: 'boostSessionid',
          foreignField: '_id',
          as: 'boostSesidata',

        },

      },
      {
        "$lookup": {
          "from": "transactions",
          "as": "trans",
          "let": {
            "local_id": "$postID",

          },
          "pipeline": [
            {
              $match:
              {
                $expr: {
                  $eq: ['$postid', '$$local_id']
                }
              }
            },
            {
              $project: {
                iduserbuyer: 1,
                idusersell: 1,
                noinvoice: 1,
                status: 1,
                amount: 1,
                timestamp: 1,
                postid: 1
              }
            },
            {
              $match: {
                idusersell: '$databasic._id',
                status: "Success"
              }
            },

          ],

        },

      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          iduser: '$databasic._id',
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          postType: 1,
          email: 1,
          jangkauan: 1,
          start: 1,
          end: 1,
          typeboost: 1,
          sessionName: {
            $arrayElemAt: ['$boostSesidata.name', 0]
          },
          sessionType: {
            $arrayElemAt: ['$boostSesidata.type', 0]
          },
          sessionStart: {
            $arrayElemAt: ['$boostSesidata.start', 0]
          },
          sessionEnd: {
            $arrayElemAt: ['$boostSesidata.end', 0]
          },
          type: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$postType', 'pict']
                  },
                  'then': "HyppePic"
                },
                {
                  'case': {
                    '$eq': ['$postType', 'vid']
                  },
                  'then': "HyppeVid"
                },
                {
                  'case': {
                    '$eq': ['$postType', 'diary']
                  },
                  'then': "HyppeDiary"
                },
                {
                  'case': {
                    '$eq': ['$postType', 'story']
                  },
                  'then': "HyppeStory"
                },

              ],
              default: ''
            }
          },
          description: 1,
          title: 1,
          active: 1,
          datenow: 1,
          trans: 1,
          boostSessionid: 1
        }
      },
      {
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',

        },

      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',

        },

      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',

        },

      },
      {
        $lookup: {
          from: 'mediastories',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediastories_data',

        },

      },
      {
        $project: {
          mediapict: {
            $arrayElemAt: ['$mediaPict_data', 0]
          },
          mediadiaries: {
            $arrayElemAt: ['$mediadiaries_data', 0]
          },
          mediavideos: {
            $arrayElemAt: ['$mediavideos_data', 0]
          },
          mediastories: {
            $arrayElemAt: ['$mediastories_data', 0]
          },
          refs: 1,
          idmedia: 1,
          iduser: 1,
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          postType: 1,
          email: 1,
          type: 1,
          description: 1,
          title: 1,
          active: 1,
          jangkauan: 1,
          start: 1,
          end: 1,
          sessionName: 1,
          sessionType: 1,
          sessionStart: 1,
          sessionEnd: 1,
          datenow: 1,
          typeboost: 1,
          boostSessionid: 1,
          keterangan:
          {
            $cond: {
              if: {

                $eq: ["$trans", []]
              },
              then: 'Belum Terjual',
              else: 'Terjual',

            }
          },
          statusPengajuan: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$lt': ['$datenow', '$start'],

                  },
                  'then': 'Dijadwalkan'
                },
                {
                  'case': {
                    $and: [
                      {
                        '$gt': ['$datenow', '$start'],

                      },
                      {
                        '$lt': ['$datenow', '$end'],

                      }
                    ]
                  },
                  'then': 'Sedang Berlangsung'
                },
                {
                  'case': {
                    '$gt': ['$datenow', '$end'],

                  },
                  'then': 'Selesai'
                },

              ],
              default: 'Dijadwalkan'
            }
          },
          trans: 1
        }
      },
      {
        $addFields: {


          pict: {
            $replaceOne: {
              input: "$profilpict.mediaUri",
              find: "_0001.jpeg",
              replacement: ""
            }
          },
          concatmediapict: '/pict',
          media_pict: {
            $replaceOne: {
              input: "$mediapict.mediaUri",
              find: "_0001.jpeg",
              replacement: ""
            }
          },
          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',
          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri',
          concatmediastory:
          {
            $cond: {
              if: {

                $eq: ["$mediastories.mediaType", "image"]
              },
              then: '/pict',
              else: '/stream',

            }
          },
          concatthumbstory: '/thumb',
          media_story: '$mediastories.mediaUri'
        },

      },
      {
        $project: {
          iduser: 1,
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          postType: 1,
          email: 1,
          type: 1,
          description: 1,
          title: 1,
          active: 1,
          jangkauan: 1,
          start: 1,
          end: 1,
          sessionName: 1,
          sessionType: 1,
          sessionStart: 1,
          sessionEnd: 1,
          statusPengajuan: 1,
          datenow: 1,
          keterangan: 1,
          typeboost: 1,
          boostSessionid: 1,
          mediaBasePath: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': '$mediapict.mediaBasePath'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': '$mediadiaries.mediaBasePath'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': '$mediavideos.mediaBasePath'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediastories']
                  },
                  'then': '$mediastories.mediaBasePath'
                }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': '$mediapict.mediaUri'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': '$mediadiaries.mediaUri'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': '$mediavideos.mediaUri'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediastories']
                  },
                  'then': '$mediastories.mediaUri'
                }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': '$mediapict.mediaType'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': '$mediadiaries.mediaType'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': '$mediavideos.mediaType'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediastories']
                  },
                  'then': '$mediastories.mediaType'
                }
              ],
              default: ''
            }
          },
          mediaThumbEndpoint: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': '$mediadiaries.mediaThumb'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': {
                    $concat: ["$concatthumbdiari", "/", "$postID"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': {
                    $concat: ["$concatthumbvideo", "/", "$postID"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediastories']
                  },
                  'then': {
                    $concat: ["$concatthumbstory", "/", "$postID"]
                  },

                },

              ],
              default: ''
            }
          },
          mediaEndpoint: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': {
                    $concat: ["$concatmediapict", "/", "$postID"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': {
                    $concat: ["$concatmediadiari", "/", "$postID"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': {
                    $concat: ["$concatmediavideo", "/", "$postID"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediastories']
                  },
                  'then': {
                    $concat: ["$concatmediastory", "/", "$postID"]
                  },

                }
              ],
              default: ''
            }
          },
          mediaThumbUri: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$refs', 'mediapicts']
                  },
                  'then': '$mediadiaries.mediaThumb'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediadiaries']
                  },
                  'then': '$mediadiaries.mediaThumb'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediavideos']
                  },
                  'then': '$mediavideos.mediaThumb'
                },
                {
                  'case': {
                    '$eq': ['$refs', 'mediastories']
                  },
                  'then': '$mediastories.mediaThumb'
                }
              ],
              default: ''
            }
          },
          apsaraId: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediapict.apsaraId"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.apsaraId"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.apsaraId"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediastories"
                    ]
                  },
                  then: "$mediastories.apsaraId"
                }
              ],
              default: false
            }
          },
          apsara: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediapict.apsara"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.apsara"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.apsara"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediastories"
                    ]
                  },
                  then: "$mediastories.apsara"
                }
              ],
              default: false
            }
          },

        }
      },
    );

    if (type && type !== undefined) {
      pipeline.push({
        $match: {
          typeboost: type
        }
      },);
    }
    if (statusPengajuan && statusPengajuan !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              statusPengajuan: {
                $in: statusPengajuan
              }
            },

          ]
        }
      },);
    }
    if (sessionId && sessionId !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              boostSessionid: {
                $in: arrsessionId
              }
            },

          ]
        }
      },);
    }
    if (startdate && startdate !== undefined) {
      pipeline.push({ $match: { start: { $gte: startdate } } });
    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { start: { $lte: dt } } });
    }
    pipeline.push({
      $sort: {
        start: order
      },

    },);
    if (page > 0) {
      pipeline.push({ $skip: (page * limit) });
    }
    if (limit > 0) {
      pipeline.push({ $limit: limit });
    }
    var query = await this.getusercontentsModel.aggregate(pipeline);

    var data = [];

    for (var i = 0; i < query.length; i++) {
      let dataconten = await this.getapsaraDatabase(query, i);

      data.push(dataconten[i]);
    }

    return data;

  }

  async boostconsolebawahcount(email: string, startdate: string, enddate: string, type: string, sessionId: any[], statusPengajuan: any[]) {
    var pipeline = [];
    var order = null;
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();

      var dt = dateend.substring(0, 10);
    } catch (e) {
      dateend = "";
    }

    var arrsessionId = [];
    var idsessionId = null;
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    var lengsessionId = null;

    try {
      lengsessionId = sessionId.length;
    } catch (e) {
      lengsessionId = 0;
    }
    if (lengsessionId > 0) {

      for (let i = 0; i < lengsessionId; i++) {
        let idses = sessionId[i];
        idsessionId = mongoose.Types.ObjectId(idses);
        arrsessionId.push(idsessionId);
      }
    }

    if (email && email !== undefined) {
      pipeline.push(
        {

          $match: {

            email: email
          }
        },
      );
    }

    pipeline.push(
      {

        $match: {
          $and: [{
            boosted: {
              $ne: []
            }
          }, {
            boosted: {
              $ne: null
            }
          }],
          active: true,

        }
      },
      {
        $set: {
          "datenow":
          {
            "$dateToString": {
              "format": "%Y-%m-%d %H:%M:%S",
              "date": {
                $add: [new Date(), + 25200000]
              }
            }
          }
        }
      },
      {
        $project: {

          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          email: 1,
          postType: 1,
          description: 1,
          title: 1,
          active: 1,
          datenow: 1,

          jangkauan: {
            $size: {
              $arrayElemAt: ['$boosted.boostViewer', 0]
            },

          },
          typeboost: {
            $arrayElemAt: ['$boosted.type', 0]
          },
          start: {
            $arrayElemAt: ['$boosted.boostSession.start', 0]
          },
          end: {
            $arrayElemAt: ['$boosted.boostSession.end', 0]
          },
          boostSessionid: {
            $arrayElemAt: ['$boosted.boostSession.id', 0]
          },

        }
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'email',
          foreignField: 'email',
          as: 'databasic',

        },

      },
      {
        $unwind: {
          path: "$databasic",

        }
      },
      {
        $lookup: {
          from: 'boostSession',
          localField: 'boostSessionid',
          foreignField: '_id',
          as: 'boostSesidata',

        },

      },
      {
        "$lookup": {
          "from": "transactions",
          "as": "trans",
          "let": {
            "local_id": "$postID",

          },
          "pipeline": [
            {
              $match:
              {
                $expr: {
                  $eq: ['$postid', '$$local_id']
                }
              }
            },
            {
              $project: {
                iduserbuyer: 1,
                idusersell: 1,
                noinvoice: 1,
                status: 1,
                amount: 1,
                timestamp: 1,
                postid: 1
              }
            },
            {
              $match: {
                idusersell: '$databasic._id',
                status: "Success"
              }
            },

          ],

        },

      },
      {
        $project: {

          iduser: '$databasic._id',
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          postType: 1,
          email: 1,
          jangkauan: 1,
          start: 1,
          end: 1,
          typeboost: 1,
          sessionName: {
            $arrayElemAt: ['$boostSesidata.name', 0]
          },
          sessionType: {
            $arrayElemAt: ['$boostSesidata.type', 0]
          },
          sessionStart: {
            $arrayElemAt: ['$boostSesidata.start', 0]
          },
          sessionEnd: {
            $arrayElemAt: ['$boostSesidata.end', 0]
          },
          type: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$postType', 'pict']
                  },
                  'then': "HyppePic"
                },
                {
                  'case': {
                    '$eq': ['$postType', 'vid']
                  },
                  'then': "HyppeVid"
                },
                {
                  'case': {
                    '$eq': ['$postType', 'diary']
                  },
                  'then': "HyppeDiary"
                },
                {
                  'case': {
                    '$eq': ['$postType', 'story']
                  },
                  'then': "HyppeStory"
                },

              ],
              default: ''
            }
          },
          description: 1,
          title: 1,
          active: 1,
          datenow: 1,
          trans: 1,
          boostSessionid: 1
        }
      },

      {
        $project: {

          iduser: 1,
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          postType: 1,
          email: 1,
          type: 1,
          description: 1,
          title: 1,
          active: 1,
          jangkauan: 1,
          start: 1,
          end: 1,
          sessionName: 1,
          sessionType: 1,
          sessionStart: 1,
          sessionEnd: 1,
          datenow: 1,
          typeboost: 1,
          boostSessionid: 1,
          keterangan:
          {
            $cond: {
              if: {

                $eq: ["$trans", []]
              },
              then: 'Belum Terjual',
              else: 'Terjual',

            }
          },
          statusPengajuan: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$lt': ['$datenow', '$start'],

                  },
                  'then': 'Dijadwalkan'
                },
                {
                  'case': {
                    $and: [
                      {
                        '$gt': ['$datenow', '$start'],

                      },
                      {
                        '$lt': ['$datenow', '$end'],

                      }
                    ]
                  },
                  'then': 'Sedang Berlangsung'
                },
                {
                  'case': {
                    '$gt': ['$datenow', '$end'],

                  },
                  'then': 'Selesai'
                },

              ],
              default: 'Dijadwalkan'
            }
          },
          trans: 1
        }
      },

      {
        $project: {
          iduser: 1,
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          postType: 1,
          email: 1,
          type: 1,
          description: 1,
          title: 1,
          active: 1,
          jangkauan: 1,
          start: 1,
          end: 1,
          sessionName: 1,
          sessionType: 1,
          sessionStart: 1,
          sessionEnd: 1,
          statusPengajuan: 1,
          datenow: 1,
          keterangan: 1,
          typeboost: 1,
          boostSessionid: 1,


        }
      },
    );

    if (type && type !== undefined) {
      pipeline.push({
        $match: {
          typeboost: type
        }
      },);
    }
    if (statusPengajuan && statusPengajuan !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              statusPengajuan: {
                $in: statusPengajuan
              }
            },

          ]
        }
      },);
    }
    if (sessionId && sessionId !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              boostSessionid: {
                $in: arrsessionId
              }
            },

          ]
        }
      },);
    }
    if (startdate && startdate !== undefined) {
      pipeline.push({ $match: { start: { $gte: startdate } } });
    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { start: { $lte: dt } } });
    }

    pipeline.push({
      $group: {
        _id: null,
        totalpost: {
          $sum: 1
        }
      }
    });
    var query = await this.getusercontentsModel.aggregate(pipeline);
    return query;

  }

  async boostdetail(postID: string, startdate: string, enddate: string, page: number, limit: number) {
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();

      var dt = dateend.substring(0, 10);
    } catch (e) {
      dt = "";
    }
    var query = await this.getusercontentsModel.aggregate(
      [

        {

          $match: {
            $and: [{
              boosted: {
                $ne: []
              }
            }, {
              boosted: {
                $ne: null
              }
            }],
            active: true,
            postID: postID
          }
        },
        {
          $set: {
            datenow:
            {
              "$dateToString": {
                "format": "%Y-%m-%d %H:%M:%S",
                "date": {
                  $add: [new Date(), + 25200000]
                }
              }
            },
            salePrice: {
              $cmp: ["$saleAmount", 0]
            },
            sComments: {
              $cmp: ["$comments", 0]
            },

          }
        },
        {
          $facet: {
            "data": [
              {
                "$lookup": {
                  "from": "interests_repo",
                  "as": "kategori",
                  "let": {
                    "local_id": "$category.$id",

                  },
                  "pipeline": [
                    {
                      $match:
                      {
                        $and: [
                          {
                            $expr: {

                              $in: ['$_id', {
                                $ifNull: ['$$local_id', []]
                              }]
                            }
                          },

                        ]
                      }
                    },
                    {
                      $project: {
                        interestName: 1,

                      }
                    },

                  ],

                },

              },
              {
                $project: {
                  refs: {
                    $arrayElemAt: ['$contentMedias', 0]
                  },
                  createdAt: 1,
                  updatedAt: 1,
                  postID: 1,
                  email: 1,
                  postType: 1,
                  description: 1,
                  title: 1,
                  likes: 1,
                  views: 1,
                  active: 1,
                  datenow: 1,
                  kategori: 1,
                  jangkauan: {
                    $size: {
                      $arrayElemAt: ['$boosted.boostViewer', 0]
                    },

                  },
                  typeboost: {
                    $arrayElemAt: ['$boosted.type', 0]
                  },
                  interval: {
                    $arrayElemAt: ['$boosted.boostInterval.value', 0]
                  },
                  start: {
                    $arrayElemAt: ['$boosted.boostSession.start', 0]
                  },
                  end: {
                    $arrayElemAt: ['$boosted.boostSession.end', 0]
                  },
                  boostSessionid: {
                    $arrayElemAt: ['$boosted.boostSession.id', 0]
                  },
                  saleAmount: {
                    $cond: {
                      if: {
                        $or: [{
                          $eq: ["$salePrice", - 1]
                        }, {
                          $eq: ["$salePrice", 0]
                        }]
                      },
                      then: 0,
                      else: "$saleAmount"
                    }
                  },
                  monetize: {
                    $cond: {
                      if: {
                        $or: [{
                          $eq: ["$salePrice", - 1]
                        }, {
                          $eq: ["$salePrice", 0]
                        }]
                      },
                      then: false,
                      else: true
                    }
                  },
                  comments: {
                    $cond: {
                      if: {
                        $or: [{
                          $eq: ["$sComments", - 1]
                        }, {
                          $eq: ["$sComments", 0]
                        }]
                      },
                      then: 0,
                      else: "$sComments"
                    }
                  },

                }
              },
              {
                $lookup: {
                  from: 'userbasics',
                  localField: 'email',
                  foreignField: 'email',
                  as: 'databasic',

                },

              },
              {
                $unwind: {
                  path: "$databasic",

                }
              },
              {
                $lookup: {
                  from: 'boostSession',
                  localField: 'boostSessionid',
                  foreignField: '_id',
                  as: 'boostSesidata',

                },

              },
              {
                "$lookup": {
                  "from": "transactions",
                  "as": "trans",
                  "let": {
                    "local_id": "$postID",

                  },
                  "pipeline": [
                    {
                      $match:
                      {
                        $expr: {
                          $eq: ['$postid', '$$local_id']
                        }
                      }
                    },
                    {
                      $project: {
                        iduserbuyer: 1,
                        idusersell: 1,
                        noinvoice: 1,
                        status: 1,
                        amount: 1,
                        timestamp: 1,
                        postid: 1
                      }
                    },
                    {
                      $match: {
                        idusersell: '$databasic._id',
                        status: "Success"
                      }
                    },

                  ],

                },

              },
              {
                $project: {
                  refs: '$refs.$ref',
                  idmedia: '$refs.$id',
                  iduser: '$databasic._id',
                  createdAt: 1,
                  updatedAt: 1,
                  postID: 1,
                  postType: 1,
                  email: 1,
                  likes: 1,
                  views: 1,
                  comments: 1,
                  jangkauan: 1,
                  interval: 1,
                  start: 1,
                  end: 1,
                  typeboost: 1,
                  kategori: 1,
                  saleAmount: 1,
                  statusJual:
                  {
                    $cond: {
                      if: {

                        $eq: ["$monetize", false]
                      },
                      then: "TIDAK",
                      else: "YA"
                    }
                  },
                  sessionName: {
                    $arrayElemAt: ['$boostSesidata.name', 0]
                  },
                  sessionType: {
                    $arrayElemAt: ['$boostSesidata.type', 0]
                  },
                  sessionStart: {
                    $arrayElemAt: ['$boostSesidata.start', 0]
                  },
                  sessionEnd: {
                    $arrayElemAt: ['$boostSesidata.end', 0]
                  },
                  type: {
                    $switch: {
                      branches: [
                        {
                          'case': {
                            '$eq': ['$postType', 'pict']
                          },
                          'then': "HyppePic"
                        },
                        {
                          'case': {
                            '$eq': ['$postType', 'vid']
                          },
                          'then': "HyppeVid"
                        },
                        {
                          'case': {
                            '$eq': ['$postType', 'diary']
                          },
                          'then': "HyppeDiary"
                        },
                        {
                          'case': {
                            '$eq': ['$postType', 'story']
                          },
                          'then': "HyppeStory"
                        },

                      ],
                      default: ''
                    }
                  },
                  description: 1,
                  title: 1,
                  active: 1,
                  datenow: 1,
                  trans: 1,
                  boostSessionid: 1
                }
              },
              {
                $lookup: {
                  from: 'mediapicts',
                  localField: 'idmedia',
                  foreignField: '_id',
                  as: 'mediaPict_data',

                },

              },
              {
                $lookup: {
                  from: 'mediadiaries',
                  localField: 'idmedia',
                  foreignField: '_id',
                  as: 'mediadiaries_data',

                },

              },
              {
                $lookup: {
                  from: 'mediavideos',
                  localField: 'idmedia',
                  foreignField: '_id',
                  as: 'mediavideos_data',

                },

              },
              {
                $lookup: {
                  from: 'mediastories',
                  localField: 'idmedia',
                  foreignField: '_id',
                  as: 'mediastories_data',

                },

              },
              {
                $project: {
                  mediapict: {
                    $arrayElemAt: ['$mediaPict_data', 0]
                  },
                  mediadiaries: {
                    $arrayElemAt: ['$mediadiaries_data', 0]
                  },
                  mediavideos: {
                    $arrayElemAt: ['$mediavideos_data', 0]
                  },
                  mediastories: {
                    $arrayElemAt: ['$mediastories_data', 0]
                  },
                  refs: 1,
                  idmedia: 1,
                  iduser: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  postID: 1,
                  postType: 1,
                  email: 1,
                  type: 1,
                  description: 1,
                  title: 1,
                  active: 1,
                  jangkauan: 1,
                  interval: 1,
                  likes: 1,
                  views: 1,
                  comments: 1,
                  start: 1,
                  end: 1,
                  sessionName: 1,
                  sessionType: 1,
                  sessionStart: 1,
                  sessionEnd: 1,
                  datenow: 1,
                  typeboost: 1,
                  boostSessionid: 1,
                  kategori: 1,
                  saleAmount: 1,
                  dataview: 1,
                  statusJual: 1,
                  keterangan:
                  {
                    $cond: {
                      if: {

                        $eq: ["$trans", []]
                      },
                      then: 'Belum Terjual',
                      else: 'Terjual',

                    }
                  },
                  statusPengajuan: {
                    $switch: {
                      branches: [
                        {
                          'case': {
                            '$lt': ['$datenow', '$start'],

                          },
                          'then': 'Dijadwalkan'
                        },
                        {
                          'case': {
                            $and: [
                              {
                                '$gt': ['$datenow', '$start'],

                              },
                              {
                                '$lt': ['$datenow', '$end'],

                              }
                            ]
                          },
                          'then': 'Sedang Berlangsung'
                        },
                        {
                          'case': {
                            '$gt': ['$datenow', '$end'],

                          },
                          'then': 'Selesai'
                        },

                      ],
                      default: 'Dijadwalkan'
                    }
                  },
                  trans: 1
                }
              },
              {
                $addFields: {


                  pict: {
                    $replaceOne: {
                      input: "$profilpict.mediaUri",
                      find: "_0001.jpeg",
                      replacement: ""
                    }
                  },
                  concatmediapict: '/pict',
                  media_pict: {
                    $replaceOne: {
                      input: "$mediapict.mediaUri",
                      find: "_0001.jpeg",
                      replacement: ""
                    }
                  },
                  concatmediadiari: '/stream',
                  concatthumbdiari: '/thumb',
                  media_diari: '$mediadiaries.mediaUri',
                  concatmediavideo: '/stream',
                  concatthumbvideo: '/thumb',
                  media_video: '$mediavideos.mediaUri',
                  concatmediastory:
                  {
                    $cond: {
                      if: {

                        $eq: ["$mediastories.mediaType", "image"]
                      },
                      then: '/pict',
                      else: '/stream',

                    }
                  },
                  concatthumbstory: '/thumb',
                  media_story: '$mediastories.mediaUri'
                },

              },
              {
                $project: {
                  iduser: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  postID: 1,
                  postType: 1,
                  email: 1,
                  type: 1,
                  description: 1,
                  title: 1,
                  active: 1,
                  jangkauan: 1,
                  interval: 1,
                  likes: 1,
                  views: 1,
                  comments: 1,
                  start: 1,
                  end: 1,
                  sessionName: 1,
                  sessionType: 1,
                  sessionStart: 1,
                  sessionEnd: 1,
                  statusPengajuan: 1,
                  datenow: 1,
                  keterangan: 1,
                  typeboost: 1,
                  boostSessionid: 1,
                  kategori: 1,
                  saleAmount: 1,
                  statusJual: 1,
                  dataview: 1,
                  mediaBasePath: {
                    $switch: {
                      branches: [
                        {
                          'case': {
                            '$eq': ['$refs', 'mediapicts']
                          },
                          'then': '$mediapict.mediaBasePath'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediadiaries']
                          },
                          'then': '$mediadiaries.mediaBasePath'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediavideos']
                          },
                          'then': '$mediavideos.mediaBasePath'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediastories']
                          },
                          'then': '$mediastories.mediaBasePath'
                        }
                      ],
                      default: ''
                    }
                  },
                  mediaUri: {
                    $switch: {
                      branches: [
                        {
                          'case': {
                            '$eq': ['$refs', 'mediapicts']
                          },
                          'then': '$mediapict.mediaUri'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediadiaries']
                          },
                          'then': '$mediadiaries.mediaUri'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediavideos']
                          },
                          'then': '$mediavideos.mediaUri'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediastories']
                          },
                          'then': '$mediastories.mediaUri'
                        }
                      ],
                      default: ''
                    }
                  },
                  mediaType: {
                    $switch: {
                      branches: [
                        {
                          'case': {
                            '$eq': ['$refs', 'mediapicts']
                          },
                          'then': '$mediapict.mediaType'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediadiaries']
                          },
                          'then': '$mediadiaries.mediaType'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediavideos']
                          },
                          'then': '$mediavideos.mediaType'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediastories']
                          },
                          'then': '$mediastories.mediaType'
                        }
                      ],
                      default: ''
                    }
                  },
                  mediaThumbEndpoint: {
                    $switch: {
                      branches: [
                        {
                          'case': {
                            '$eq': ['$refs', 'mediapicts']
                          },
                          'then': '$mediadiaries.mediaThumb'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediadiaries']
                          },
                          'then': {
                            $concat: ["$concatthumbdiari", "/", "$postID"]
                          },

                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediavideos']
                          },
                          'then': {
                            $concat: ["$concatthumbvideo", "/", "$postID"]
                          },

                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediastories']
                          },
                          'then': {
                            $concat: ["$concatthumbstory", "/", "$postID"]
                          },

                        },

                      ],
                      default: ''
                    }
                  },
                  mediaEndpoint: {
                    $switch: {
                      branches: [
                        {
                          'case': {
                            '$eq': ['$refs', 'mediapicts']
                          },
                          'then': {
                            $concat: ["$concatmediapict", "/", "$postID"]
                          },

                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediadiaries']
                          },
                          'then': {
                            $concat: ["$concatmediadiari", "/", "$postID"]
                          },

                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediavideos']
                          },
                          'then': {
                            $concat: ["$concatmediavideo", "/", "$postID"]
                          },

                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediastories']
                          },
                          'then': {
                            $concat: ["$concatmediastory", "/", "$postID"]
                          },

                        }
                      ],
                      default: ''
                    }
                  },
                  mediaThumbUri: {
                    $switch: {
                      branches: [
                        {
                          'case': {
                            '$eq': ['$refs', 'mediapicts']
                          },
                          'then': '$mediadiaries.mediaThumb'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediadiaries']
                          },
                          'then': '$mediadiaries.mediaThumb'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediavideos']
                          },
                          'then': '$mediavideos.mediaThumb'
                        },
                        {
                          'case': {
                            '$eq': ['$refs', 'mediastories']
                          },
                          'then': '$mediastories.mediaThumb'
                        }
                      ],
                      default: ''
                    }
                  },
                  apsaraId: {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediapicts"
                            ]
                          },
                          then: "$mediapict.apsaraId"
                        },
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediadiaries"
                            ]
                          },
                          then: "$mediadiaries.apsaraId"
                        },
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediavideos"
                            ]
                          },
                          then: "$mediavideos.apsaraId"
                        },
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediastories"
                            ]
                          },
                          then: "$mediastories.apsaraId"
                        }
                      ],
                      default: false
                    }
                  },
                  apsara: {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediapicts"
                            ]
                          },
                          then: "$mediapict.apsara"
                        },
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediadiaries"
                            ]
                          },
                          then: "$mediadiaries.apsara"
                        },
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediavideos"
                            ]
                          },
                          then: "$mediavideos.apsara"
                        },
                        {
                          case: {
                            $eq: [
                              "$refs",
                              "mediastories"
                            ]
                          },
                          then: "$mediastories.apsara"
                        }
                      ],
                      default: false
                    }
                  },

                }
              },

            ],
            "gender": [
              {
                $unwind: {
                  path: "$boosted",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$boosted.boostViewer",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  userEmail: "$boosted.boostViewer.email",

                }
              },
              {
                "$lookup": {
                  "from": "userbasics",
                  "as": "dataview",
                  let: {
                    localID: '$userEmail'
                  },
                  "pipeline": [
                    {
                      $match:
                      {
                        $and: [
                          {
                            $expr: {
                              $eq: ["$email", "$$localID"]
                            }
                          },

                        ],

                      }
                    },
                    {
                      $project: {

                        gender: 1,

                      }
                    },

                  ],

                },

              },
              {
                $unwind: {
                  path: "$dataview",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  _id: 1,
                  userID: "$dataview._id",
                  gender: "$dataview.gender",

                }
              },
              {
                $project: {

                  gender: {

                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: ['$gender', 'FEMALE']
                          },
                          then: 'FEMALE',

                        },
                        {
                          case: {
                            $eq: ['$gender', ' FEMALE']
                          },
                          then: 'FEMALE',

                        },
                        {
                          case: {
                            $eq: ['$gender', 'Perempuan']
                          },
                          then: 'FEMALE',

                        },
                        {
                          case: {
                            $eq: ['$gender', 'Wanita']
                          },
                          then: 'FEMALE',

                        },
                        {
                          case: {
                            $eq: ['$gender', 'MALE']
                          },
                          then: 'MALE',

                        },
                        {
                          case: {
                            $eq: ['$gender', ' MALE']
                          },
                          then: 'MALE',

                        },
                        {
                          case: {
                            $eq: ['$gender', 'Laki-laki']
                          },
                          then: 'MALE',

                        },
                        {
                          case: {
                            $eq: ['$gender', 'Pria']
                          },
                          then: 'MALE',

                        },

                      ],
                      default: "OTHER",

                    },

                  },

                }
              },
              {
                $project: {
                  gender: 1,

                }
              },
              {
                "$group": {
                  "_id": "$gender",
                  "count": {
                    "$sum": 1
                  }
                }
              }
            ],
            "wilayah": [
              {
                $unwind: {
                  path: "$boosted",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$boosted.boostViewer",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  userEmail: "$boosted.boostViewer.email",

                }
              },
              {
                "$lookup": {
                  "from": "userbasics",
                  "as": "dataview",
                  let: {
                    localID: '$userEmail'
                  },
                  "pipeline": [
                    {
                      $match:
                      {
                        $and: [
                          {
                            $expr: {
                              $eq: ["$email", "$$localID"]
                            }
                          },

                        ],

                      }
                    },
                    {
                      $project: {

                        states: 1,

                      }
                    },

                  ],

                },

              },
              {
                $unwind: {
                  path: "$dataview",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  _id: 1,
                  userID: "$dataview._id",
                  states: "$dataview.states",

                }
              },
              {
                $lookup: {
                  from: 'areas',
                  localField: 'states.$id',
                  foreignField: '_id',
                  as: 'areas_data',

                },

              },
              {
                $unwind: {
                  path: "$areas_data",

                }
              },
              {
                $project: {

                  stateName: '$areas_data.stateName'
                }
              },
              {
                "$group": {
                  "_id": "$stateName",
                  "count": {
                    "$sum": 1
                  }
                }
              }
            ],
            "age": [
              {
                $unwind: {
                  path: "$boosted",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$boosted.boostViewer",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  userEmail: "$boosted.boostViewer.email",

                }
              },
              {
                "$lookup": {
                  "from": "userbasics",
                  "as": "dataview",
                  let: {
                    localID: '$userEmail'
                  },
                  "pipeline": [
                    {
                      $match:
                      {
                        $and: [
                          {
                            $expr: {
                              $eq: ["$email", "$$localID"]
                            }
                          },

                        ],

                      }
                    },
                    {
                      $project: {
                        dob: 1,

                      }
                    },
                    {
                      $project: {

                        age: {
                          $cond: {
                            if: {
                              $and: [
                                '$dob',
                                {
                                  $ne: ["$dob", ""]
                                }
                              ]
                            },
                            then: {
                              $toInt: {
                                $divide: [{
                                  $subtract: [new Date(), {
                                    $toDate: "$dob"
                                  }]
                                }, (365 * 24 * 60 * 60 * 1000)]
                              }
                            },
                            else: 0
                          }
                        },

                      }
                    },

                  ],

                },

              },
              {
                $unwind: {
                  path: "$dataview",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  _id: 1,
                  userID: "$dataview._id",
                  age: "$dataview.age",

                }
              },
              {
                $project: {

                  ageQualication: {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $gt: ["$age", 44]
                          },
                          then: "< 44 Tahun"
                        },
                        {
                          case: {
                            $and: [{
                              $gte: ["$age", 36]
                            }, {
                              $lte: ["$age", 44]
                            }]
                          },
                          then: "35-44 Tahun"
                        },
                        {
                          case: {
                            $and: [{
                              $gte: ["$age", 25]
                            }, {
                              $lte: ["$age", 35]
                            }]
                          },
                          then: "24-35 Tahun"
                        },
                        {
                          case: {
                            $and: [{
                              $gte: ["$age", 14]
                            }, {
                              $lte: ["$age", 24]
                            }]
                          },
                          then: "14-24 Tahun"
                        },
                        {
                          case: {
                            $and: [{
                              $gte: ["$age", 1]
                            }, {
                              $lt: ["$age", 14]
                            }]
                          },
                          then: "< 14 Tahun"
                        }
                      ],
                      "default": "other"
                    }
                  },

                }
              },
              {
                "$group": {
                  "_id": "$ageQualication",
                  "count": {
                    "$sum": 1
                  }
                }
              }
            ],
            "komentar": [
              {
                "$lookup": {
                  "from": "disquslogs",
                  "as": "komentar",
                  "let": {
                    "local_id": "$postID"
                  },
                  "pipeline": [
                    {
                      "$match": {
                        "$expr": {
                          "$eq": [
                            "$postID",
                            "$$local_id"
                          ]
                        }
                      }
                    },
                    {
                      $project: {
                        postID: 1,
                        txtMessages: 1,
                        sender: 1,
                        receiver: 1,
                        createdAt: 1,
                        active: 1
                      }
                    },
                    {
                      $match: {
                        active: true
                      }
                    },
                    {
                      $sort: {
                        createdAt: - 1
                      }
                    },
                    {
                      $skip: (page * limit)
                    },
                    {
                      $limit: limit
                    },

                  ],

                }
              },
              {
                $unwind: {
                  path: "$komentar",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                "$lookup": {
                  "from": "userauths",
                  "as": "authsender",
                  "let": {
                    "local_id": "$komentar.sender"
                  },
                  "pipeline": [
                    {
                      "$match": {
                        "$expr": {
                          "$eq": [
                            "$email",
                            "$$local_id"
                          ]
                        }
                      }
                    },

                  ],

                }
              },
              {
                $project: {
                  authsender: {
                    $arrayElemAt: ['$authsender', 0]
                  },
                  receiver: '$komentar.receiver',
                  postID: '$komentar.postID',
                  txtMessages: '$komentar.txtMessages',
                  createdAt: '$komentar.createdAt',
                  active: '$komentar.active'
                }
              },
              {
                "$lookup": {
                  "from": "userauths",
                  "as": "authreceiver",
                  "let": {
                    "local_id": "$komentar.receiver"
                  },
                  "pipeline": [
                    {
                      "$match": {
                        "$expr": {
                          "$eq": [
                            "$email",
                            "$$local_id"
                          ]
                        }
                      }
                    },

                  ],

                }
              },
              {
                $project: {
                  emailsender: '$authsender.email',
                  sender: '$authsender.username',
                  authreceive: {
                    $arrayElemAt: ['$authreceiver', 0]
                  },
                  postID: 1,
                  txtMessages: 1,
                  receiver: 1,
                  createdAt: 1,
                  active: 1
                }
              },
              {
                $project: {
                  emailsender: 1,
                  sender: 1,
                  receiver: '$authreceive.username',
                  postID: 1,
                  txtMessages: 1,
                  createdAt: 1,
                  active: 1
                }
              },
              {
                "$lookup": {
                  "from": "userbasics",
                  "as": "ubasic",
                  "let": {
                    "local_id": "$emailsender"
                  },
                  "pipeline": [
                    {
                      "$match": {
                        "$expr": {
                          "$eq": [
                            "$email",
                            "$$local_id"
                          ]
                        }
                      }
                    },

                  ],

                }
              },
              {
                $project: {
                  ubasic: {
                    $arrayElemAt: ['$ubasic', 0]
                  },
                  sender: 1,
                  receiver: 1,
                  postID: 1,
                  txtMessages: 1,
                  createdAt: 1,
                  active: 1,
                  emailsender: 1
                }
              },
              {
                $project: {

                  sender: 1,
                  receiver: 1,
                  postID: 1,
                  txtMessages: 1,
                  createdAt: 1,
                  active: 1,
                  emailsender: 1,
                  profilePict: '$ubasic.profilePict.$id'
                }
              },
              {
                $project: {

                  sender: 1,
                  receiver: 1,
                  postID: 1,
                  txtMessages: 1,
                  createdAt: 1,
                  active: 1,
                  emailsender: 1,
                  avatar: [{
                    mediaEndpoint: {
                      "$concat": ["/profilepict/", "$profilePict"]
                    }
                  }]
                }
              },

            ],
            "summary": [
              {
                $unwind: {
                  path: "$boosted",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $unwind: {
                  path: "$boosted.boostViewer",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  userEmail: "$boosted.boostViewer.email",
                  createAt: "$boosted.boostViewer.createAt",

                }
              },
              {
                $match: {
                  createAt: { $gte: startdate, $lte: dt }
                }
              },
              {
                $group: {
                  _id: {
                    tgl: {
                      $substrCP: ['$createAt', 0, 10]
                    }
                  },
                  count: {
                    $sum: 1
                  },

                },

              },
              {
                $project: {
                  _id: 0,
                  date: "$_id.tgl",
                  jangkauan: "$count"
                }
              },
              {
                $sort: { date: 1 }
              }
            ],

          }
        },
      ]

    );

    return query;
  }
}


