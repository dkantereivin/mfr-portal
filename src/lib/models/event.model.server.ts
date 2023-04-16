import { getModelForClass } from "@typegoose/typegoose";
import { IEvent } from "./event.model";

export const Event = getModelForClass(IEvent);
export type EventTag = typeof Event;
