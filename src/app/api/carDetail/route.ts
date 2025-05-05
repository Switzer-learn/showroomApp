import { NextResponse } from 'next/server';
import { getAllCarDetail } from '@/app/lib/dbFunction';

export async function GET() {
  try {
    const cars = await getAllCarDetail();
    
    if (!cars) {
      return NextResponse.json({ error: 'Failed to fetch car data' }, { status: 500 });
    }
    
    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error in car detail API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
