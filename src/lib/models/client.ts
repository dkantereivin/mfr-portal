import type { Document } from 'mongoose';

export * from './nfc.model';
export * from './user.model';
export * from './attendance.model';

export const docToSerializableJSON = (doc: Document) => {
    const json = doc.toJSON();
    json._id = json._id.toString();
    return json;
}