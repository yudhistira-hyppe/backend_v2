export class CreateJwtrefreshtokenDto {
  readonly _id: { oid: String };
  refresh_token_id: String;
  email: String;
  iat: { numberLong: String };
  exp: { numberLong: String };
  userAuth: {
    $ref: String;
    $id: String;
  };
  _class: 'io.melody.core.domain.JwtRefreshToken';
}