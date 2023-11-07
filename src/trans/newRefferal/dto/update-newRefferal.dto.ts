import { PartialType } from '@nestjs/mapped-types';
import { CreateNewRefferalDto } from './create-newRefferal.dto';

export class UpdateNewRefferalDto extends PartialType(CreateNewRefferalDto) {}
