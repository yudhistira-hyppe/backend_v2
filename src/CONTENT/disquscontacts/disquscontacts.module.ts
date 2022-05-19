import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DisquscontactsService } from './Disquscontacts.service';
import { DisquscontactsController } from './Disquscontacts.controller';
import { ConfigModule } from '@nestjs/config';
import { Disquscontacts, DisquscontactsSchema } from './schemas/Disquscontacts.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Disquscontacts.name, schema: DisquscontactsSchema }],'SERVER_CONTENT')
    ],
    controllers: [DisquscontactsController],
    providers: [DisquscontactsService],
    exports: [DisquscontactsService],
})
export class DisquscontactsModule {}
