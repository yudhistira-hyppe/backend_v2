import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Userbadge, UserbadgeSchema } from './schemas/userbadge.schema';
import { UserbadgeController } from './userbadge.controller';
import { UserbadgeService } from './userbadge.service';
import { UtilsModule } from '../../utils/utils.module';


@Module({
    imports: [
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Userbadge.name, schema: UserbadgeSchema }], 'SERVER_FULL')
    ],
    controllers: [UserbadgeController],
    providers: [UserbadgeService],
    exports: [UserbadgeService],
})
export class UserbadgeModule { }
