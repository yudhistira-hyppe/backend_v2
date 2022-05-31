import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WelcomenotesService } from './welcomenotes.service';
import { WelcomenotesController } from './welcomenotes.controller';
import { ConfigModule } from '@nestjs/config';
import { Welcomenotes, WelcomenotesSchema } from './schemas/welcomenotes.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Welcomenotes.name, schema: WelcomenotesSchema }],'SERVER_INFRA')
    ],
    controllers: [WelcomenotesController],
    providers: [WelcomenotesService],
    exports: [WelcomenotesService],
})
export class WelcomenotesModule {}
