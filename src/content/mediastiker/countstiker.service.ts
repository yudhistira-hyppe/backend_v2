import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { MediastikerService } from './mediastiker.service';
import { Countstiker, CountstikerDocument } from './schemas/countstiker.schema';
import { delay, first, pipe } from 'rxjs';

@Injectable()
export class CountstikerService {

    constructor(
        @InjectModel(Countstiker.name, 'SERVER_FULL')
        private readonly CountstikerModel: Model<CountstikerDocument>,
        private readonly MediastikerSS: MediastikerService
    ) { }

    async updatedata(list: any[], target: string) {
        if (list.length > 0) {
            for (let i = 0; i < list.length; i++) {
                setTimeout(function () {
                    console.log('This printed after about 1 second');
                }, 1000);

                var mongo = require('mongoose');
                var konvertid = mongo.Types.ObjectId(list[i]._id);
                var data = await this.CountstikerModel.findOne({ stikerId: konvertid });

                var setdata = new Countstiker();

                if (data == null) {
                    var getdata = await this.MediastikerSS.findOne(list[i]._id);
                    setdata._id = mongo.Types.ObjectId();
                    setdata.stikerId = konvertid;
                    setdata.name = getdata.name;
                    setdata.image = getdata.image;
                    setdata.countsearch = (target == "search" ? 1 : 0);
                    setdata.countused = (target == "used" ? 1 : 0);
                    setdata.createdAt = getdata.createdAt;
                }
                else {
                    if (target == "search") {
                        setdata.countsearch = data.countsearch + 1;
                    }
                    else {
                        setdata.countused = data.countused + 1;
                    }
                }

                if (setdata._id == null) {
                    await this.CountstikerModel.updateOne(
                        {
                            _id: data._id
                        },
                        setdata,
                        function (err, docs) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(docs);
                            }
                        },
                    )
                }
                else {
                    await this.CountstikerModel.create(setdata);
                }
            }
        }
    }

    async delay(time: number) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
}