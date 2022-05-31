export class CreateOauthclientdetailsDto {
  

    readonly _id: { oid:String;  };
    readonly oauth_additional_information: String;
    readonly  oauth_autoapprove: boolean;
    readonly  oauth_resource_ids: String;
    readonly  oauth_authorized_grant_types: String;
    readonly  oauth_refresh_token_validity: Number;
    readonly  service_account_user: String;
    readonly  oauth_client_secret: String;
    readonly  oauth_authorities: String;
    readonly  oauth_redirect_uri: String;
    readonly  service_account_private_p12: String;
    readonly  application_name: String;
    readonly  database_name: String;
    readonly  oauth_provider: String;
    readonly  oauth_access_token_validity: Number;
    readonly  scopes: [];
    readonly  service_client_id: String;
    readonly  service_account_email: String;
    readonly  oauth_client_secret_json: String;
    readonly  oauth_client_id: String;

  }