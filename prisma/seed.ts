import { faker } from '@faker-js/faker';
import { Prisma, PrismaClient, Role, LeadershipDepartment, User, Attendance, AttendanceCode } from '@prisma/client'
import { parse } from 'yaml';
import { readFileSync } from 'fs';
import _ from 'lodash';
const crypto = require('crypto');

export const randomString = (length: number): string => {
    const arr = new Uint8Array(length / 2);
    crypto.getRandomValues(arr);
    return Array.from(arr, (dec) => dec.toString(16).padStart(2, '0')).join('')
}

const prisma = new PrismaClient();

const rawQueries: any[] = [];

type StaticContent = {
    users: Prisma.UserCreateInput[];
    codes: Prisma.AttendanceCodeCreateInput[];

    nfcTags: Prisma.NfcTagCreateInput[];
}

const staticContent: StaticContent = parse(readFileSync('prisma/seed.yaml', 'utf8'));

export const seed = async () => {
    await prisma.$connect();
    rawQueries.forEach((query) => prisma.$executeRaw(query));

    const users = await seedUsers(100);
    console.log(`Seeded ${users.length} users`);

    const codes = await seedAttendanceCodes(10, users);
    console.log(`Seeded ${codes.length} attendance codes`);

    const tags = await seedNFCTags();
    console.log(`Seeded ${tags.length} NFC tags`);
}

export const seedUsers = async (randomCnt: number) => {
    const user: () => Prisma.UserCreateInput = () => ({
        googleId: faker.datatype.bigInt().toString(),
        contId: 'CONT-' + faker.datatype.number({min: 1000, max: 999999}),
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        role: _.sample([Role.MEMBER, Role.APPRENTICE, Role.CORPORAL, Role.SERGEANT]),
        dept: LeadershipDepartment.ALL,
        refreshToken: faker.datatype.uuid(),
    });

    const randomUsers = Array.from({length: randomCnt}, user);
    const staticUsers = staticContent.users;

    await prisma.user.createMany({
        data: [...randomUsers, ...staticUsers]
    })

    return prisma.user.findMany();
}

export const seedAttendanceCodes = async (randomCnt: number, users: User[]) => {
    const code: () => Prisma.AttendanceCodeCreateInput = () => {
        const user = _.sample(users.filter(u => u.role === Role.CORPORAL));
        return {
            code: randomString(6),
            expiresAt: faker.date.future(),
            officerId: user!.id
        }
    }

    const randomCodes = Array.from({length: randomCnt}, code);
    const staticCodes = staticContent.codes;

    await prisma.attendanceCode.createMany({
        data: [...randomCodes, ...staticCodes]
    })

    return prisma.attendanceCode.findMany();
}

export const seedAttendance = async (randomCnt: number, codes: AttendanceCode[], users: User[]) => {
    const attendance: () => Prisma.AttendanceCreateManyInput = () => {
        const code = _.sample(codes);
        if (!code) throw new Error("No codes to seed attendance with");
        return {
            code: code.code,
            time: faker.date.past(),
            userId: code.officerId,
            user: {
                connect: {
                    id: (_.sample(users))!.id
                }
            }
        }
    }

    const randomAttendance = Array.from({length: randomCnt}, attendance);

    await prisma.attendance.createMany({
        data: [...randomAttendance]
    })

    return prisma.attendance.findMany();
}

export const seedNFCTags = async () => {
    const tags = staticContent.nfcTags;
    await prisma.nfcTag.createMany({
        data: tags
    });
    return prisma.nfcTag.findMany()
}


seed()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
