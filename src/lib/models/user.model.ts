import { getModelForClass, prop, PropType } from "@typegoose/typegoose";
import type mongoose from "mongoose";
import { Attendance } from "./attendance.model";

export enum Role {
    NONE = 'None',
    APPRENTICE = 'Apprentice',
    MEMBER = 'Member',
    CORPORAL = 'Corporal',
    SERGEANT = 'Sergeant',
    DEPUTY_CHIEF = 'Deputy Chief',
    UNIT_CHIEF = 'Unit Chief',
    SUPER_ADMIN = 'Super Admin',
}
  
export enum LeadershipDepartment {
    NONE = 'None',
    TRAINING = 'Training',
    OPERATIONS = 'Operations',
    ADMINISTRATION = 'Administration',
    ALL = 'All'
}

class GoogleOAuth {
    @prop({required: true, type: String})
    id!: string;

    @prop({required: true, type: String})
    refreshToken!: string;
}

export class IUser {
    _id?: mongoose.Types.ObjectId;

    @prop({required: true, type: String})
    firstName!: string;

    @prop({required: false, type: String})
    preferredName?: string;

    @prop({required: true, type: String})
    lastName!: string;

    @prop({required: true, unique: true, type: String})
    email!: string;

    @prop({require: false, type: String})
    contId?: string;

    @prop({required: false, _id: false, type: GoogleOAuth, select: false})
    google?: GoogleOAuth;

    @prop({required: true, default: Role.NONE, type: String, enum: Role})
    role!: Role;

    @prop({required: true, default: LeadershipDepartment.NONE, type: String, enum: LeadershipDepartment})
    dept!: LeadershipDepartment;

    @prop({required: true, type: () => [Attendance], default: [], select: false}, PropType.ARRAY)
    attendance!: mongoose.Types.Array<Attendance>;
}

export const User = getModelForClass(IUser);