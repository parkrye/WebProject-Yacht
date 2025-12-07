import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class PlayerGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    return !!req.headers['x-player-id']; // 프런트에서 헤더로 전달
  }
}
