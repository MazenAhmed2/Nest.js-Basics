import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { PrismaService } from '../src/prisma/prisma.service'
import * as pactum from 'pactum'
import { AuthDto } from '../src/auth/dto'
import { EditUserDto } from '../src/user/dto'

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
    pactum.request.setBaseUrl('http://localhost:3333')
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
        pactum.spec().post(`auth/signup`).withBody(dto).expectStatus(201).inspect()
      })
      it('empty email', ()=>{
        pactum.spec().post(`auth/signup`).withBody({password : dto.password}).expectStatus(400).inspect()
      })
      it('empty password', ()=>{
        pactum.spec().post(`auth/signup`).withBody({email : dto.email}).expectStatus(400).inspect()
      })
    })

    describe('Signin', ()=>{
      it('should pass', ()=>{
        pactum.spec().post(`auth/signin`).withBody(dto).expectStatus(200).stores('userAt', 'access_token')
      })
    })
  })

  describe('User', ()=>{

    describe('access user', ()=>{
      it('should pass', ()=>{
        pactum.spec().get(`users/me`).withBearerToken('$S{userAt}').expectStatus(200).stores('userAt', 'access_token')
      })
      it('no access token', ()=>{
        pactum.spec().get(`users/me`).expectStatus(401).stores('userAt', 'access_token')
      })
    })

    describe('Edit User', ()=>{

      const dto : EditUserDto = {
        firstName : 'Mazen',
        lastName : 'Gassar'
      }

      it('should edit user', ()=>{
        pactum.spec().patch(`users`).withBody(dto).withBearerToken('$S{userAt}').expectStatus(200).inspect()
      })
    })

  })

  describe('Bookmark', ()=>{

  })

  it.todo('test')
})