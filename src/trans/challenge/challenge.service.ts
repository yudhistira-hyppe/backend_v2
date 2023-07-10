import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Challenge, challengeDocument } from './schemas/challenge.schema';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { Pipeline } from 'ioredis';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel(Challenge.name, 'SERVER_FULL')
    private readonly ChallengeModel: Model<challengeDocument>,
  ) { }

  async create(Challenge_: CreateChallengeDto) {
    const _Challenge_ = await this.ChallengeModel.create(Challenge_);
    return _Challenge_;
  }

  async findAll(namachallenge: string, menuChallenge: string, startdate: string, enddate: string, objectchallenge: any[], statuschallenge: any[], caragabung: any[], ascending: boolean, page: number, limit: number) {
    var pipeline = [];

    var firstmatch = [];

    if (namachallenge != null && namachallenge != undefined) {
      firstmatch.push(
        {
          "nameChallenge":
          {
            "$regex": namachallenge,
            "$options": "i"
          }
        },
      );
    }

    if (startdate != null && enddate != undefined) {
      try {
        var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

        var dateend = currentdate.toISOString().split("T")[0];
      } catch (e) {
        dateend = "";
      }

      firstmatch.push(
        {
          "$expr":
          {
            "$gte":
              [
                "$createdAt",
                startdate
              ]
          }
        },
        {
          "$expr":
          {
            "$lte":
              [
                "$createdAt",
                dateend
              ]
          }
        }
      );
    }

    if (objectchallenge != null && objectchallenge != undefined) {
      var konversiobject = objectchallenge.toString().split(",");
      firstmatch.push(
        {
          "$expr":
          {
            "$in":
              [
                "$objectChallenge", konversiobject
              ]
          }
        }
      );
    }

    if (caragabung != null && caragabung != undefined) {
      var konversigabung = caragabung.toString().split(",");
      firstmatch.push(
        {
          "$expr":
          {
            "$in":
              [
                {
                  "$arrayElemAt":
                    [
                      "$peserta.caraGabung", 0
                    ]
                },
                konversigabung
              ]
          }
        },
      );
    }

    if (firstmatch.length != 0) {
      pipeline.push(
        {
          "$match":
          {
            "$and": firstmatch
          }
        }
      );
    }

    pipeline.push(
      {
        $lookup:
        {
          from: "jenisChallenge",
          localField: "jenisChallenge",
          foreignField: "_id",
          as: "jenisChallenge_fk"
        }
      },
      {
        $set: {
          "timenow":
          {
            "$dateToString": {
              "format": "%Y-%m-%d %H:%M:%S",
              "date": {
                $add: [new Date(), 25200000]
              }
            }
          }
        }
      },
      {
        "$project":
        {
          _id: 1,
          nameChallenge: 1,
          jenisChallenge: 1,
          jenisChallenge_fk:
          {
            "$arrayElemAt":
              [
                "$jenisChallenge_fk.name", 0
              ]
          },
          caragabung:
          {
            "$arrayElemAt":
              [
                "$peserta.caraGabung", 0
              ]
          },
          statuscurrentChallenge:
          {
            "$switch":
            {
              branches:
                [
                  {
                    case:
                    {
                      "$and":
                        [
                          {
                            "$gte": [
                              "$timenow",
                              {
                                "$concat":
                                  [
                                    "$startChallenge",
                                    " ",
                                    "$startTime"
                                  ]
                              }
                            ]
                          },
                          {
                            "$lte": [
                              "$timenow",
                              {
                                "$concat":
                                  [
                                    "$endChallenge",
                                    " ",
                                    "$endTime"
                                  ]
                              }
                            ]
                          },
                        ]
                    },
                    then: "SEDANG BERJALAN"
                  },
                  {
                    case:
                    {
                      "$and":
                        [
                          {
                            "$gt": [
                              "$timenow",
                              {
                                "$concat":
                                  [
                                    "$endChallenge",
                                    " ",
                                    "$endTime"
                                  ]
                              }
                            ]
                          },
                        ]
                    },
                    then: "SELESAI"
                  },
                ],
              default: "AKAN DATANG"
            }
          },
          bannerLeaderboard:
          {
            "$arrayElemAt":
              [
                "$leaderBoard.bannerLeaderboard", 0
              ]
          },
          statusChallenge: 1,
          objectChallenge: 1,
          startChallenge: 1,
          endChallenge: 1,
          createdAt: 1
        }
      },
    );

    if (menuChallenge != null && menuChallenge != undefined) {
      if (menuChallenge == 'DRAFT') {
        pipeline.push(
          {
            "$match":
            {
              "$expr":
              {
                "$eq":
                  [
                    "$statusChallenge", 'DRAFT'
                  ]
              }
            }
          }
        );
      }
      else {
        var mongo = require('mongoose');
        var convertid = mongo.Types.ObjectId(menuChallenge);
        pipeline.push(
          {
            "$match":
            {
              "$and":
                [
                  {
                    "$expr":
                    {
                      "$eq":
                        [
                          "$jenisChallenge", convertid
                        ]
                    }
                  },
                  {
                    "$expr":
                    {
                      "$ne":
                        [
                          "$statusChallenge", 'DRAFT'
                        ]
                    }
                  },
                  {
                    "$expr":
                    {
                      "$ne":
                        [
                          "$statusChallenge", 'NONACTIVE'
                        ]
                    }
                  },
                ]
            }
          }
        );
      }
    }

    if (statuschallenge != null && statuschallenge != undefined) {
      var konversistatus = statuschallenge.toString().split(",");
      pipeline.push(
        {
          "$match":
          {
            "$expr":
            {
              "$in":
                [
                  "$statuscurrentChallenge", konversistatus
                ]
            }
          }
        }
      );
    }

    if (ascending != null) {
      var setascending = null;
      if (ascending == true) {
        setascending = 1;
      }
      else {
        setascending = -1;
      }

      pipeline.push({
        "$sort":
        {
          "createdAt": setascending
        }
      });
    }

    if (page > 0) {
      pipeline.push({
        "$skip": limit * page
      });
    }

    if (limit > 0) {
      pipeline.push({
        "$limit": limit
      });
    }

    // console.log(JSON.stringify(pipeline));

    var query = await this.ChallengeModel.aggregate(pipeline);
    return query;
  }

  async findOne(id: string): Promise<Challenge> {
    return this.ChallengeModel.findOne({ _id: new Types.ObjectId(id) }).exec();
  }

  async detailchallenge(id: string) {
    var mongo = require('mongoose');
    var konvertid = mongo.Types.ObjectId(id);

    var query = await this.ChallengeModel.aggregate([
      {
        "$match":
        {
          _id: konvertid
        }
      },
      {
        "$lookup":
        {
          from: "jenisChallenge",
          as: "jenischallenge_data",
          let:
          {
            jenis_challenge_fk: "$jenisChallenge"
          },
          pipeline: [
            {
              "$match":
              {
                "$and":
                  [
                    {
                      "$expr":
                      {
                        "$eq":
                          [
                            "$$jenis_challenge_fk", "$_id"
                          ]
                      }
                    },
                  ]
              }
            },
            {
              "$project":
              {
                _id: 0,
                name: 1,
              }
            }
          ]
        }
      },
      {
        "$lookup":
        {
          from: "userChallenge",
          as: "userChallenge_data",
          let:
          {
            userChallenge_fk: "$_id"
          },
          pipeline: [
            {
              "$match":
              {
                "$and":
                  [
                    {
                      "$expr":
                      {
                        "$eq":
                          [
                            "$$userChallenge_fk", "$idChallenge"
                          ]
                      }
                    },
                  ]
              }
            },
            {
              "$group":
              {
                _id: "$idSubChallenge",
                total:
                {
                  "$sum": 1
                }
              }
            },
            {
              "$lookup":
              {
                from: "subChallenge",
                as: "subChallenge_data",
                let:
                {
                  subChallenge_fk: "$_id"
                },
                pipeline: [
                  {
                    "$match":
                    {
                      "$expr":
                      {
                        "$eq":
                          [
                            "$$subChallenge_fk", "$_id"
                          ]
                      }
                    }
                  },
                  {
                    "$project":
                    {
                      _id: 1,
                      session: 1,
                      startDatetime: 1,
                      endDatetime: 1,
                    }
                  }
                ]
              }
            },
            {
              "$project":
              {
                _id: 1,
                total: 1,
                startDatetime:
                {
                  "$arrayElemAt":
                    [
                      "$subChallenge_data.startDatetime", 0
                    ]
                },
                endDatetime:
                {
                  "$arrayElemAt":
                    [
                      "$subChallenge_data.endDatetime", 0
                    ]
                },
                session:
                {
                  "$arrayElemAt":
                    [
                      "$subChallenge_data.session", 0
                    ]
                }
              }
            },
            {
              "$sort":
              {
                session: 1
              }
            }
          ]
        }
      },
      {
        "$project":
        {
          _id: 1,
          nameChallenge: 1,
          jenisChallenge: 1,
          jenisChallengeName:
          {
            "$arrayElemAt":
              [
                "$jenischallenge_data.name", 0
              ]
          },
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          totaldurasi:
          {
            "$multiply":
              [
                "$durasi",
                "$jumlahSiklusdurasi"
              ]
            // "$dateDiff":
            // {
            //     startDate:
            //     {
            //         "$toDate":"$startChallenge",
            //     },
            //     endDate:
            //     {
            //         "$toDate":"$endChallenge",
            //     },
            //     unit:"day"
            // }
          },
          durasi: 1,
          startChallenge: 1,
          endChallenge: 1,
          startTime:
          {
            "$concat":
              [
                "$startChallenge",
                " ",
                "$startTime",
              ]
          },
          endTime:
          {
            "$concat":
              [
                "$endChallenge",
                " ",
                "$endTime",
              ]
          },
          jumlahSiklusdurasi: 1,
          tampilStatusPengguna: 1,
          objectChallenge: 1,
          statusChallenge: 1,
          metrik: 1,
          peserta: 1,
          leaderBoard: 1,
          ketentuanHadiah: 1,
          hadiahPemenang: 1,
          bannerSearch: 1,
          popUp: 1,
          notifikasiPush: 1,
          session: "$userChallenge_data",
          juara1:
          {
            "$ifNull":
              [
                {
                  "$let":
                  {
                    vars:
                    {
                      databadge:
                      {
                        "$arrayElemAt":
                          [
                            {
                              "$let":
                              {
                                vars:
                                {
                                  badgeId:
                                  {
                                    "$arrayElemAt":
                                      [
                                        "$ketentuanHadiah", 0
                                      ]
                                  }
                                },
                                in: "$$badgeId.badge"
                              }
                            },
                            0
                          ]
                      }
                    },
                    in: "$$databadge.juara1"
                  }
                },
                null
              ]
          },
          juara2:
          {
            "$ifNull":
              [
                {
                  "$let":
                  {
                    vars:
                    {
                      databadge:
                      {
                        "$arrayElemAt":
                          [
                            {
                              "$let":
                              {
                                vars:
                                {
                                  badgeId:
                                  {
                                    "$arrayElemAt":
                                      [
                                        "$ketentuanHadiah", 0
                                      ]
                                  }
                                },
                                in: "$$badgeId.badge"
                              }
                            },
                            0
                          ]
                      }
                    },
                    in: "$$databadge.juara2"
                  }
                },
                null
              ]
          },
          juara3:
          {
            "$ifNull":
              [
                {
                  "$let":
                  {
                    vars:
                    {
                      databadge:
                      {
                        "$arrayElemAt":
                          [
                            {
                              "$let":
                              {
                                vars:
                                {
                                  badgeId:
                                  {
                                    "$arrayElemAt":
                                      [
                                        "$ketentuanHadiah", 0
                                      ]
                                  }
                                },
                                in: "$$badgeId.badge"
                              }
                            },
                            0
                          ]
                      }
                    },
                    in: "$$databadge.juara3"
                  }
                },
                null
              ]
          },
        }
      },
      {
        "$lookup":
        {
          from: "badge",
          as: "badge_data",
          let:
          {
            juara1: "$juara1",
            juara2: "$juara2",
            juara3: "$juara3",
          },
          pipeline:
            [
              {
                "$match":
                {
                  "$expr":
                  {
                    "$in":
                      [
                        "$_id", ["$$juara1", "$$juara2", "$$juara3"]
                      ]
                  }
                }
              },
              {
                "$sort":
                {
                  type: 1
                }
              },
              {
                "$project":
                {
                  _id: 1,
                  type: 1,
                  badgeProfile: 1,
                  badgeOther: 1
                }
              }
            ]
        }
      },
      {
        "$lookup":
        {
          from: "areas",
          as: "areas_data",
          let:
          {
            listarea:
            {
              "$arrayElemAt":
                [
                  "$peserta.lokasiPengguna",
                  0
                ]
            },
          },
          pipeline:
            [
              {
                "$match":
                {
                  "$expr":
                  {
                    "$in":
                      [
                        "$_id", "$$listarea"
                      ]
                  }
                }
              },
              {
                "$group":
                {
                  _id: null,
                  data:
                  {
                    "$push":
                    {
                      _id: "$_id",
                      stateName: "$stateName"
                    }
                  }
                }
              }
            ]
        }
      },
      {
        $set: {
          "timenow":
          {
            "$dateToString": {
              "format": "%Y-%m-%d %H:%M:%S",
              "date": {
                $add: [
                  new Date(), 25200000
                ]
              }
            }
          }
        }
      },
      {
        "$unwind":
        {
            path:"$notifikasiPush"
        }
    },
    {
        "$project":
        {
            _id: 1,
            nameChallenge: 1,
            jenisChallenge: 1,
            jenisChallengeName: 1,
            description: 1,
            createdAt: 1,
            updatedAt: 1,
            durasi: 1,
            totaldurasi: 1,
            startChallenge: 1,
            endChallenge: 1,
            startTime: 1,
            endTime: 1,
            jumlahSiklusdurasi: 1,
            tampilStatusPengguna: 1,
            objectChallenge: 1,
            statusChallenge: 1,
            statuscurrentChallenge: 
            {
              "$switch":
              {
                branches:
                  [
                    {
                      case:
                      {
                        "$and":
                          [
                            {
                              "$gte": [
                                "$timenow", 
                                "$startTime"
                              ]
                            },
                            {
                              "$lte": [
                                "$timenow", 
                                "$endTime"
                              ]
                            },
                          ]
                      },
                      then: "SEDANG BERJALAN"
                    },
                    {
                      case:
                      {
                        "$and":
                          [
                            {
                              "$gt": [
                                "$timenow", 
                                "$endTime",
                              ]
                            },
                          ]
                      },
                      then: "SELESAI"
                    },
                  ],
                default: "AKAN DATANG"
              }
            },
            metrik: 1,
            leaderBoard: 1,
            ketentuanHadiah:
            [
              {
                    badgePemenang:
                    {
                        "$arrayElemAt":
                        [
                            "$ketentuanHadiah.badgePemenang",
                            0
                        ]
                    },
                    Height: 
                    {
                        "$arrayElemAt":
                        [
                            "$ketentuanHadiah.Height",
                            0
                        ]
                    },
                    Width:
                    {
                        "$arrayElemAt":
                        [
                            "$ketentuanHadiah.Width",
                            0
                        ]
                    },
                    maxSize: 
                    {
                        "$arrayElemAt":
                        [
                            "$ketentuanHadiah.maxSize",
                            0
                        ]
                    },
                    minSize: 
                    {
                        "$arrayElemAt":
                        [
                            "$ketentuanHadiah.minSize",
                            0
                        ]
                    },
                    formatFile: 
                    {
                        "$arrayElemAt":
                        [
                            "$ketentuanHadiah.formatFile",
                            0
                        ]
                    },
                    badge:
                    {
                      "$cond":
                      {
                        if:
                        {
                          "$eq":
                          [
                            {
                                "$arrayElemAt":
                                [
                                    "$ketentuanHadiah.badgePemenang",
                                    0
                                ]
                            }, 
                            false
                          ]
                        },
                        then: [],
                        else: [
                          {
                            juara1: 
                            {
                                "$cond":
                                {
                                    if:
                                    {
                                        "$eq":
                                        [
                                            "$juara1", null
                                        ]
                                    },
                                    then: "$$REMOVE",
                                    else: "$juara1"
                                }
                            },
                            juara1_general:
                            {
                                "$arrayElemAt":
                                [
                                    "$badge_data.badgeOther",
                                    0
                                ]
                            },
                            juara1_profile:
                            {
                                "$arrayElemAt":
                                [
                                    "$badge_data.badgeProfile",
                                    0
                                ]
                            },
                            juara2: 
                            {
                                "$cond":
                                {
                                    if:
                                    {
                                        "$eq":
                                        [
                                            "$juara2", null
                                        ]
                                    },
                                    then: "$$REMOVE",
                                    else: "$juara2"
                                }
                            },
                            juara2_general:
                            {
                                "$arrayElemAt":
                                [
                                    "$badge_data.badgeOther",
                                    1
                                ]
                            },
                            juara2_profile:
                            {
                                "$arrayElemAt":
                                [
                                    "$badge_data.badgeProfile",
                                    1
                                ]
                            },
                            juara3: 
                            {
                                "$cond":
                                {
                                    if:
                                    {
                                        "$eq":
                                        [
                                            "$juara3", null
                                        ]
                                    },
                                    then: "$$REMOVE",
                                    else: "$juara3"
                                }
                            },
                            juara3_general:
                            {
                                "$arrayElemAt":
                                [
                                    "$badge_data.badgeOther",
                                    2
                                ]
                            },
                            juara3_profile:
                            {
                                "$arrayElemAt":
                                [
                                    "$badge_data.badgeProfile",
                                    2
                                ]
                            },
                          },
                        ]
                      }
                    },
              }
            ],
            peserta:
            [
                {
                    tipeAkunTerverikasi: 
                    {
                        "$arrayElemAt":
                        [
                            "$peserta.tipeAkunTerverikasi", 0
                        ]
                    },
                    statusTipeAkunTerverifikasi:
                    {
                        "$switch":
                        {
                            branches: [
                                {
                                    case:
                                    {
                                        "$eq":
                                        [
                                            {
                                                "$arrayElemAt":
                                                [
                                                    "$peserta.tipeAkunTerverikasi", 0
                                                ]
                                            },
                                            "YES"
                                        ]
                                    },
                                    then: "KYC"
                                },
                                {
                                    case:
                                    {
                                        "$eq":
                                        [
                                            {
                                                "$arrayElemAt":
                                                [
                                                    "$peserta.tipeAkunTerverikasi", 0
                                                ]
                                            },
                                            "NO"
                                        ]
                                    },
                                    then: "Non E-KYC"
                                },
                            ],
                            default: "KYC & Non E-KYC"
                        }
                    },
                    caraGabung: 
                    {
                        "$arrayElemAt":
                        [
                            "$peserta.caraGabung", 0
                        ]
                    },
                    "jenisKelamin": 
                    {
                        "$arrayElemAt":
                        [
                            "$peserta.jenisKelamin", 0
                        ]
                    },
                    // "lokasiPengguna": 
                    // {
                    //     "$arrayElemAt":
                    //     [
                    //         "$peserta.lokasiPengguna", 0
                    //     ]
                    // },
                    "lokasiPengguna": 
                    {
                        "$arrayElemAt":
                        [
                            "$areas_data.data", 0
                        ]
                    },
                    "rentangUmur": 
                    {
                        "$arrayElemAt":
                        [
                            "$peserta.rentangUmur", 0
                        ]
                    },
                }
            ],
            hadiahPemenang:1,
            bannerSearch:1,
            popUp:1,
            // notifikasiPush:1,
            notifikasiPush:[
                {
                    "akanDatang":[
                        {
                            "include":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.akanDatang.include",0
                                ]
                            },
                            "title":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.akanDatang.title",0
                                ]
                            },
                            "description":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.akanDatang.description",0
                                ]
                            },
                            "unit":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.akanDatang.unit",0
                                ]
                            },
                            "aturWaktu":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.akanDatang.aturWaktu",0
                                ]
                            },
                            "statusNotifikasi":
                            {
                                "$cond":
                                {
                                    if:
                                    {
                                        "$eq":
                                        [
                                            {
                                                "$arrayElemAt":
                                                [
                                                    "$notifikasiPush.akanDatang.include",
                                                    0
                                                ]
                                            },
                                            "NO"
                                        ]
                                    },
                                    then:"DISABLE",
                                    else:
                                    {
                                        "$cond":
                                        {
                                            if:
                                            {
                                                "$lt":
                                                [
                                                    "$timenow",
                                                    {
                                                        "$dateToString": {
                                                            "format": "%Y-%m-%d %H:%M:%S",
                                                            "date": {
                                                                "$add":
                                                                [
                                                                    {
                                                                        $dateFromString: 
                                                                        {
                                                                            dateString: '$startChallenge'
                                                                        },
                                                                    },
                                                                    {
                                                                        "$multiply":
                                                                        [
                                                                            {
                                                                                "$toInt":
                                                                                {
                                                                                    "$arrayElemAt":
                                                                                    [
                                                                                        "$notifikasiPush.akanDatang.aturWaktu",
                                                                                        0
                                                                                    ]
                                                                                }
                                                                            },
                                                                            3600000
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            then:"AKAN DATANG",
                                            else:"SELESAI"
                                        }
                                    }
                                }
                            }
                        }
                    ],
                    "challengeDimulai":[
                        {
                            "include":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.challengeDimulai.include",0
                                ]
                            },
                            "title":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.challengeDimulai.title",0
                                ]
                            },
                            "description":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.challengeDimulai.description",0
                                ]
                            },
                            "unit":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.challengeDimulai.unit",0
                                ]
                            },
                            "statusNotifikasi":
                            {
                                "$cond":
                                {
                                    if:
                                    {
                                        "$eq":
                                        [
                                            {
                                                "$arrayElemAt":
                                                [
                                                    "$notifikasiPush.challengeDimulai.include",
                                                    0
                                                ]
                                            },
                                            "NO"
                                        ]
                                    },
                                    then:"DISABLE",
                                    else:
                                    {
                                        "$cond":
                                        {
                                            if:
                                            {
                                                "$lt":
                                                [
                                                    "$timenow",
                                                    "$startChallenge"
                                                ]
                                            },
                                            then:"AKAN DATANG",
                                            else:"SELESAI"
                                        }
                                    }
                                }
                            }
                        }
                    ],
                    "updateLeaderboard":[
                        {
                            "include":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.updateLeaderboard.include",0
                                ]
                            },
                            "title":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.updateLeaderboard.title",0
                                ]
                            },
                            "description":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.updateLeaderboard.description",0
                                ]
                            },
                            "unit":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.updateLeaderboard.unit",0
                                ]
                            },
                            "aturWaktu":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.updateLeaderboard.aturWaktu",0
                                ]
                            },
                            "statusNotifikasi":
                            {
                                "$cond":
                                {
                                    if:
                                    {
                                        "$eq":
                                        [
                                            {
                                                "$arrayElemAt":
                                                [
                                                    "$notifikasiPush.updateLeaderboard.include",
                                                    0
                                                ]
                                            },
                                            "NO"
                                        ]
                                    },
                                    then:"DISABLE",
                                    else:
                                    {
                                        "$switch":
                                        {
                                            branches:
                                            [
                                                {
                                                    case:
                                                    {
                                                        "$lt":
                                                        [
                                                            "$timenow",
                                                            {
                                                                "$dateToString": {
                                                                    "format": "%Y-%m-%d %H:%M:%S",
                                                                    "date": {
                                                                        "$add":
                                                                        [
                                                                            {
                                                                                $dateFromString: 
                                                                                {
                                                                                    dateString: '$startChallenge'
                                                                                },
                                                                            },
                                                                            {
                                                                                "$multiply":
                                                                                [
                                                                                    {
                                                                                        "$toInt":
                                                                                        {
                                                                                            "$first":
                                                                                            {
                                                                                                "$let":
                                                                                                {
                                                                                                    vars:
                                                                                                    {
                                                                                                        datawaktu:
                                                                                                        {
                                                                                                            "$let":
                                                                                                            {
                                                                                                                vars:
                                                                                                                {
                                                                                                                    getdata:
                                                                                                                    {
                                                                                                                        "$arrayElemAt":
                                                                                                                        [
                                                                                                                            "$notifikasiPush.updateLeaderboard.aturWaktu", 0
                                                                                                                        ]
                                                                                                                    }
                                                                                                                },
                                                                                                                in:"$$getdata"
                                                                                                            }
                                                                                                        },
                                                                                                    },
                                                                                                    in:"$$datawaktu"
                                                                                                }
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                    3600000
                                                                                ]
                                                                            }
                                                                        ]
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    then:"AKAN DATANG"
                                                },
                                                {
                                                    case:
                                                    {
                                                        "$lt":
                                                        [
                                                            {
                                                                "$dateToString": {
                                                                    "format": "%Y-%m-%d %H:%M:%S",
                                                                    "date": {
                                                                        "$add":
                                                                        [
                                                                            {
                                                                                $dateFromString: 
                                                                                {
                                                                                    dateString: '$endChallenge'
                                                                                },
                                                                            },
                                                                            {
                                                                                "$multiply":
                                                                                [
                                                                                    {
                                                                                        "$toInt":
                                                                                        {
                                                                                            "$last":
                                                                                            {
                                                                                                "$let":
                                                                                                {
                                                                                                    vars:
                                                                                                    {
                                                                                                        datawaktu:
                                                                                                        {
                                                                                                            "$let":
                                                                                                            {
                                                                                                                vars:
                                                                                                                {
                                                                                                                    getdata:
                                                                                                                    {
                                                                                                                        "$arrayElemAt":
                                                                                                                        [
                                                                                                                            "$notifikasiPush.updateLeaderboard.aturWaktu", 0
                                                                                                                        ]
                                                                                                                    }
                                                                                                                },
                                                                                                                in:"$$getdata"
                                                                                                            }
                                                                                                        },
                                                                                                    },
                                                                                                    in:"$$datawaktu"
                                                                                                }
                                                                                            },
                                                                                        }
                                                                                    },
                                                                                    3600000
                                                                                ]
                                                                            }
                                                                        ]
                                                                    }
                                                                }
                                                            },
                                                            "$timenow"
                                                        ]
                                                    },
                                                    then:"SELESAI"
                                                },
                                            ],
                                            default:"SEDANG BERJALAN"
                                        },
                                    }
                                }
                            }
                        }
                    ],
                    "challengeAkanBerakhir":[
                        {
                            "include":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.challengeAkanBerakhir.include",0
                                ]
                            },
                            "title":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.challengeAkanBerakhir.title",0
                                ]
                            },
                            "description":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.challengeAkanBerakhir.description",0
                                ]
                            },
                            "unit":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.challengeAkanBerakhir.unit",0
                                ]
                            },
                            "aturWaktu":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.challengeAkanBerakhir.aturWaktu",0
                                ]
                            },
                            "statusNotifikasi":
                            {
                                "$cond":
                                {
                                    if:
                                    {
                                        "$eq":
                                        [
                                            {
                                                "$arrayElemAt":
                                                [
                                                    "$notifikasiPush.challengeAkanBerakhir.include",
                                                    0
                                                ]
                                            },
                                            "NO"
                                        ]
                                    },
                                    then:"DISABLE",
                                    else:
                                    {
                                        "$cond":
                                        {
                                            if:
                                            {
                                                "$lt":
                                                [
                                                    "$timenow",
                                                    {
                                                        "$dateToString": {
                                                            "format": "%Y-%m-%d %H:%M:%S",
                                                            "date": {
                                                                "$add":
                                                                [
                                                                    {
                                                                        $dateFromString: 
                                                                        {
                                                                            dateString: '$endChallenge'
                                                                        },
                                                                    },
                                                                    {
                                                                        "$multiply":
                                                                        [
                                                                            {
                                                                                "$toInt":
                                                                                {
                                                                                    "$arrayElemAt":
                                                                                    [
                                                                                        "$notifikasiPush.challengeAkanBerakhir.aturWaktu",
                                                                                        0
                                                                                    ]
                                                                                }
                                                                            },
                                                                            3600000
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            then:"AKAN DATANG",
                                            else:"SELESAI"
                                        }
                                    }
                                }
                            }
                        }
                    ],
                    "challengeBerakhir":[
                        {
                            "include":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.challengeBerakhir.include",0
                                ]
                            },
                            "title":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.challengeBerakhir.title",0
                                ]
                            },
                            "description":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.challengeBerakhir.description",0
                                ]
                            },
                            "unit":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.challengeBerakhir.unit",0
                                ]
                            },
                            "aturWaktu":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.challengeBerakhir.aturWaktu",0
                                ]
                            },
                            "statusNotifikasi":
                            {
                                "$cond":
                                {
                                    if:
                                    {
                                        "$eq":
                                        [
                                            {
                                                "$arrayElemAt":
                                                [
                                                    "$notifikasiPush.challengeBerakhir.include",
                                                    0
                                                ]
                                            },
                                            "NO"
                                        ]
                                    },
                                    then:"DISABLE",
                                    else:
                                    {
                                        "$cond":
                                        {
                                            if:
                                            {
                                                "$lt":
                                                [
                                                    "$timenow",
                                                    {
                                                        "$dateToString": {
                                                            "format": "%Y-%m-%d %H:%M:%S",
                                                            "date": {
                                                                "$add":
                                                                [
                                                                    {
                                                                        $dateFromString: 
                                                                        {
                                                                            dateString: '$endChallenge'
                                                                        },
                                                                    },
                                                                    {
                                                                        "$multiply":
                                                                        [
                                                                            {
                                                                                "$toInt":
                                                                                {
                                                                                    "$arrayElemAt":
                                                                                    [
                                                                                        "$notifikasiPush.challengeBerakhir.aturWaktu",
                                                                                        0
                                                                                    ]
                                                                                }
                                                                            },
                                                                            3600000
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            then:"AKAN DATANG",
                                            else:"SELESAI"
                                        }
                                    }
                                }
                            }
                        }
                    ],
                    "untukPemenang":[
                        {
                            "include":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.untukPemenang.include",0
                                ]
                            },
                            "title":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.untukPemenang.title",0
                                ]
                            },
                            "description":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.untukPemenang.description",0
                                ]
                            },
                            "unit":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.untukPemenang.unit",0
                                ]
                            },
                            "aturWaktu":
                            {
                                "$arrayElemAt":
                                [
                                    "$notifikasiPush.untukPemenang.aturWaktu",0
                                ]
                            },
                            "statusNotifikasi":
                            {
                                "$cond":
                                {
                                    if:
                                    {
                                        "$eq":
                                        [
                                            {
                                                "$arrayElemAt":
                                                [
                                                    "$notifikasiPush.untukPemenang.include",
                                                    0
                                                ]
                                            },
                                            "NO"
                                        ]
                                    },
                                    then:"DISABLE",
                                    else:
                                    {
                                        "$cond":
                                        {
                                            if:
                                            {
                                                "$lt":
                                                [
                                                    "$timenow",
                                                    {
                                                        "$dateToString": {
                                                            "format": "%Y-%m-%d %H:%M:%S",
                                                            "date": {
                                                                "$add":
                                                                [
                                                                    {
                                                                        $dateFromString: 
                                                                        {
                                                                            dateString: '$endChallenge'
                                                                        },
                                                                    },
                                                                    {
                                                                        "$multiply":
                                                                        [
                                                                            {
                                                                                "$toInt":
                                                                                {
                                                                                    "$arrayElemAt":
                                                                                    [
                                                                                        "$notifikasiPush.untukPemenang.aturWaktu",
                                                                                        0
                                                                                    ]
                                                                                },
                                                                            },
                                                                            3600000
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            then:"AKAN DATANG",
                                            else:"SELESAI"
                                        }
                                    }
                                }
                            }
                        }
                    ],
                },
            ],
            totalsession:
            {
                "$last": "$session.session"
            },
            session: 1
        }
      }
    ]);

    return query[0];
  }

  async findlistingBanner(targetbanner: string, page: number): Promise<Challenge[]> {
    var pipeline = [];
    pipeline.push({
      "$set": {
        "timenow": {
          "$dateToString": {
            "format": "%Y-%m-%d %H:%M:%S",
            "date": {
              "$add": [
                new Date(),
                25200000
              ]
            }
          }
        }
      }
    },
      {
        "$match":
        {
          "$and":
            [
              {
                "$expr":
                {
                  "$lte":
                    [
                      {
                        "$concat":
                        [
                          "$startChallenge",
                          " ",
                          "$startTime"
                        ]
                      },
                      "$timenow"
                    ]
                }
              },
              {
                "$expr":
                {
                  "$gte":
                    [
                      {
                        "$concat":
                        [
                          "$endChallenge",
                          " ",
                          "$endTime"
                        ]
                      },
                      "$timenow"
                    ]
                }
              },
              {
                "$expr":
                {
                  "$eq":
                    [
                      "$statusChallenge",
                      "PUBLISH"
                    ]
                }
              }
            ]
        }
      });

    var projectdata = {
      _id: 1,
      nameChallenge: 1,
      createdAt: 1,
      startChallenge: 1,
      endChallenge: 1,
      statusChallenge: 1,
    };

    if (targetbanner == 'search') {
      projectdata['bannerLandingpage'] = {
        "$arrayElemAt":
          [
            "$bannerSearch.image",
            0
          ]
      }
    }
    else if (targetbanner == 'popup') {
      projectdata['bannerLandingpage'] = {
        "$arrayElemAt":
          [
            "$popUp.image",
            0
          ]
      }
    }

    pipeline.push(
      {
        "$project": projectdata
      },
      {
        "$sort":
        {
          createdAt:-1
        }
      },
      {
        "$limit":5
      }
    );

    if(page > 0)
    {
      pipeline.push(
        {
          "$skip":page * 5
        }
      );
    }

    // console.log(JSON.stringify(pipeline));

    var query = await this.ChallengeModel.aggregate(pipeline);
    return query;
  }

  async find(): Promise<Challenge[]> {
    return this.ChallengeModel.find().exec();
  }

  async update(id: string, Challenge_: Challenge): Promise<Challenge> {
    let data = await this.ChallengeModel.findByIdAndUpdate(id, Challenge_, { new: true });
    if (!data) {
      throw new Error('Data is not found!');
    }
    return data;
  }

  async delete(id: string) {
    const data = await this.ChallengeModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
    return data;
  }
  async challengeReferal() {
    var query = await this.ChallengeModel.aggregate([

      { $match: { "statusChallenge": "PUBLISH" } },
      {
        $project: {
          "statusChallenge": 1,
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": {
            $arrayElemAt: ['$metrik.Aktivitas', 0]
          },
          "Interaksi": {
            $arrayElemAt: ['$metrik.Interaksi', 0]
          },
          "AktivitasAkun": {
            $arrayElemAt: ['$metrik.AktivitasAkun', 0]
          },

        }
      },
      {
        $project: {
          "statusChallenge": 1,
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": 1,
          "Interaksi": 1,
          "poinReferal": {
            $arrayElemAt: ['$AktivitasAkun.Referal', 0]
          },
          "poinFollow": {
            $arrayElemAt: ['$AktivitasAkun.Ikuti', 0]
          },

        }
      },
      {
        $match: { "poinReferal": { $ne: null } }
      }
    ]);
    return query;
  }

  async challengeFollow() {
    var query = await this.ChallengeModel.aggregate([

      { $match: { "statusChallenge": "PUBLISH" } },
      {
        $project: {
          "statusChallenge": 1,
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": {
            $arrayElemAt: ['$metrik.Aktivitas', 0]
          },
          "Interaksi": {
            $arrayElemAt: ['$metrik.Interaksi', 0]
          },
          "AktivitasAkun": {
            $arrayElemAt: ['$metrik.AktivitasAkun', 0]
          },

        }
      },
      {
        $project: {
          "statusChallenge": 1,
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": 1,
          "Interaksi": 1,
          "poinReferal": {
            $arrayElemAt: ['$AktivitasAkun.Referal', 0]
          },
          "poinFollow": {
            $arrayElemAt: ['$AktivitasAkun.Ikuti', 0]
          },

        }
      },
      {
        $match: { "poinFollow": { $ne: null } }
      }
    ]);
    return query;
  }

  async challengeKonten() {
    var pipeline = [];

    pipeline.push({
      $match: {
        "statusChallenge": "PUBLISH"
      }
    },
      {
        $project: {
          "statusChallenge": 1,
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": {
            $arrayElemAt: ['$metrik.Aktivitas', 0]
          },
          "Interaksi": {
            $arrayElemAt: ['$metrik.Interaksi', 0]
          },
          "InteraksiKonten": {
            $arrayElemAt: ['$metrik.InteraksiKonten', 0]
          },

        }
      },
      {
        $project: {
          "statusChallenge": 1,
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": 1,
          "Interaksi": 1,
          "InteraksiKonten": 1,

        }
      },
      {
        $match: {
          "InteraksiKonten": {
            $ne: []
          },
          "Interaksi": true
        }
      },
      {
        $unwind: "$InteraksiKonten"
      },
      {
        $project: {
          "statusChallenge": 1,
          "nameChallenge": 1,
          "jenisChallenge": 1,
          "description": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "durasi": 1,
          "endChallenge": 1,
          "startChallenge": 1,
          "tampilStatusPengguna": 1,
          "objectChallenge": 1,
          "Aktivitas": 1,
          "Interaksi": 1,
          "tagar": {
            $ifNull: ['$InteraksiKonten.tagar', []]
          },
          "buatKonten":
          {
            $ifNull: ['$InteraksiKonten.buatKonten', []]
          },
          "suka": {
            $ifNull: ['$InteraksiKonten.suka', []]
          },
          "tonton": {
            $ifNull: ['$InteraksiKonten.tonton', []]
          },



        }
      });
    var query = await this.ChallengeModel.aggregate(pipeline);
    return query;
  }

  async checkuserstatusjoin(iduser: string, page: number, limit: number) {
    var mongo = require('mongoose');
    var konvertid = mongo.Types.ObjectId(iduser);
    var pipeline = [];
    pipeline.push({
        "$set": {
            timeEnd: {
                "$concat": [
                    {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": {
                                $toDate: "$endChallenge"
                            }
                        }
                    },
                    " ",
                    "$endTime"
                ]
            }
          }
      },
          {
          "$set": {
              timeStart: {
                  "$concat": [
                      {
                          "$dateToString": {
                              "format": "%Y-%m-%d",
                              "date": {
                                  $toDate: "$startChallenge"
                              }
                          }
                      },
                      " ",
                      "$startTime"
                  ]
              }
          }
      },
      {
          $set: {
              nowDate: 
              {
                  "$dateToString": {
                      "format": "%Y-%m-%d %H:%M:%S",
                      "date": {
                          $add: [new Date(), 25200000]
                      }
                  }
              }
          }
      },
      {
          $match: {
              $and: [
                  {
                      $expr: 
                      {
                          $gte: ["$timeEnd", "$nowDate"]
                      },
                      
                  },
                  {
                      "statusChallenge": "PUBLISH"
                  }
              ]
          }
      },
      {
          "$lookup": 
          {
              from: "userChallenge",
              let: 
              {
                  userchallenge_fk: "$_id"
              },
              as: 'userChallenges',
              pipeline: 
              [
                  {
                      "$match": 
                      {
                          "$and": 
                          [
                              {
                                  "$expr": 
                                  {
                                      "$eq": 
                                      [
                                          "$$userchallenge_fk",
                                          "$idChallenge"
                                      ]
                                  }
                              },
                              {
                                  isActive: true
                              },
                              {
                                  idUser: konvertid,
                                  
                              }
                          ]
                      }
                  },
                  
              ]
          },
          
      },
      {
          $project: {
              "_id": 1,
              "nameChallenge": 1,
              "jenisChallenge": 1,
              "description": 1,
              "createdAt": 1,
              "updatedAt": 1,
              "durasi": 1,
              "startChallenge": 1,
              "endChallenge": 1,
              "startTime": 1,
              "endTime": 1,
              "jenisDurasi": 1,
              "tampilStatusPengguna": 1,
              "objectChallenge": 1,
              "statusChallenge": 1,
              searchBanner: {
                  $arrayElemAt: ["$bannerSearch.image", 0]
              },
              bannerLeaderboard: {
                  $arrayElemAt: ["$leaderBoard.bannerLeaderboard", 0]
              },
              statusJoined: 
              {
                  $cond: {
                      if: {
                          $gt: [{
                              $size: '$userChallenges'
                          }, 0]
                      },
                      then: "Partisipan",
                      else: "Bukan Partisipan"
                  }
              },
              statusFormalChallenge: 
              {
                  $cond: {
                      if: {
                          $and: [
                              {
                                  $gte: ["$timeEnd", "$nowDate"]
                              },		
                              {
                                  $lte: ["$timeStart", "$nowDate"]
                              },																													
                          ]
                      },
                      then: "Berlangsung",
                      else: "Akan Datang"
                  }
              },
          }
      },
      {
            $sort: {
                statusChallenge: -1,
                timeStart: 1,
            }
      }
    );

    if(page > 0)
    {
      pipeline.push(
        {
          "$skip":page * limit
        }
      );
    }

    if(limit > 0)
    {
      pipeline.push(
        {
          "$limit":limit
        }
      );
    }

    var data = await this.ChallengeModel.aggregate(pipeline);

    return data;
  }
}
