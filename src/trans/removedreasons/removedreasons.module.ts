import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RemovedreasonsController } from './removedreasons.controller';
import { RemovedreasonsService } from './removedreasons.service';
import { ConfigModule } from '@nestjs/config';
import { Removedreasons, RemovedreasonsSchema } from './schemas/removedreasons.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Removedreasons.name, schema: RemovedreasonsSchema }], 'SERVER_FULL')
    ],
    controllers: [RemovedreasonsController],
    providers: [RemovedreasonsService],
    exports: [RemovedreasonsService],
})
export class RemovedreasonsModule { }
