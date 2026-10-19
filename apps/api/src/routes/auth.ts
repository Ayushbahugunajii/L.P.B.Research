import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { RegisterBodySchema, LoginBodySchema, RefreshBodySchema } from '@study-search/shared';
import { AuthService } from '../services/authService.js';

export const authRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.post(
    '/auth/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Register a new user account',
        body: RegisterBodySchema
      }
    },
    async (request, reply) => {
      try {
        const { name, email, password } = request.body;
        const user = await AuthService.register(name, email, password);

        const accessToken = fastify.jwt.sign(
          { id: user.id, email: user.email, name: user.name },
          { expiresIn: '1h' }
        );

        const refreshToken = fastify.jwt.sign(
          { id: user.id, email: user.email, name: user.name },
          { expiresIn: '7d' }
        );

        reply.setCookie('study_refresh_token', refreshToken, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60
        });

        return reply.status(201).send({
          user,
          accessToken
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Registration failed';
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: msg
        });
      }
    }
  );

  fastify.post(
    '/auth/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        body: LoginBodySchema
      }
    },
    async (request, reply) => {
      try {
        const { email, password } = request.body;
        const user = await AuthService.login(email, password);

        const accessToken = fastify.jwt.sign(
          { id: user.id, email: user.email, name: user.name },
          { expiresIn: '1h' }
        );

        const refreshToken = fastify.jwt.sign(
          { id: user.id, email: user.email, name: user.name },
          { expiresIn: '7d' }
        );

        reply.setCookie('study_refresh_token', refreshToken, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60
        });

        return reply.send({
          user,
          accessToken
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Login failed';
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: msg
        });
      }
    }
  );

  fastify.post(
    '/auth/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Refresh access token using httpOnly refresh cookie',
        body: RefreshBodySchema
      }
    },
    async (request, reply) => {
      const refreshToken = request.cookies.study_refresh_token ?? request.body?.refreshToken;
      if (!refreshToken) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Refresh token missing'
        });
      }

      try {
        const decoded = fastify.jwt.verify<{ id: string; email: string; name: string }>(refreshToken);
        const newAccessToken = fastify.jwt.sign(
          { id: decoded.id, email: decoded.email, name: decoded.name },
          { expiresIn: '1h' }
        );

        return reply.send({
          accessToken: newAccessToken
        });
      } catch {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid or expired refresh token'
        });
      }
    }
  );

  fastify.post(
    '/auth/logout',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Log out user and clear refresh cookies'
      }
    },
    async (_request, reply) => {
      reply.clearCookie('study_refresh_token', { path: '/' });
      return reply.send({ success: true, message: 'Logged out successfully' });
    }
  );

  fastify.get(
    '/auth/me',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['Auth'],
        summary: 'Get current logged in user profile',
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => {
      const user = await AuthService.findById(request.user.id);
      if (!user) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User profile not found'
        });
      }
      return reply.send({ user });
    }
  );
};
