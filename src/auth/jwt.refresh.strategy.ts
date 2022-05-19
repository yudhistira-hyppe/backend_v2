import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt'
import { AuthService } from "./auth.service";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    // constructor(
    //     @InjectRepository(UserRepository)
    //     private userRepository: UserRepository,
    //     private authService: AuthService
    // ){
    //     super({
    //         jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
    //         secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET || dbConfig.refreshSecret
    //     })
    // }

    // async validate(payload: JwtPayload) {
    //     const { username } = payload
    //     const user = await this.userRepository.findOne({ username })

    //     if (!user) {
    //         throw new UnauthorizedException()
    //     }
    //     return user
    // }
}