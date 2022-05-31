
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FsChunksService } from './fs.chunks.service';
import { FsChunksController } from './fs.chunks.controller';
import { ConfigModule } from '@nestjs/config';
import { Fschunks, FschunksSchema } from './schemas/fs.chunks.schema';
@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Fschunks.name, schema: FschunksSchema }],'SERVER_INFRA')
    ],
    controllers: [FsChunksController],
    providers: [FsChunksService],
    exports: [FsChunksService],
})
export class FsChunksModule {}
