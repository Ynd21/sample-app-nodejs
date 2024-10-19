export * from './auth';
export * from './data';
export * from './db';
export * from './error';
export * from './order';

export interface CouponTableItem {
    id: string;
    code: string;
    current_uses: number;
    max_uses: number;
    date_created: string;
}
