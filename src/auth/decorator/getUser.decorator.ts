import { createParamDecorator } from "@nestjs/common";

export const GetUser = createParamDecorator(
    (data : unknown, ctx) => {
        const request = ctx.switchToHttp().getRequest()
        return request.user
    }
)