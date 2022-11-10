import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';
import { Theme, ThemeSchema } from './schemas/theme.schema';
import { UtilsModule } from '../../utils/utils.module';

@Module({
    imports: [
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Theme.name, schema: ThemeSchema }], 'SERVER_FULL')
    ],
    controllers: [ThemeController],
    providers: [ThemeService],
    exports: [ThemeService],

})
export class ThemeModule {}
