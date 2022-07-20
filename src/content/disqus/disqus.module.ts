import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DisqusService } from './disqus.service';
import { DisqusController } from './disqus.controller';
import { ConfigModule } from '@nestjs/config';
import { Disqus, DisqusSchema } from './schemas/disqus.schema';
import { UtilsModule } from '../../utils/utils.module';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({

    imports: [
        NestjsFormDataModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Disqus.name, schema: DisqusSchema }],'SERVER_CONTENT')
    ],
    controllers: [DisqusController],
    providers: [DisqusService],
    exports: [DisqusService],
})
export class DisqusModule {}
