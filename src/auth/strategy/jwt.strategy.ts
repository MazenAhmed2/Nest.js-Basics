import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){ // jwt is the name of strategy
    constructor(private config : ConfigService, private prisma : PrismaService){
        const options = {
            // ignoreExpiration: false,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey : config.get('JWT_SECRET'),
        }
        super(options)
    }

    async validate(payload) {

        // fetch user from database
        const user = await this.prisma.user.findUnique({
            where : {
                id : payload.sub
            }
        })

        if (user){
            const {hash : _ , ...result} = user
            return result
        }

        return null  // this return will be attached to req.user
    }
}