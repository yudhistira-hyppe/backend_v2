import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { Settings, SettingsDocument } from './schemas/settings.schema';

@Injectable()
export class SettingsService {
    constructor(
        @InjectModel(Settings.name, 'SERVER_TRANS')
        private readonly settingsModel: Model<SettingsDocument>,
    ) { }

    async findAll(): Promise<Settings[]> {
        return this.settingsModel.find().exec();
    }

    async findOne(id: string): Promise<Settings> {
        return this.settingsModel.findOne({ _id: id }).exec();
    }

    async findOneByJenis(jenis: string): Promise<Settings> {
        return this.settingsModel.findOne({ jenis: jenis }).exec();
    }
}
