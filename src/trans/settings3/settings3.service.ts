import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { CreateSettings3Dto } from './dto/create-settings3.dto';
import { SettingsString, SettingsDocument } from './schemas/settings3.schema';

@Injectable()
export class Settings3Service {
    constructor(
        @InjectModel(SettingsString.name, 'SERVER_FULL')
        private readonly settingsModel: Model<SettingsDocument>,
    ) { }

    async findAll(): Promise<SettingsString[]> {
        return this.settingsModel.find().exec();
    }

    async findOne(id: string): Promise<SettingsString> {
        return this.settingsModel.findOne({ _id: id }).exec();
    }

    async findOneByJenis(jenis: string): Promise<SettingsString> {
        return this.settingsModel.findOne({ jenis: jenis }).exec();
    }

    async findOneAndUpdate(jenis_: string, value_: any): Promise<SettingsString> {
        return this.settingsModel.findOneAndUpdate({ jenis: jenis_ }, { value: value_ }, {
            new: true
        }).exec();
    }

    async findOneAndUpdate_(_id_setting: string, value_: any): Promise<SettingsString> {
        return this.settingsModel.findOneAndUpdate({ _id: _id_setting }, { value: value_ }, {
            new: true
        }).exec();
    }
    async findOneByJenisremark(jenis: string, remark: string): Promise<SettingsString> {
        return this.settingsModel.findOne({ jenis: jenis, remark: remark }).exec();
    }

    async create(CreateSettingsDto: CreateSettings3Dto): Promise<SettingsString> {
        const createSettingsDto = await this.settingsModel.create(CreateSettingsDto);
        return createSettingsDto;
    }
    
    async update(
        id: string,
        CreateSettingsDto: CreateSettings3Dto,
    ): Promise<SettingsString> {
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
}
