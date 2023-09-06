import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Mediastiker, MediastikerDocument } from './schemas/mediastiker.schema';
import { first, pipe } from 'rxjs';

@Injectable()
export class MediastikerService {

    constructor(
        @InjectModel(Mediastiker.name, 'SERVER_FULL')
        private readonly MediastikerModel: Model<MediastikerDocument>,
    ) { }

    async create(Mediastiker_: Mediastiker): Promise<Mediastiker> {
        const _Mediastiker_ = await this.MediastikerModel.create(Mediastiker_);
        return _Mediastiker_;
    }

    async findOne(id: string): Promise<Mediastiker> {
        return this.MediastikerModel.findOne({ _id: new Types.ObjectId(id) }).exec();
    }
    async findByname(name: string): Promise<Mediastiker> {
        return this.MediastikerModel.findOne({ name: name }).exec();
    }
    async findByIndex(index: number, type: string): Promise<Mediastiker> {
        return this.MediastikerModel.findOne({ index: index, type: type }).exec();
    }
    async findByKategori(target: string): Promise<Mediastiker[]> {
        return this.MediastikerModel.aggregate([
            {
                "$match":
                {
                    "$and":
                        [
                            {
                                kategori: target
                            },
                            {
                                isDelete: false
                            }
                        ]
                }
            },
            {
                "$sort":
                {
                    index: 1
                }
            }
        ]);
    }
    async findOne2(id: string) {
        var mongo = require('mongoose');
        var konvertid = mongo.Types.ObjectId(id);

        var pipeline = [];
        pipeline.push({
            "$match":
            {
                _id: konvertid
            }
        },
        );

        var query = await this.MediastikerModel.aggregate(pipeline);

        return query[0];
    }

    async find(): Promise<Mediastiker[]> {
        return this.MediastikerModel.find().exec();
    }

    async update(id: string, Mediastiker_: Mediastiker): Promise<Mediastiker> {
        let data = await this.MediastikerModel.findByIdAndUpdate(id, Mediastiker_, { new: true });
        if (!data) {
            throw new Error('Data is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const data = await this.MediastikerModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
        return data;
    }
    async updateNonactive(id: string): Promise<Object> {
        let data = await this.MediastikerModel.updateOne({ "_id": id },
            {
                $set: {
                    "isDelete": true
                }
            });
        return data;
    }


    async updatedatabasedonkategori(targetcat: string, changecat: string, tipe:string) {
        let data = await this.MediastikerModel.updateMany({ kategori: targetcat, type:tipe, isDelete: false },
            {
                $set: {
                    "kategori": changecat
                }
            });
        return data;
    }
    async findByNourut(nourut: number, type: string) {
        var query = this.MediastikerModel.aggregate([
            {
                "$match":
                {
                    'index': { $gte: nourut }, 'type': type
                }
            },
            {
                $sort: { 'index': 1 }
            }
        ]);
        return query;
    }
    async findByNourutLebihkecil(nourutStart: number, nourutEnd: number, type: string) {
        var query = this.MediastikerModel.aggregate([
            {
                "$match":
                {
                    'index': { $gte: nourutStart, $lte: nourutEnd }, 'type': type
                }
            },
            {
                $sort: { 'index': -1 }
            }

        ]);
        return query;
    }
    async findByNourutLebihbesar(nourutStart: number, nourutEnd: number, type: string) {
        var query = this.MediastikerModel.aggregate([
            {
                "$match":
                {
                    'index': { $lte: nourutStart, $gte: nourutEnd }, 'type': type

                }
            },
            {
                $sort: { 'index': 1 }
            }

        ]);
        return query;
    }
    async updateIndex(id: string, index: number, updatedAt: string) {
        let data = await this.MediastikerModel.updateOne({ "_id": new Types.ObjectId(id) },
            { $set: { "index": index, "updatedAt": updatedAt, } });
        return data;
    }

    async trend(){
        var data = await this.MediastikerModel.aggregate([
            {
                "$facet":
                {
                    "stiker":
                    [
                        {
                            "$match":
                            {
                                "$and":
                                [
                                    {
                                        type:"STICKER"
                                    },
                                    {
                                        status:true
                                    },
                                    {
                                        isDelete:false
                                    },
                                    {
                                        used:
                                        {
                                            "$ne":0
                                        }
                                    },
                                ]
                            }
                        },
                        {
                            "$sort":
                            {
                                used:-1
                            }
                        },
                        {
                            "$limit":5
                        }
                    ],
                    "gif":
                    [
                        {
                            "$match":
                            {
                                "$and":
                                [
                                    {
                                        type:"GIF"
                                    },
                                    {
                                        status:true
                                    },
                                    {
                                        isDelete:false
                                    },
                                    {
                                        used:
                                        {
                                            "$ne":0
                                        }
                                    },
                                ]
                            }
                        },
                        {
                            "$sort":
                            {
                                used:-1
                            }
                        },
                        {
                            "$limit":5
                        }
                    ],
                    "emoji":
                    [
                        {
                            "$match":
                            {
                                "$and":
                                [
                                    {
                                        type:"EMOJI"
                                    },
                                    {
                                        status:true
                                    },
                                    {
                                        isDelete:false
                                    },
                                    {
                                        used:
                                        {
                                            "$ne":0
                                        }
                                    },
                                ]
                            }
                        },
                        {
                            "$sort":
                            {
                                used:-1
                            }
                        },
                        {
                            "$limit":5
                        }
                    ],
                }
            }
        ]);

        return data;
    }

    async listing(setname:string, settipesticker:string, startdate:string, enddate:string, startused:number, endused:number, listkategori:any[], liststatus:any[], sorting:string, page:number, limit:number)
    {
        var pipeline = [];
        
        pipeline.push(
            {
                "$match":
                {
                    "$and":
                    [
                        {
                            "type":settipesticker
                        },
                        {
                            "isDelete":false
                        },
                    ]
                }
            }
        )

        var firstmatch = [];
        if(setname != null)
        {
            firstmatch.push({
                name:
                {
                    "$regex":setname,
                    "$options":"i"
                }
            })
        }

        if(startdate != null)
        {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1)); 
            var dateend = currentdate.toISOString();

            firstmatch.push(
                {
                    "createdAt":
                    {
                        "$gte":startdate
                    }
                },
                {
                    "createdAt":
                    {
                        "$lte":dateend
                    }
                },
            );
        }

        if(startused != null)
        {
            firstmatch.push(
                {
                    "used":
                    {
                        "$gte":startused
                    }
                },
                {
                    "used":
                    {
                        "$lte":endused
                    }
                },
            )
        }

        if(listkategori != null && settipesticker != 'GIF')
        {
            firstmatch.push(
                {
                    "kategori":
                    {
                        "$in":listkategori
                    }
                }
            )
        }

        if(liststatus != null)
        {
            firstmatch.push(
                {
                    "status":
                    {
                        "$in":liststatus
                    }
                }
            );
        }

        if(firstmatch.length != 0)
        {
            pipeline.push(
                {
                    "$match":
                    {
                        "$and":firstmatch
                    }
                }
            )
        }

        if(sorting != null)
        {
            if(sorting == "name+")
            {
                pipeline.push({
                    "$sort":
                    {
                        name:1
                    }
                })
            }
            else if(sorting == "name-")
            {
                pipeline.push({
                    "$sort":
                    {
                        name:-1
                    }
                })
            }
            else if(sorting == "createdAt+")
            {
                pipeline.push({
                    "$sort":
                    {
                        createdAt:1
                    }
                })
            }
            else if(sorting == "createdAt-")
            {
                pipeline.push({
                    "$sort":
                    {
                        createdAt:-1
                    }
                })
            }
            else
            {
                pipeline.push({
                    "$sort":
                    {
                        used:-1
                    }
                })
            }
        }

        if(page > 0)
        {
            pipeline.push({
                "$skip":limit * page
            });
        }

        if(limit > 0)
        {
            pipeline.push({   
                "$limit":limit
            });
        }

        // console.log(JSON.stringify(pipeline));

        var data = await this.MediastikerModel.aggregate(pipeline);
        return data;
    }

}
