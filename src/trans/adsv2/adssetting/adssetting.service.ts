import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { SettingsMixed, SettingsDocument } from '../../../trans/settings2/schemas/settings2.schema';

@Injectable()
export class AdssettingService {
    constructor(
        @InjectModel(SettingsMixed.name, 'SERVER_FULL')
        private readonly adssettingsModel: Model<SettingsDocument>,
    ) { }

    async getAdsSetting(id: mongoose.Types.ObjectId): Promise<SettingsMixed> {
        return this.adssettingsModel.findOne({ _id: id }).exec();
    }

    async updateAdsSetting(
        id: string,
        value: any,
    ): Promise<SettingsMixed> {
        let data = await this.adssettingsModel.findByIdAndUpdate(
            id,
            { value: value },
            { new: true },
        );
        return data;
    }
}
