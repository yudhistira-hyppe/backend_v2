import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterestsRepoService } from './interests_repo.service';
import { InterestsRepoController } from './interests_repo.controller';
import { ConfigModule } from '@nestjs/config';
import { Interestsrepo, InterestsrepoSchema } from './schemas/interests_repo.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Interestsrepo.name, schema: InterestsrepoSchema }], 'SERVER_FULL')
    ],
    controllers: [InterestsRepoController],
    providers: [InterestsRepoService],
    exports: [InterestsRepoService],
})
export class InterestsRepoModule { }
