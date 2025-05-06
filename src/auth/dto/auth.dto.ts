import { IsEmail, IsNotEmpty, IsString, Min } from "class-validator"

export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
    email : string;

    @IsString()
    @IsNotEmpty()
    password : string;
}