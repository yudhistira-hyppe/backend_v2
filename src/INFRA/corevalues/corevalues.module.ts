import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CorevaluesService } from './corevalues.service';
import { CorevaluesController } from './corevalues.controller';
import { ConfigModule } from '@nestjs/config';
import { Corevalues, CorevaluesSchema } from './schemas/corevalues.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Corevalues.name, schema: CorevaluesSchema }],'SERVER_INFRA')
    ],
    controllers: [CorevaluesController],
    providers: [CorevaluesService],
    exports: [CorevaluesService],
})
export class CorevaluesModule {}
