import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('/bookmarks')
export class BookmarkController {
    constructor (private bookmarkService : BookmarkService){}
    
    @HttpCode(200)
    @Get()
    getAllBookmarks(
        @GetUser('id') userId : number,
    ){
        return this.bookmarkService.getAllBookmarks(userId)
    }

    @HttpCode(200)
    @Get(':id')
    async getBookmarkById(
        @GetUser('id') userId : number,
        @Param('id', ParseIntPipe) bookmarkId : number,
    ){
        
        const bookmark = await this.bookmarkService.getBookmarkById(bookmarkId)

        if (!bookmark || bookmark.userId != userId){
            throw new ForbiddenException('Access denied')
        }
        
        return bookmark
        
    }

    @Post()
    createBookmark(
        @GetUser('id') userId : number,
        @Body() dto : CreateBookmarkDto
    ){
        return this.bookmarkService.createBookmark(dto, userId)
    }

    @HttpCode(200)
    @Patch(':id')
    editBookmark(
        @Param('id',ParseIntPipe) bookmarkId : number,
        @GetUser('id') userId : number,
        @Body() dto : EditBookmarkDto
    ){
        return this.bookmarkService.editBookmark(dto, bookmarkId, userId)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteBookmark(
        @GetUser('id') userId : number,
        @Param('id', ParseIntPipe) bookmarkId : number,
    ){
        return this.bookmarkService.deleteBookmark(bookmarkId, userId)
    }
}
