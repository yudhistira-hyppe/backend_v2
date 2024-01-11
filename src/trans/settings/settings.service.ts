import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { Settings, SettingsDocument } from './schemas/settings.schema';
import { pipe } from 'rxjs';

@Injectable()
export class SettingsService {
    constructor(
        @InjectModel(Settings.name, 'SERVER_FULL')
        private readonly settingsModel: Model<SettingsDocument>,
    ) { }

    async findAll(): Promise<Settings[]> {
        // return this.settingsModel.find().exec();

        var pipeline = [];
        pipeline.push(
            {
                "$match":
                {
                    isActive:true
                }
            }
        )

        return this.settingsModel.aggregate(pipeline).exec();
    }

    async findOne(id: string): Promise<Settings> {
        return this.settingsModel.findOne({ _id:id }).exec();
    }

    async findOneByJenis(jenis: string): Promise<Settings> {
        return this.settingsModel.findOne({ jenis: jenis }).exec();
    }

    async findOneAndUpdate(jenis_: string, value_: any): Promise<Settings> {
        return this.settingsModel.findOneAndUpdate({ jenis: jenis_ }, { value: value_ }, {
            new: true
        }).exec();
    }

    async findOneAndUpdate_(_id_setting: string, value_: any): Promise<Settings> {
        return this.settingsModel.findOneAndUpdate({ _id: _id_setting }, { value: value_ }, {
            new: true
        }).exec();
    }
    async findOneByJenisremark(jenis: string, remark: string): Promise<Settings> {
        return this.settingsModel.findOne({ jenis: jenis, remark: remark }).exec();
    }


    async create(CreateSettingsDto: CreateSettingsDto): Promise<Settings> {
        const createSettingsDto = await this.settingsModel.create(CreateSettingsDto);
        return createSettingsDto;
    }
    async delete(id: string) {
        const deletedCat = await this.settingsModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }
    async update(
        id: string,
        CreateSettingsDto: CreateSettingsDto,
    ): Promise<Settings> {
        let data = await this.settingsModel.findByIdAndUpdate(
            id,
            CreateSettingsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async list(jenis: string) {
        var pipeline = [];

        if (jenis && jenis !== undefined) {

            pipeline.push({
                $match: {
                    jenis: {
                        $regex: jenis,
                        $options: 'i'
                    },

                }
            }
            );

        }
        pipeline.push(
            { $sort: { _id: 1 } }
        );

        var query = await this.settingsModel.aggregate(pipeline);
        return query;
    }

}
