import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "generated/prisma/runtime/library";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable({})
export class AuthService {
    constructor(private prisma : PrismaService, private config : ConfigService, private jwt : JwtService) {}

    async signup(dto : AuthDto) {
      
        try {
            // Generate the password hash
            const hash = await argon.hash(dto.password)
            
            // Save the new user in db
            const user = await this.prisma.user.create({
                data : {
                    email : dto.email,
                    hash,
                }
            })

            // Return the token
            return this.signToken(user.id, user.email)

    } catch(err){
        if (err instanceof PrismaClientKnownRequestError){
            if (err.code === 'P2002')
                throw new ForbiddenException('Credentials taken')
        } else 
            throw err
    }


  }

  async signin(dto : AuthDto){
    // Find user by email
    const user = await this.prisma.user.findUnique({
        where : {
            email : dto.email
        }
    })

    // Guard condition
    if (!user) 
        throw new ForbiddenException('Credentials incorrect')
    
    // Compare passwords
    const pwMatch = await argon.verify(user.hash, dto.password)
    
    // Guard condition
    if(!pwMatch)
        throw new ForbiddenException('Credentials incorrect')

    return this.signToken(user.id, user.email)
  }

  signToken(userId, email) : {access_token : string}  {
    
    // Making the payload
    const payload = {
        sub : userId,
        email
    }

    const token = this.jwt.sign(payload, {
        expiresIn : '15m',
        secret : this.config.get('JWT_SECRET')
    })

    // Return the Token
    return {
        access_token : token
    }
    
  }
}