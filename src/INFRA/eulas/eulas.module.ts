import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EulasService } from './eulas.service';
import { EulasController } from './eulas.controller';
import { ConfigModule } from '@nestjs/config';
import { Eulas, EulasSchema } from './schemas/eulas.schema';
@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Eulas.name, schema: EulasSchema }],'SERVER_INFRA')
    ],
    controllers: [EulasController],
    providers: [EulasService],
    exports: [EulasService],

})
export class EulasModule {}
