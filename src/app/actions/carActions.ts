'use server';

import { deleteCarById, insertCarData } from '@/app/utils/api-server';

export async function deleteCarByIdAction(carId: string) {
    return await deleteCarById(carId);
}

export async function insertCarAction(formData: any, imageFile: File | null) {
    return await insertCarData(formData, imageFile);
}