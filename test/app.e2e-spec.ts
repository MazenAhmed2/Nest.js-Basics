import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { PrismaService } from '../src/prisma/prisma.service'
import * as pactum from 'pactum'
import { AuthDto } from '../src/auth/dto'
import { EditUserDto } from '../src/user/dto'
import { dot } from 'node:test/reporters'
import { CreateBookmarkDto } from 'src/bookmark/dto'

describe('APP e2e', ()=>{
  let app : INestApplication
  let prisma : PrismaService
  beforeAll(async ()=>{
    const moduleRef = await Test.createTestingModule({
      imports : [AppModule]
    }).compile()

    app = moduleRef.createNestApplication()

    app.useGlobalPipes(new ValidationPipe({  // Must be put to enable validation
        whitelist: true, // Allow the fields of schema only
      }))
    
    await app.init()
    await app.listen(3333)

    // Get the prisma service of the app
    prisma = app.get(PrismaService)

    await prisma.cleanDb()
    pactum.request.setBaseUrl('http://localhost:3333/')
  })

  afterAll(()=>{
    app.close()
  })

  const dto : AuthDto = {
    email: "mazengassar@gmail.com",
    password: "mazen"
  }

  describe('Auth', ()=>{

    describe('Signup', ()=>{
      it('should pass', ()=>{
        return pactum
        .spec()
        .post(`auth/signup`)
        .withBody(dto)
        .expectStatus(201)
      })
      it('empty email', ()=>{
        return pactum
        .spec()
        .post(`auth/signup`)
        .withBody({password : dto.password})
        .expectStatus(400)
      })
      it('empty password', ()=>{
        return pactum
        .spec()
        .post(`auth/signup`)
        .withBody({email : dto.email})
        .expectStatus(400)
      })
    })

    describe('Signin', ()=>{
      it('should pass', ()=>{
        return pactum
        .spec()
        .post(`auth/signin`)
        .withBody(dto)
        .expectStatus(200)
        .stores('userAt', 'access_token')
      })
    })
  })

  describe('User', ()=>{

    describe('access user', ()=>{
      it('should pass', ()=>{
        return pactum
        .spec()
        .get(`users/me`)
        .withBearerToken('$S{userAt}')
        .expectStatus(200)
        .stores('userId', 'id')
      })

      it('no access token', ()=>{
        return pactum
        .spec()
        .get(`users/me`)
        .expectStatus(401)
      })
    })

    describe('Edit User', ()=>{

      const dto : EditUserDto = {
        firstName : 'Mazen',
        lastName : 'Gassar'
      }

      it('should edit user', ()=>{
        return pactum.spec()
        .patch(`users/$S{userId}`)
        .withBody(dto)
        .withBearerToken('$S{userAt}')
        .expectStatus(200)
        .expectBodyContains(dto.firstName)
        .expectBodyContains(dto.lastName)
        
      })
    })

  })

  describe('Bookmark', ()=>{

    let dto : CreateBookmarkDto = {
      title: 'Important',
      description : 'this is description',
      link : 'www.dla.com'
    }

    describe('Create Bookmark', ()=>{
      it('should pass', ()=>{
        return pactum.spec()
        .post('bookmarks')
        .withBody(dto)
        .withBearerToken('$S{userAt}')
        .expectBodyContains(dto.title)
        .expectStatus(201)
        .stores('bookmarkId', 'id')
      })
      
    })

    describe('Edit Bookmark', ()=>{
      
      dto.title = "edited"

      it('should pass', ()=>{
        return pactum.spec()
        .patch('bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withBody(dto)
        .withBearerToken('$S{userAt}')
        .expectBodyContains("edited")
        .expectStatus(200)
      })
      
    })

    describe('Get Bookmarks', ()=>{
      

      it('get all', ()=>{
        return pactum.spec()
        .get('bookmarks')
        .withBearerToken('$S{userAt}')
        .expectStatus(200)
        .expectJsonLength(1)
      })
      
      it('get by id', ()=>{
        return pactum.spec()
        .get('bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withBearerToken('$S{userAt}')
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}')
      })
      
    })
    
    describe('Delete Bookmarks', ()=>{
      
      it('delete bookmark by id', ()=>{
        return pactum.spec()
        .delete('bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withBearerToken('$S{userAt}')
        .expectStatus(204)
      })

      it('get empty bookmarks', ()=>{
        return pactum.spec()
        .get('bookmarks')
        .withBearerToken('$S{userAt}')
        .expectStatus(200)
        .expectJsonLength(0)
      })

    })
  })

})