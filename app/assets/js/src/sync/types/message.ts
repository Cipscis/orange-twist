import * as z from 'zod/mini';

import { isZodSchemaType, type EnumTypeOf } from 'utils';

export const MessageType = {
	SYNC_UPDATE: 'sync update',
} as const;
export type MessageType = EnumTypeOf<typeof MessageType>;

const baseMessageSchema = z.object({
	type: z.nativeEnum(MessageType),
});

const syncUpdateMessageSchema = z.extend(
	baseMessageSchema,
	{
		type: z.literal(MessageType.SYNC_UPDATE),
	},
);

const messageSchema = syncUpdateMessageSchema;

export type Message = z.infer<typeof messageSchema>;

export const isMessage = isZodSchemaType(messageSchema);
