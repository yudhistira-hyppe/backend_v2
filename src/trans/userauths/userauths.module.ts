import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserauthsController } from './userauths.controller';
import { UserauthsService } from './userauths.service';
import { ConfigModule } from '@nestjs/config';
import { Userauth, UserauthSchema } from './schemas/userauth.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Userauth.name, schema: UserauthSchema }], 'SERVER_FULL')
    ],
    controllers: [UserauthsController],
    providers: [UserauthsService],
    exports: [UserauthsService],
})
export class UserauthsModule {

}
