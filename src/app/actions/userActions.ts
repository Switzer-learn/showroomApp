'use server';

import { getUserLevel } from '@/app/utils/api-server';

export async function getUserLevelAction(userId: string) {
    return await getUserLevel(userId);
}