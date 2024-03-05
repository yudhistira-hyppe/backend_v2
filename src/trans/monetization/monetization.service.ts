import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Monetize, MonetizeDocument } from './schemas/monetization.schema';
import { ConfigService } from '@nestjs/config';
import { OssContentPictService } from 'src/content/posts/osscontentpict.service';
import { PostContentService } from 'src/content/posts/postcontent.service';
import { UtilsService } from 'src/utils/utils.service';
import mongoose from 'mongoose';
const sharp = require('sharp');

@Injectable()
export class MonetizationService {
    constructor(
        @InjectModel(Monetize.name, 'SERVER_FULL')
        private readonly monetData: Model<MonetizeDocument>,
        private readonly configService: ConfigService,
        private readonly ossContentPictService: OssContentPictService,
        private readonly postContentService: PostContentService,
        private readonly utilsService: UtilsService
    ) { }

    async find(): Promise<Monetize[]> {
        return this.monetData.find().exec();
    }

    async findOne(id: string): Promise<Monetize> {
        return this.monetData.findOne({ _id: id }).exec();
    }

    async createCoin(file: Express.Multer.File, request: any): Promise<Monetize> {
        let id = new mongoose.Types.ObjectId();
        let image_information = await sharp(file.buffer).metadata();
        let extension = image_information.format;
        let now = await this.utilsService.getDateTimeString();

        let filename = id + "." + extension;
        let path_file = "coin/" + id + "/" + filename;

        let file_upload = await this.postContentService.generate_upload_noresize(file, extension);
        let upload_file_upload = await this.uploadOss(file_upload, path_file);

        let url_filename = "";

        if (upload_file_upload != undefined) {
            if (upload_file_upload.res != undefined) {
                if (upload_file_upload.res.statusCode != undefined) {
                    if (upload_file_upload.res.statusCode == 200) {
                        url_filename = upload_file_upload.res.requestUrls[0];
                    }
                }
            }
        }
        let createCoinDto = {
            _id: id,
            name: request.name,
            item_id: request.item_id,
            package_id: request.package_id,
            price: Number(request.price),
            amount: Number(request.amount),
            stock: Number(request.stock),
            thumbnail: url_filename,
            createdAt: now,
            updatedAt: now,
            type: request.type,
            used_stock: 0,
            last_stock: Number(request.stock),
            active: Boolean(request.active),
            status: Boolean(request.status)
        }
        return this.monetData.create(createCoinDto);
    }

    async uploadOss(buffer: Buffer, path: string) {
        var result = await this.ossContentPictService.uploadFileBuffer(buffer, path);
        return result;
    }

    async listAllCoin(skip: number, limit: number, descending: boolean, name?: string, dateFrom?: string, dateTo?: string, stockFrom?: number, stockTo?: number, status?: boolean) {
        let order = descending ? -1 : 1;
        let pipeline = [];
        pipeline.push({
            "$match": {
                "type": "COIN"
            }
        });
        pipeline.push({
            "$sort":
            {
                'updatedAt': order
            }
        });
        if (name && name !== "") {
            pipeline.push({
                "$match": {
                    "name": new RegExp(name, "i")
                }
            })
        }
        if (dateFrom && dateFrom !== undefined) {
            pipeline.push({
                "$match": {
                    "createdAt": {
                        $gte: dateFrom
                    }
                }
            })
        }
        if (dateTo && dateTo !== undefined) {
            pipeline.push({
                "$match": {
                    "createdAt": {
                        $lte: dateTo
                    }
                }
            })
        }
        if (stockFrom && stockFrom !== undefined) {
            pipeline.push({
                "$match": {
                    "stock": {
                        $gte: stockFrom
                    }
                }
            })
        }
        if (stockTo && stockTo !== undefined) {
            pipeline.push({
                "$match": {
                    "stock": {
                        $lte: stockTo
                    }
                }
            })
        }
        if (status !== null || status !== undefined) {
            pipeline.push({
                "$match": {
                    "status": status
                }
            })
        }
        if (skip > 0) {
            pipeline.push({ $skip: skip });
        }
        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }
        return this.monetData.aggregate(pipeline);
    }
}
