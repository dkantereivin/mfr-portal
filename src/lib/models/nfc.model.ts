import { prop } from '@typegoose/typegoose';

export enum TagActions {
	ATTENDANCE = 'ATT'
}

export class INfcTag {
	@prop({ required: true, unique: true, type: String })
	uid!: string;

	@prop({ required: true, type: String })
	name!: string;

	@prop({ required: true, default: 0, type: Number })
	count!: number;

	@prop({ required: true, default: TagActions.ATTENDANCE, type: String, enum: TagActions })
	action!: TagActions;

	@prop({ required: true, type: String })
	versionCode!: string;

	@prop({ required: false, type: String })
	description?: string;
}
