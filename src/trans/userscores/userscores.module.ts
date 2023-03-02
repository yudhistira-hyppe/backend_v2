import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserscoresService } from './userscores.service';
import { UserscoresController } from './userscores.controller';
import { ConfigModule } from '@nestjs/config';
import { Userscores, UserscoresSchema } from './schemas/userscores.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Userscores.name, schema: UserscoresSchema }], 'SERVER_FULL')
    ],
    controllers: [UserscoresController],
    providers: [UserscoresService],
    exports: [UserscoresService],
})
export class UserscoresModule { }