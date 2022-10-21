import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReactionsRepoService } from './reactions_repo.service';
import { ReactionsRepoController } from './reactions_repo.controller';
import { ConfigModule } from '@nestjs/config';
import { Reactionsrepo, ReactionsrepoSchema } from './schemas/reactionsrepo.schema';
@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Reactionsrepo.name, schema: ReactionsrepoSchema }], 'SERVER_FULL')
    ],
    controllers: [ReactionsRepoController],
    providers: [ReactionsRepoService],
    exports: [ReactionsRepoService],

})
export class ReactionsRepoModule { }
