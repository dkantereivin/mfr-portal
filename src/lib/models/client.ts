import type { Document, ObjectId } from 'mongoose';

export * from './nfc.model';
export * from './user.model';
export * from './attendance.model';

export const docToSerializableJSON = (doc: Document) => {
	const json = doc.toObject();
	json._id = (json._id as ObjectId).toString();
	return json;
};

export const jsonSanitize = (obj: any) => JSON.parse(JSON.stringify(obj));
