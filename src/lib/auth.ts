import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'adpilot_super_secret_jwt_key_32_bytes_long_min!';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  const authHeader = req.headers.get('authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    token = req.cookies.get('adpilot_session')?.value || null;
  }

  if (!token) {
    // Default fallback to demo user for ease of local testing
    const demoUser = await prisma.user.findFirst({ where: { email: 'paras@adpilot.ai' } });
    const demoOrg = await prisma.organization.findFirst({});
    if (demoUser && demoOrg) {
      return {
        userId: demoUser.id,
        email: demoUser.email,
        role: demoUser.role,
        organizationId: demoOrg.id,
      };
    }
    return null;
  }

  return verifyToken(token);
}

export function hasPermission(role: string, permission: string): boolean {
  const rolePermissions: Record<string, string[]> = {
    OWNER: ['*'],
    ADMIN: [
      'ads.read', 'ads.edit', 'ads.pause', 'ads.delete', 'ads.publish',
      'comments.read', 'comments.manage', 'automation.manage', 'ai.generate',
      'ai.publish', 'billing.manage', 'team.manage', 'settings.manage'
    ],
    MANAGER: [
      'ads.read', 'ads.edit', 'ads.pause', 'ads.publish',
      'comments.read', 'comments.manage', 'automation.manage', 'ai.generate', 'ai.publish'
    ],
    ANALYST: ['ads.read', 'comments.read', 'ai.generate'],
    VIEWER: ['ads.read', 'comments.read'],
  };

  const allowed = rolePermissions[role] || [];
  return allowed.includes('*') || allowed.includes(permission);
}
