import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { PrismaService } from '../src/prisma/prisma.service'

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

    // Get the prisma service of the app
    prisma = app.get(PrismaService)

    await prisma.cleanDb()
  })

  afterAll(()=>{
    app.close()
  })

  it.todo('test')
})