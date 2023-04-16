import { prop, PropType, Ref } from "@typegoose/typegoose";
import type mongoose from "mongoose";
import { IUser } from "./user.model";

export class EventMember {
    @prop({ref: () => IUser})
    user!: Ref<IUser>;

    @prop({required: true, type: String, default: 'MFR'})
    role!: string;
}

export class IEvent {
    _id?: mongoose.Types.ObjectId;

    @prop( { required: true, type: String } )
    hash!: string;

    @prop({ required: true, type: String, index: true})
    eventNumber!: string; // event number

    @prop({ required: true, type: String, index: true})
    name!: string;

    @prop({ required: true, type: Date})
    date!: Date;

    @prop({ required: false, type: String})
    meetAtUnitTime?: string;

    @prop({ required: false, type: String})
    meetAtEventTime?: string;

    @prop({ required: false, type: String})
    endTime?: string;

    @prop({ required: false, type: String})
    location?: string;

    @prop({ required: true, type: Boolean})
    isValid!: boolean;

    @prop({ required: true, type: () => [EventMember], default: []}, PropType.ARRAY)
    members!: mongoose.Types.Array<EventMember>;
}