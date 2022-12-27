import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { LocationDTO } from "../Profile";

export class LoginRequest {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsString()
    @IsNotEmpty()
    password: string;
    location: LocationDTO;
    @IsString()
    @IsNotEmpty()
    deviceId: string;
    @IsString()
    devicetype: string;
    @IsString()
    referral: string;
    @IsString()
    imei: string;
    @IsString()
    lang: string;
} 

export class RefreshTokenRequest {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}

export class LogoutRequest {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsString()
    @IsNotEmpty()
    deviceId: string;
}

export class DeviceActivityRequest {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsString()
    @IsNotEmpty()
    deviceId: string;
    @IsString()
    @IsNotEmpty()
    event: string;
    @IsString()
    @IsNotEmpty()
    status: string;
}

export class RecoverPasswordRequest {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    otp: string;
    @IsString()
    @IsNotEmpty()
    event: string;
    @IsString()
    @IsNotEmpty()
    status: string;
}