import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import {
  CreateBookmarkSchema,
  BookmarkQuerySchema,
  CreateFolderSchema,
  CreateNoteSchema
} from '@study-search/shared';
import { BookmarkModel } from '../models/Bookmark.js';
import { FolderModel } from '../models/Folder.js';
import { NoteModel } from '../models/Note.js';
import mongoose from 'mongoose';

interface InMemoryBookmark {
  id: string;
  userId: string;
  type: 'video' | 'paper' | 'web';
  title: string;
  targetId: string;
  targetUrl: string;
  timestampSec?: number;
  snippet?: string;
  note?: string;
  folderId?: string;
  tags: string[];
  createdAt: string;
}

const inMemoryBookmarks: InMemoryBookmark[] = [];
const inMemoryFolders: Array<{ id: string; userId: string; name: string; color?: string; createdAt: string }> = [];
const inMemoryNotes: Array<{ id: string; userId: string; bookmarkId?: string; title: string; content: string; createdAt: string }> = [];

export const bookmarkRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  // GET /bookmarks
  fastify.get(
    '/bookmarks',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['Bookmarks'],
        summary: 'Get saved bookmarks (videos with timestamps, papers, passages)',
        querystring: BookmarkQuerySchema,
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { type, folderId } = request.query;

      if (mongoose.connection.readyState === 1) {
        const query: Record<string, unknown> = { userId: new mongoose.Types.ObjectId(userId) };
        if (type) query.type = type;
        if (folderId) query.folderId = new mongoose.Types.ObjectId(folderId);

        const items = await BookmarkModel.find(query).sort({ createdAt: -1 }).lean();
        return reply.send({
          bookmarks: items.map((b) => ({
            id: b._id.toString(),
            userId: b.userId.toString(),
            type: b.type,
            title: b.title,
            targetId: b.targetId,
            targetUrl: b.targetUrl,
            timestampSec: b.timestampSec,
            snippet: b.snippet,
            note: b.note,
            folderId: b.folderId?.toString(),
            tags: b.tags,
            createdAt: b.createdAt.toISOString()
          }))
        });
      }

      // In-memory fallback
      let filtered = inMemoryBookmarks.filter((b) => b.userId === userId);
      if (type) filtered = filtered.filter((b) => b.type === type);
      if (folderId) filtered = filtered.filter((b) => b.folderId === folderId);

      return reply.send({ bookmarks: filtered });
    }
  );

  // POST /bookmarks
  fastify.post(
    '/bookmarks',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['Bookmarks'],
        summary: 'Save a result (video timestamp, paper citation, or web passage) to study library',
        body: CreateBookmarkSchema,
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { type, title, targetId, targetUrl, timestampSec, snippet, note, folderId, tags } = request.body;

      if (mongoose.connection.readyState === 1) {
        const created = await BookmarkModel.create({
          userId: new mongoose.Types.ObjectId(userId),
          type,
          title,
          targetId,
          targetUrl,
          timestampSec,
          snippet,
          note,
          folderId: folderId ? new mongoose.Types.ObjectId(folderId) : undefined,
          tags: tags ?? []
        });

        return reply.status(201).send({
          bookmark: {
            id: created._id.toString(),
            userId: created.userId.toString(),
            type: created.type,
            title: created.title,
            targetId: created.targetId,
            targetUrl: created.targetUrl,
            timestampSec: created.timestampSec,
            snippet: created.snippet,
            note: created.note,
            folderId: created.folderId?.toString(),
            tags: created.tags,
            createdAt: created.createdAt.toISOString()
          }
        });
      }

      const id = `bm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const bookmark: InMemoryBookmark = {
        id,
        userId,
        type,
        title,
        targetId,
        targetUrl,
        timestampSec,
        snippet,
        note,
        folderId,
        tags: tags ?? [],
        createdAt: new Date().toISOString()
      };
      inMemoryBookmarks.unshift(bookmark);

      return reply.status(201).send({ bookmark });
    }
  );

  // DELETE /bookmarks/:id
  fastify.delete(
    '/bookmarks/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['Bookmarks'],
        summary: 'Delete a saved bookmark',
        params: Type.Object({ id: Type.String() }),
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { id } = request.params;

      if (mongoose.connection.readyState === 1) {
        await BookmarkModel.deleteOne({
          _id: new mongoose.Types.ObjectId(id),
          userId: new mongoose.Types.ObjectId(userId)
        });
        return reply.send({ success: true, message: 'Bookmark removed' });
      }

      const idx = inMemoryBookmarks.findIndex((b) => b.id === id && b.userId === userId);
      if (idx !== -1) {
        inMemoryBookmarks.splice(idx, 1);
      }
      return reply.send({ success: true, message: 'Bookmark removed' });
    }
  );

  // GET /folders
  fastify.get(
    '/folders',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['Bookmarks'],
        summary: 'List user study folders',
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => {
      const userId = request.user.id;

      if (mongoose.connection.readyState === 1) {
        const folders = await FolderModel.find({ userId: new mongoose.Types.ObjectId(userId) }).lean();
        return reply.send({
          folders: folders.map((f) => ({
            id: f._id.toString(),
            userId: f.userId.toString(),
            name: f.name,
            color: f.color,
            createdAt: f.createdAt.toISOString()
          }))
        });
      }

      return reply.send({
        folders: inMemoryFolders.filter((f) => f.userId === userId)
      });
    }
  );

  // POST /folders
  fastify.post(
    '/folders',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['Bookmarks'],
        summary: 'Create a new study folder',
        body: CreateFolderSchema,
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { name, color } = request.body;

      if (mongoose.connection.readyState === 1) {
        const folder = await FolderModel.create({
          userId: new mongoose.Types.ObjectId(userId),
          name,
          color: color ?? '#3b82f6'
        });
        return reply.status(201).send({
          folder: {
            id: folder._id.toString(),
            userId: folder.userId.toString(),
            name: folder.name,
            color: folder.color,
            createdAt: folder.createdAt.toISOString()
          }
        });
      }

      const id = `fld_${Date.now()}`;
      const fld = { id, userId, name, color: color ?? '#3b82f6', createdAt: new Date().toISOString() };
      inMemoryFolders.push(fld);
      return reply.status(201).send({ folder: fld });
    }
  );

  // GET /notes
  fastify.get(
    '/notes',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['Bookmarks'],
        summary: 'Get study notes',
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => {
      const userId = request.user.id;

      if (mongoose.connection.readyState === 1) {
        const notes = await NoteModel.find({ userId: new mongoose.Types.ObjectId(userId) }).lean();
        return reply.send({
          notes: notes.map((n) => ({
            id: n._id.toString(),
            userId: n.userId.toString(),
            bookmarkId: n.bookmarkId?.toString(),
            title: n.title,
            content: n.content,
            createdAt: n.createdAt.toISOString()
          }))
        });
      }

      return reply.send({
        notes: inMemoryNotes.filter((n) => n.userId === userId)
      });
    }
  );

  // POST /notes
  fastify.post(
    '/notes',
    {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['Bookmarks'],
        summary: 'Create a new study note',
        body: CreateNoteSchema,
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { bookmarkId, title, content } = request.body;

      if (mongoose.connection.readyState === 1) {
        const note = await NoteModel.create({
          userId: new mongoose.Types.ObjectId(userId),
          bookmarkId: bookmarkId ? new mongoose.Types.ObjectId(bookmarkId) : undefined,
          title,
          content
        });

        return reply.status(201).send({
          note: {
            id: note._id.toString(),
            userId: note.userId.toString(),
            bookmarkId: note.bookmarkId?.toString(),
            title: note.title,
            content: note.content,
            createdAt: note.createdAt.toISOString()
          }
        });
      }

      const id = `note_${Date.now()}`;
      const newNote = { id, userId, bookmarkId, title, content, createdAt: new Date().toISOString() };
      inMemoryNotes.push(newNote);
      return reply.status(201).send({ note: newNote });
    }
  );
};
