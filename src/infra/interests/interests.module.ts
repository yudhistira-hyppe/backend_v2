import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterestsService } from './interests.service';
import { InterestsController } from './interests.controller';
import { ConfigModule } from '@nestjs/config';
import { Interests, InterestsSchema } from './schemas/interests.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Interests.name, schema: InterestsSchema }],'SERVER_INFRA')
    ],
    controllers: [InterestsController],
    providers: [InterestsService],
    exports: [InterestsService],
})
export class InterestsModule {}
