import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import { env } from 'process';

@Injectable()
export class PrismaService extends PrismaClient{
    constructor(){
        super({
            datasources : {
                db : {
                    url : "postgresql://neondb_owner:npg_jhoTiGQt2z4e@ep-falling-base-a2r2xga1-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
                }
            }
        })

    }
}
