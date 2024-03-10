import { z } from 'zod';

import { isZodSchemaType, type EnumTypeOf } from 'util/index';

export const MessageType = {
	SYNC_UPDATE: 'sync update',
} as const;
export type MessageType = EnumTypeOf<typeof MessageType>;

const baseMessageSchema = z.object({
	type: z.nativeEnum(MessageType),
});

const syncUpdateMessageSchema = baseMessageSchema.extend({
	data: z.string(),
});

const messageSchema = syncUpdateMessageSchema;

export type Message = z.infer<typeof messageSchema>;

export const isMessage = isZodSchemaType(messageSchema);
