import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import { env } from '../config/env.js';

export interface UserTokenPayload {
  id: string;
  email: string;
  name: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: UserTokenPayload;
    user: UserTokenPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  // Register Cookie plugin
  await fastify.register(fastifyCookie, {
    secret: env.COOKIE_SECRET
  });

  // Register JWT plugin
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'study_access_token',
      signed: false
    }
  });

  // Auth decorator
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid, expired, or missing authentication token'
      });
    }
  });
});
