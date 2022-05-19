import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OauthclientdetailsService } from './oauthclientdetails.service';
import { OauthclientdetailsController } from './oauthclientdetails.controller';
import { ConfigModule } from '@nestjs/config';
import { Oauthclientdetails, OauthclientdetailsSchema } from './schemas/oauthclientdetails.schema';
@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Oauthclientdetails.name, schema: OauthclientdetailsSchema }],'SERVER_TRANS')
    ],
    controllers: [OauthclientdetailsController],
    providers: [OauthclientdetailsService],
    exports: [OauthclientdetailsService],

})
export class OauthclientdetailsModule {


}
