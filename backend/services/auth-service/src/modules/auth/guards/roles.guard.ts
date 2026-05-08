import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

export class RolesGuard implements CanActivate {
  constructor(private requiredRole: string) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== this.requiredRole) {
      throw new ForbiddenException(`Require ${this.requiredRole} role`);
    }

    return true;
  }
}

export function createRolesGuard(requiredRole: string): RolesGuard {
  return new RolesGuard(requiredRole);
}