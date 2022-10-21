import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { ConfigModule } from '@nestjs/config';
import { Reactions, ReactionsSchema } from './schemas/reactions.schema';
@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Reactions.name, schema: ReactionsSchema }], 'SERVER_FULL')
    ],
    controllers: [ReactionsController],
    providers: [ReactionsService],
    exports: [ReactionsService],

})
export class ReactionsModule { }
