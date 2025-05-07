import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'generated/prisma';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

@Controller('users')
export class UserController {

    @UseGuards(JwtGuard)
    @Get('me')
    getMe(@GetUser() user : User){
        return req.user
    }
}
