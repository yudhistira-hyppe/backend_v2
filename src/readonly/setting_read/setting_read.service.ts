import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SettingsRead, SettingsReadDocument } from './schema/setting_read.schema';

@Injectable()
export class SettingsReadService {
    constructor(
        @InjectModel(SettingsRead.name, 'SERVER_FULL_READ')
        private readonly SettingsReadModel: Model<SettingsReadDocument>,
    ) { }

    async findOneByJenis(jenis: string): Promise<SettingsRead> {
        return this.SettingsReadModel.findOne({ jenis: jenis }).exec();
    }

    async findOne(id: string): Promise<SettingsRead> {
        return this.SettingsReadModel.findOne({ _id: id }).exec();
    }
}
