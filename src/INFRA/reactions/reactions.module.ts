import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReactionsService } from './Reactions.service';
import { ReactionsController } from './Reactions.controller';
import { ConfigModule } from '@nestjs/config';
import { Reactions, ReactionsSchema } from './schemas/Reactions.schema';
@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Reactions.name, schema: ReactionsSchema }],'SERVER_INFRA')
    ],
    controllers: [ReactionsController],
    providers: [ReactionsService],
    exports: [ReactionsService],

})
export class ReactionsModule {}
