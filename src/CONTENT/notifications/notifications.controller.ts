import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationsDto } from './dto/create-notifications.dto';
import { Notifications } from './schemas/notifications.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/notifications')
export class NotificationsController {
    constructor(private readonly NotificationsService: NotificationsService) {}

    @Post()
    async create(@Body() CreateNotificationsDto: CreateNotificationsDto) {
      await this.NotificationsService.create(CreateNotificationsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Notifications[]> {
      return this.NotificationsService.findAll();
    }
    // @Get(':id')
    // async findOneId(@Param('id') id: string): Promise<Notifications> {
    //   return this.NotificationsService.findOne(id);
    // }
  
    @Get(':email')
    async findOneId(@Param('email') email: string): Promise<Notifications> {
      return this.NotificationsService.findOne(email);
    }
    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.NotificationsService.delete(id);
    }
}
