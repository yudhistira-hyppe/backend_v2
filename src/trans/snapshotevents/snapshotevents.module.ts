import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SnapshoteventsController } from './snapshotevents.controller';
import { SnapshoteventsService } from './snapshotevents.service';
import { ConfigModule } from '@nestjs/config';
import { Snapshotevents, SnapshoteventsSchema } from './schemas/snapshotevents.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Snapshotevents.name, schema: SnapshoteventsSchema }],'SERVER_TRANS')
    ],
    controllers: [SnapshoteventsController],
    providers: [SnapshoteventsService],

})
export class SnapshoteventsModule {}
