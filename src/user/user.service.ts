import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
    constructor(private prisma : PrismaService){}

    async editUser(userId, dto : EditUserDto){
        const user = await this.prisma.user.update({
            where : {
                id : userId,
            },
            data : dto

        })

        const { hash : _, ...result } = user

        return result
    }
}
