import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DisquscontactsService } from './disquscontacts.service';
import { DisquscontactsController } from './disquscontacts.controller';
import { ConfigModule } from '@nestjs/config';
import { Disquscontacts, DisquscontactsSchema } from './schemas/disquscontacts.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Disquscontacts.name, schema: DisquscontactsSchema }], 'SERVER_FULL')
    ],
    controllers: [DisquscontactsController],
    providers: [DisquscontactsService],
    exports: [DisquscontactsService],
})
export class DisquscontactsModule { }
