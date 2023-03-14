import { getModelForClass } from '@typegoose/typegoose';
import { IAttendanceCode } from './attendance.model';

export const AttendanceCode = getModelForClass(IAttendanceCode);
export type AttendanceCodeType = typeof AttendanceCode;
