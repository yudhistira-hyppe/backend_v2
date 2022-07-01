import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { Referral } from './schemas/referral.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
@Controller('api/referral')
export class ReferralController {
 
        constructor(private readonly referralService: ReferralService) {}
    
        @Post()
        async create(@Body() CreateSagasDto: CreateReferralDto) {
          await this.referralService.create(CreateSagasDto);
        }
        @UseGuards(JwtAuthGuard)
        @Get()
        async findAll(): Promise<Referral[]> {
          return this.referralService.findAll();
        }
      
        @Get(':id')
        async findOne(@Param('id') id: string): Promise<Referral> {
          return this.referralService.findOne(id);
        }
      
        @Delete(':id')
        async delete(@Param('id') id: string) {
          return this.referralService.delete(id);
        }

}
