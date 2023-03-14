import { localTime } from '$lib/utils/dates';
import { IUser } from './user.model';
import { prop, type Ref } from '@typegoose/typegoose';
import { INfcTag } from './nfc.model';
import { randomString } from '$lib/utils/misc';

class AttendanceAuthorization {
	@prop({ ref: () => IUser })
	officer?: Ref<IUser>;

	@prop({ ref: () => IAttendanceCode })
	code?: Ref<IAttendanceCode>;

	@prop({ ref: () => INfcTag })
	nfc?: Ref<INfcTag>;
}

export class Attendance {
	@prop({ required: true, type: Date, default: Date.now })
	timestamp!: Date;

	@prop({ required: true, type: String, enum: ['manual', 'code', 'nfc'] })
	method!: 'manual' | 'code' | 'nfc';

	@prop({ required: true, type: AttendanceAuthorization, _id: false })
	authorization!: AttendanceAuthorization;

	@prop({ required: true, type: Boolean, default: false })
	finalized!: boolean;

	// async generateDescription() {
	//     switch (this.method) {
	//         case "manual":
	//             const officer = await User.findById(this.authorization.officer);
	//             return `Manually added by ${officer?.firstName} ${officer?.lastName}.`;
	//         case "code":
	//             const code = await AttendanceCode.findById(this.authorization.code);
	//             const codeCreator = await User.findById(code?.creator);
	//             return `Checked in at ${parseUtc(this.timestamp).format()} using code ${code?.code} created by ${codeCreator?.firstName} ${codeCreator?.lastName}.`;
	//         case "nfc":
	//             const nfc = await NfcTag.findById(this.authorization.nfc);
	//             return `Checked in at ${parseUtc(this.timestamp).format()} using NFC tag ${nfc?.name}.`
	//     }
	// }
}

export class IAttendanceCode {
	@prop({ required: true, type: String, index: true, default: () => randomString(32) })
	code!: string;

	@prop({ required: true, ref: () => 'IUser' })
	creator!: Ref<IUser>;

	@prop({ required: true, type: Date, default: () => localTime().endOf('day').toDate() })
	validUntil!: Date;

	@prop({ required: true, type: Date, default: Date.now })
	createdAt!: Date;
}
