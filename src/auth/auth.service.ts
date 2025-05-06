import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "generated/prisma/runtime/library";

@Injectable({})
export class AuthService {
    constructor(private prisma : PrismaService) {}
  async signup(dto : AuthDto){
      
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
        const {hash: _, ...result} = user
        
        // Return the saved user
        return result

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

    const {hash: _, ...result} = user

    return result
  }
}