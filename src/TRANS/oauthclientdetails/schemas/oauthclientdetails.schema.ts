import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type OauthclientdetailsDocument = Oauthclientdetails & Document ;

@Schema()
export class Oauthclientdetails {
   @Prop({type: mongoose.Schema.Types.ObjectId})
  _id: { oid:String  }
  @Prop()
  oauth_additional_information: String
  @Prop()
  oauth_autoapprove: boolean
  @Prop()
  oauth_resource_ids:String
  @Prop()
  oauth_authorized_grant_types:String
  @Prop()
  oauth_refresh_token_validity:Number
  @Prop()
  service_account_user:String
  @Prop()
  oauth_client_secret:String
  @Prop()
  oauth_authorities:String
  @Prop()
  oauth_redirect_uri:String
  @Prop()
  service_account_private_p12:String
  @Prop()
  application_name:String
  @Prop()
  database_name:String
  @Prop()
  oauth_provider:String
  @Prop()
  oauth_access_token_validity:Number
  @Prop([])
  scopes:[]
  @Prop()
  service_client_id:String
  @Prop()
  service_account_email:String
  @Prop()
  oauth_client_secret_json:String
  @Prop()
  oauth_client_id:String
}

export const OauthclientdetailsSchema = SchemaFactory.createForClass(Oauthclientdetails);