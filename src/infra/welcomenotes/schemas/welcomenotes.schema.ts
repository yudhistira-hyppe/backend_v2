import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type WelcomenotesDocument = Welcomenotes & Document ;

@Schema()
export class Welcomenotes {
 @Prop({type: mongoose.Schema.Types.ObjectId})
 _id: { oid:String  }

  @Prop()
  langIso: string

  @Prop([])
  content: [
    {
        notesData:[{
            page:Number
            note:{
                type:String
                crossAxisAlignment:String
                mainAxisAlignment:String
                mainAxisSize:String
                textBaseline:String
                verticalDirection:String
                children: [
                    {
                      type: String
                      data: String
                      textAlign: String
                      overflow: String
                      textDirection: String
                      style: {
                        color: String
                        decoration: String
                        fontSize: Number;
                        fontFamily: String
                        fontStyle: String
                        fontWeight: String
                      }
                    },
                    {
                        type: String
                        textSpan: {
                        text: String
                        style: {
                            color: String
                            decoration: String
                            fontSize: Number;
                            fontFamily: String
                            fontStyle: String
                            fontWeight: String
                          }
                      },
                      textAlign: String
                      overflow: String
                      textDirection: String
                    },
                    {
                       type: String
                       name: String
                       width: String
                       alignment: String
                       repeat: String
                       matchTextDirection: String
                       gaplessPlayback: String
                       filterQuality: String
                    }
                ]
            }
        }]
        
    }
]
 
  @Prop()
  countryCode: String
  @Prop()
  createdAt: String
  @Prop()
  updatedAt: String
  @Prop()
  _class: String
 
}

export const WelcomenotesSchema = SchemaFactory.createForClass(Welcomenotes);