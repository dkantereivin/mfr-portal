import type {RequestHandler} from '@sveltejs/kit';
import {error, redirect} from '@sveltejs/kit';
import {db} from '$lib/server/db';
import { LOGIN_REDIRECT_TO, standardCookie } from '$lib/utils/cookies';
import { NfcTag, TagActions } from '$lib/models/nfc.model';
import { Attendance, AttendanceCode } from '$lib/models';

export const GET = (async ({url, params, locals, cookies}) => {
    if (!locals.authenticated) {
        cookies.set(LOGIN_REDIRECT_TO, url.href, {
            ...standardCookie(),
            maxAge: 5 * 60
        });
        throw redirect(307, '/');
    }

    const uidRaw = url.searchParams.get('uid');
    if (!uidRaw) {
        throw error(400, 'Missing UID');
    }

    const [uid, counter] = uidRaw.split('x');
    const count = parseInt(counter, 16);

    const tag = await NfcTag.findOne({uid});

    if (!tag || count < tag.count || tag.versionCode !== params.versionCode) {
        throw error(403,
            'Invalid Tag. This tag might be expired or have incorrect information.' +
            'Please close this page and try to scan again.' +
            'If the problem persists, please contact the site administrator (david.kantereivin@sjacs.ca).'
        );
    }

    await db.nfcTag.update({
        where: {uid},
        data: {
            lastUsed: new Date(),
            count: count + 1
        }
    });

    switch (tag.action) {
        case TagActions.ATTENDANCE:
            await Attendance.appendToUser(locals.user!._id, <Attendance>{
                method: 'nfc',
                authorization: {
                    nfc: tag._id
                },
                timestamp: new Date()
            });
            throw redirect(307, '/attendance/success');
    }
}) satisfies RequestHandler;
