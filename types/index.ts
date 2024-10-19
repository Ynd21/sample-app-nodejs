export * from './auth';
export * from './data';
export * from './db';
export * from './error';
export * from './order';

export interface CouponTableItem {
    id: string;
    code: string;
    amount: number;
    type: string;
    date_created: string;
}

export enum PromotionRedemptionType {
    coupon = 'coupon',
    automatic = 'automatic'
}
