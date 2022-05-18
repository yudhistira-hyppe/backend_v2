
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FsfilesService } from './fsfiles.service';
import { FsfilesController } from './fsfiles.controller';
import { ConfigModule } from '@nestjs/config';
import { Fsfiles, FsfilesSchema } from './schemas/fsfiles.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Fsfiles.name, schema: FsfilesSchema }],'SERVER_INFRA')
    ],
    controllers: [FsfilesController],
    providers: [FsfilesService],
    exports: [FsfilesService],

})
export class FsfilesModule {}
