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
