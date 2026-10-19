import { Type, Static } from '@sinclair/typebox';

export const RegisterBodySchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8, maxLength: 100 }),
  name: Type.String({ minLength: 2, maxLength: 50 })
});
export type RegisterBody = Static<typeof RegisterBodySchema>;

export const LoginBodySchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 1 })
});
export type LoginBody = Static<typeof LoginBodySchema>;

export const RefreshBodySchema = Type.Object({
  refreshToken: Type.Optional(Type.String())
});
export type RefreshBody = Static<typeof RefreshBodySchema>;

export const SearchQuerySchema = Type.Object({
  q: Type.String({ minLength: 1, maxLength: 300 }),
  type: Type.Optional(Type.Union([
    Type.Literal('all'),
    Type.Literal('video'),
    Type.Literal('paper'),
    Type.Literal('web')
  ], { default: 'all' })),
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 30 })),
  dateRange: Type.Optional(Type.Union([
    Type.Literal('all'),
    Type.Literal('day'),
    Type.Literal('week'),
    Type.Literal('month'),
    Type.Literal('year')
  ])),
  duration: Type.Optional(Type.Union([
    Type.Literal('any'),
    Type.Literal('short'),
    Type.Literal('medium'),
    Type.Literal('long')
  ])),
  openAccessOnly: Type.Optional(Type.Boolean()),
  sortBy: Type.Optional(Type.Union([
    Type.Literal('relevance'),
    Type.Literal('date'),
    Type.Literal('citations')
  ]))
});
export type SearchQueryDto = Static<typeof SearchQuerySchema>;

export const VideoSegmentsQuerySchema = Type.Object({
  q: Type.Optional(Type.String({ maxLength: 300 }))
});
export type VideoSegmentsQueryDto = Static<typeof VideoSegmentsQuerySchema>;

export const VideoIdParamsSchema = Type.Object({
  id: Type.String({ minLength: 1 })
});
export type VideoIdParamsDto = Static<typeof VideoIdParamsSchema>;

export const PaperIdParamsSchema = Type.Object({
  id: Type.String({ minLength: 1 })
});
export type PaperIdParamsDto = Static<typeof PaperIdParamsSchema>;

export const ReaderViewQuerySchema = Type.Object({
  url: Type.String({ minLength: 1 }),
  textStart: Type.Optional(Type.String()),
  textEnd: Type.Optional(Type.String()),
  prefix: Type.Optional(Type.String()),
  suffix: Type.Optional(Type.String())
});
export type ReaderViewQueryDto = Static<typeof ReaderViewQuerySchema>;

export const IngestVideoSchema = Type.Object({
  youtubeUrlOrId: Type.String({ minLength: 3 }),
  title: Type.Optional(Type.String()),
  channel: Type.Optional(Type.String())
});
export type IngestVideoDto = Static<typeof IngestVideoSchema>;

export const IngestUrlSchema = Type.Object({
  url: Type.String({ minLength: 5 }),
  title: Type.Optional(Type.String())
});
export type IngestUrlDto = Static<typeof IngestUrlSchema>;

export const CreateBookmarkSchema = Type.Object({
  type: Type.Union([Type.Literal('video'), Type.Literal('paper'), Type.Literal('web')]),
  title: Type.String({ minLength: 1 }),
  targetId: Type.String({ minLength: 1 }),
  targetUrl: Type.String({ minLength: 1 }),
  timestampSec: Type.Optional(Type.Number()),
  snippet: Type.Optional(Type.String()),
  note: Type.Optional(Type.String()),
  folderId: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String()))
});
export type CreateBookmarkDto = Static<typeof CreateBookmarkSchema>;

export const BookmarkQuerySchema = Type.Object({
  type: Type.Optional(Type.Union([Type.Literal('video'), Type.Literal('paper'), Type.Literal('web')])),
  folderId: Type.Optional(Type.String()),
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 50 }))
});
export type BookmarkQueryDto = Static<typeof BookmarkQuerySchema>;

export const CreateFolderSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 50 }),
  color: Type.Optional(Type.String())
});
export type CreateFolderDto = Static<typeof CreateFolderSchema>;

export const CreateNoteSchema = Type.Object({
  bookmarkId: Type.Optional(Type.String()),
  title: Type.String({ minLength: 1, maxLength: 100 }),
  content: Type.String({ minLength: 1 })
});
export type CreateNoteDto = Static<typeof CreateNoteSchema>;
