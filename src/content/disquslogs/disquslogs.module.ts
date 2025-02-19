import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DisquslogsService } from './disquslogs.service';
import { DisquslogsController } from './disquslogs.controller';
import { ConfigModule } from '@nestjs/config';
import { Disquslogs, DisquslogsSchema } from './schemas/disquslogs.schema';
import { UtilsModule } from '../../utils/utils.module';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module'; 

@Module({
    imports: [
        UtilsModule,
        UserbasicsModule,
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Disquslogs.name, schema: DisquslogsSchema }], 'SERVER_FULL')
    ],
    controllers: [DisquslogsController],
    providers: [DisquslogsService],
    exports: [DisquslogsService],
})
export class DisquslogsModule { }
