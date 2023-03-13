import { getModelForClass } from "@typegoose/typegoose";
import { IUser } from "./user.model";

export const User = getModelForClass(IUser);
export type UserType = typeof User;