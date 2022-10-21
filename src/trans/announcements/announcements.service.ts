import { Injectable } from '@nestjs/common';
import { CreateAnnouncementsDto } from './dto/create-announcement.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { Announcements, AnnouncementsDocument } from './schemas/announcement.schema';
@Injectable()
export class AnnouncementsService {
    constructor(
        @InjectModel(Announcements.name, 'SERVER_FULL')
        private readonly announcementsDocumentModel: Model<AnnouncementsDocument>,

    ) { }
    async create(CreateAnnouncementsDto: CreateAnnouncementsDto): Promise<Announcements> {
        let data = await this.announcementsDocumentModel.create(CreateAnnouncementsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findAll(): Promise<Announcements[]> {
        return this.announcementsDocumentModel.find().exec();
    }

    async viewalldata(): Promise<object> {
        const query = await this.announcementsDocumentModel.aggregate([
            {
                $lookup: {
                    from: "userbasics",
                    localField: "Detail.iduser",
                    foreignField: "_id",
                    as: "field"
                }
            },
            {
                $project: {
                    "title": "$title",
                    "body": "$body",
                    "datetimeCreate": "$datetimeCreate",
                    "datetimeSend": "$datetimeSend",
                    "pushMessage": "$pushMessage",
                    "appMessage": "$appMessage",
                    "appInfo": "$appInfo",
                    "email": "$email",
                    "status": "$status",
                    "tipe": "$tipe",
                    "Detail": "$field",

                }
            },
            { $sort: { datetimeCreate: -1 }, },
        ]);


        return query;
    }

    async viewabystatus(status: string, page: number, limit: number) {
        const query = await this.announcementsDocumentModel.aggregate([
            {
                $lookup: {
                    from: "userbasics",
                    localField: "Detail.iduser",
                    foreignField: "_id",
                    as: "field"
                }
            },
            {
                $project: {
                    "title": "$title",
                    "body": "$body",
                    "datetimeCreate": "$datetimeCreate",
                    "datetimeSend": "$datetimeSend",
                    "pushMessage": "$pushMessage",
                    "appMessage": "$appMessage",
                    "appInfo": "$appInfo",
                    "email": "$email",
                    "status": "$status",
                    "tipe": "$tipe",
                    "Detail": "$field",

                }
            },
            {
                $match: {
                    status: status
                }
            },
            { $sort: { datetimeCreate: -1 }, }, { $skip: page }, { $limit: limit }
        ]);


        return query;
    }
    async findOne(id: string): Promise<Announcements> {
        return this.announcementsDocumentModel.findOne({ _id: id }).exec();
    }

    async update(
        id: string,
        createAnnouncementsDto: CreateAnnouncementsDto,
    ): Promise<Announcements> {
        let data = await this.announcementsDocumentModel.findByIdAndUpdate(
            id,
            createAnnouncementsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async delete(id: string) {
        const deletedCat = await this.announcementsDocumentModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }
}
