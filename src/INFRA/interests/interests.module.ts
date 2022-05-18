import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterestsService } from './Interests.service';
import { InterestsController } from './Interests.controller';
import { ConfigModule } from '@nestjs/config';
import { Interests, InterestsSchema } from './schemas/Interests.schema';

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
