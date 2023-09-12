import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
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

    // async updatedata(list: any[], target: string, operathmath: string) {
    //     if (list !== undefined) {
    //         for (let i = 0; i < list.length; i++) {
    //             setTimeout(() => {
    //                 console.log('looping ke ' + i);
    //                 this.intothedatabase2(i, target, operathmath, list);
    //             }, (i * 1000));
    //         }
    //     }
    // }
    async updatedata(list: any[]) {
        if (list !== undefined) {
            for (let i = 0; i < list.length; i++) {
                let id = list[i]._id;
                var mongo = require('mongoose');
                var konvertid = mongo.Types.ObjectId(id);
                var data = await this.CountstikerModel.findOne({ _id: new Types.ObjectId(id.toString()) });
                if (data == null) {
                    var setdata = new Countstiker();
                    var getdata = await this.MediastikerSS.findOne(id);
                    setdata._id = mongo.Types.ObjectId();
                    setdata.stikerId = konvertid;
                    setdata.name = getdata.name;
                    setdata.image = getdata.image;
                    setdata.countsearch = 0;
                    setdata.countused = 1;
                    setdata.createdAt = getdata.createdAt;
                    await this.CountstikerModel.create(setdata);
                } else {
                    setTimeout(() => {
                        console.log('looping ke ' + i);
                        this.updateUsed(id);
                    }, (i * 1000));
                }
            }
        }
    }

    async updateUsed(_id: string) {
        this.CountstikerModel.updateOne(
            {
                _id: new mongoose.Types.ObjectId(_id),
            },
            { $inc: { countused: 1 } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }
    async intothedatabase2(loop: number, target: string, operathmath: string, list: any[]) {
        var operationresult = null;
        var mongo = require('mongoose');
        var konvertid = mongo.Types.ObjectId(list[loop]._id);
        var data = await this.CountstikerModel.findOne({ stikerId: konvertid });

        var setdata = new Countstiker();

        if (data == null) {
            var getdata = await this.MediastikerSS.findOne(list[loop]._id);
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
                setdata.countsearch = (operathmath == "penjumlahan" ? data.countsearch + 1 : data.countsearch - 1);
                if (setdata.countsearch < 0) {
                    setdata.countsearch = 0;
                }
            }
            else {
                setdata.countused = (operathmath == "penjumlahan" ? data.countused + 1 : data.countused - 1);
                if (setdata.countused < 0) {
                    setdata.countused = 0;
                }
            }
        }

        try {
            if (setdata._id == null) {
                //stuck disini
                operationresult = await this.CountstikerModel.updateOne(
                    {
                        _id: konvertid
                    },
                    data,
                    function (err, docs) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(docs);
                        }
                    },
                );
            }
            else {
                operationresult = await this.CountstikerModel.create(data);
            }
        }
        catch (e) {
            console.log(e);
        }

        console.log(operationresult);
        console.log(konvertid);
    }

    async searchstikerlog(loop: number, target: string, operathmath: string, list: any[]) {
        var operationresult = null;
        var mongo = require('mongoose');
        var konvertid = mongo.Types.ObjectId(list[loop]._id);
        var data = await this.CountstikerModel.findOne({ stikerId: konvertid });

        var setdata = new Countstiker();

        if (data == null) {
            var getdata = await this.MediastikerSS.findOne(list[loop]._id);
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
                setdata.countsearch = (operathmath == "penjumlahan" ? data.countsearch + 1 : data.countsearch - 1);
                if (setdata.countsearch < 0) {
                    setdata.countsearch = 0;
                }
            }
            else {
                setdata.countused = (operathmath == "penjumlahan" ? data.countused + 1 : data.countused - 1);
                if (setdata.countused < 0) {
                    setdata.countused = 0;
                }
            }
        }

        try {
            if (setdata._id == null) {
                //stuck disini
                operationresult = await this.CountstikerModel.updateOne(
                    {
                        _id: konvertid
                    },
                    data,
                    function (err, docs) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(docs);
                        }
                    },
                );
            }
            else {
                operationresult = await this.CountstikerModel.create(data);
            }
        }
        catch (e) {
            console.log(e);
        }

        console.log(operationresult);
        console.log(konvertid);
    }
}