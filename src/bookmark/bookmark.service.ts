import { ForbiddenException, HttpCode, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
    constructor(private prisma : PrismaService){}

    async getAllBookmarks(userId : number){
        return await this.prisma.bookmark.findMany({
            where : {
                userId : userId
            }
        })
    }

    async getBookmarkById(bookmarkId : number){
        return await this.prisma.bookmark.findUnique({
            where : {
                id : bookmarkId,
            }
        })
    }


    async createBookmark(dto : CreateBookmarkDto, userId : number){
        return await this.prisma.bookmark.create({
            data : {...dto, userId}
        })
    }

    async editBookmark(dto : EditBookmarkDto, bookmarkId : number, userId : number){

        const bookmark = await this.prisma.bookmark.findUnique({
            where : {
                id : bookmarkId
            }
        })
        
        if (!bookmark || bookmark?.userId != userId){
            throw new ForbiddenException('Access denied')
        }
                
        return await this.prisma.bookmark.update({
            where : {
                id : bookmarkId,
            }, 
            data : dto
        })
    }

    async deleteBookmark(bookmarkId : number, userId : number){
        const bookmark = await this.prisma.bookmark.findUnique({
            where : {
                id : bookmarkId
            }
        })
        
        if (!bookmark || bookmark?.userId != userId){
            throw new ForbiddenException('Access denied')
        }
                
        await this.prisma.bookmark.delete({
            where : {
                id : bookmarkId,
            }, 
        })
    }
}
