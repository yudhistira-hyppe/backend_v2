import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ScheduleEmailDocument = ScheduleEmail & Document ;

@Schema()
export class ScheduleEmail { 
}

export const ScheduleEmailSchema = SchemaFactory.createForClass(ScheduleEmail);