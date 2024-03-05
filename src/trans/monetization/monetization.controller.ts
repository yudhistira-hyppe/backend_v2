import { Body, Headers, Controller, Delete, Get, Param, Post, UseGuards, HttpCode, HttpStatus, Req, Logger } from '@nestjs/common';
import { MonetizationService } from './monetization.service';

@Controller('api/monetization')
export class MonetizationController {
  constructor(private readonly monetizationService: MonetizationService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.monetizationService.findOne(id);
  }

  @Get()
  async index() {
    return this.monetizationService.find();
  }
}
