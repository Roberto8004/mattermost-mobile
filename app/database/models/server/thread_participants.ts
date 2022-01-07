// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Relation} from '@nozbe/watermelondb';
import {field, immutableRelation} from '@nozbe/watermelondb/decorators';
import Model, {Associations} from '@nozbe/watermelondb/Model';

import {MM_TABLES} from '@constants/database';

import type ThreadModel from '@typings/database/models/servers/thread';
import type UserModel from '@typings/database/models/servers/user';

const {THREAD, THREAD_PARTICIPANTS, USER} = MM_TABLES.SERVER;

/**
 * The Thread Participants model contains participants data of a thread.
 */
export default class ThreadParticipantsModel extends Model {
    /** table (name) : ThreadParticipants */
    static table = THREAD_PARTICIPANTS;

    /** associations : Describes every relationship to this table. */
    static associations: Associations = {

        /** A THREAD can have multiple PARTICIPANTS. (relationship is 1:N) */
        [THREAD]: {type: 'belongs_to', key: 'thread_id'},

        /** A USER can participate in multiple THREADS. (relationship is 1:N) */
        [USER]: {type: 'belongs_to', key: 'user_id'},
    };

    /** thread_id : thread id to which participant belong to. */
    @field('thread_id') threadId!: string;

    /** user_id : user id of the participant. */
    @field('user_id') userId!: number;

    /** thread : The related record to the Thread model */
    @immutableRelation(THREAD, 'thread_id') thread!: Relation<ThreadModel>;

    /** user : The related record to the User model */
    @immutableRelation(USER, 'user_id') user!: Relation<UserModel>;
}
