import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DisquslogsService } from './Disquslogs.service';
import { DisquslogsController } from './Disquslogs.controller';
import { ConfigModule } from '@nestjs/config';
import { Disquslogs, DisquslogsSchema } from './schemas/Disquslogs.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Disquslogs.name, schema: DisquslogsSchema }],'SERVER_CONTENT')
    ],
    controllers: [DisquslogsController],
    providers: [DisquslogsService],
    exports: [DisquslogsService],
})
export class DisquslogsModule {}
