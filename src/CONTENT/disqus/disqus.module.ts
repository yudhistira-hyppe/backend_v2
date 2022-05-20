import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DisqusService } from './Disqus.service';
import { DisqusController } from './Disqus.controller';
import { ConfigModule } from '@nestjs/config';
import { Disqus, DisqusSchema } from './schemas/Disqus.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Disqus.name, schema: DisqusSchema }],'SERVER_CONTENT')
    ],
    controllers: [DisqusController],
    providers: [DisqusService],
    exports: [DisqusService],
})
export class DisqusModule {}
