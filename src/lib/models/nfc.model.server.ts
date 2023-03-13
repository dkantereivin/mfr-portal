import { getModelForClass } from "@typegoose/typegoose";
import { INfcTag } from "./nfc.model";

export const NfcTag = getModelForClass(INfcTag);
export type NfcTagType = typeof NfcTag;