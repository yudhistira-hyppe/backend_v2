import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { CreateSettings2Dto } from './dto/create-settings2.dto';
import { SettingsMixed, SettingsDocument } from './schemas/settings2.schema';

@Injectable()
export class Settings2Service {
    constructor(
        @InjectModel(SettingsMixed.name, 'SERVER_FULL')
        private readonly settingsModel: Model<SettingsDocument>,
    ) { }

    async findAll(): Promise<SettingsMixed[]> {
        return this.settingsModel.find().exec();
    }

    async findOne(id: string): Promise<SettingsMixed> {
        return this.settingsModel.findOne({ _id: id }).exec();
    }

    async findOneByJenis(jenis: string): Promise<SettingsMixed> {
        return this.settingsModel.findOne({ jenis: jenis }).exec();
    }

    async findOneAndUpdate(jenis_: string, value_: any): Promise<SettingsMixed> {
        return this.settingsModel.findOneAndUpdate({ jenis: jenis_ }, { value: value_ }, {
            new: true
        }).exec();
    }

    async findOneAndUpdate_(_id_setting: string, value_: any): Promise<SettingsMixed> {
        return this.settingsModel.findOneAndUpdate({ _id: _id_setting }, { value: value_ }, {
            new: true
        }).exec();
    }
    async findOneByJenisremark(jenis: string, remark: string): Promise<SettingsMixed> {
        return this.settingsModel.findOne({ jenis: jenis, remark: remark }).exec();
    }

    async create(CreateSettingsDto: CreateSettings2Dto): Promise<SettingsMixed> {
        const createSettingsDto = await this.settingsModel.create(CreateSettingsDto);
        return createSettingsDto;
    }
    
    async update(
        id: string,
        CreateSettingsDto: CreateSettings2Dto,
    ): Promise<SettingsMixed> {
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
