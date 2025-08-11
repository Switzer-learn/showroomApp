'use server';

import { getMonthlySalesData, getAnalyticsData } from '@/app/utils/api-server';

export async function getMonthlySalesDataAction(timeFrame: 'week' | 'month' | 'year') {
    return await getMonthlySalesData(timeFrame);
}

export async function getAnalyticsDataAction() {
    return await getAnalyticsData();
}