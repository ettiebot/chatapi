import { youChatHistory } from './youchat.js';
import z from 'zod';

export const youChatReqPayload = z.object({
  text: z.string(),
  history: youChatHistory.default([]),
  chatId: z.string().uuid().optional(),
  searchResCount: z.number().min(0).max(5).default(3),
  safeSearch: z.boolean().default(false),
  parseApps: z.boolean().default(true),
});

export type YouChatReqPayload = z.infer<typeof youChatReqPayload>;

export const youChatGetAppDataPayload = z.object({
  text: z.string(),
  appName: z.string(),
  parseApps: z.boolean().default(true),
});

export type YouChatGetAppDataPayload = z.infer<typeof youChatGetAppDataPayload>;

export const youChatGetSearchResultsPayload = z.object({
  text: z.string(),
  searchResCount: z.number().min(1).max(10).default(1),
  safeSearch: z.boolean().default(false),
});

export type YouChatGetSearchResultsPayload = z.infer<
  typeof youChatGetSearchResultsPayload
>;
