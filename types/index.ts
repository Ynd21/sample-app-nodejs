export * from './auth';
export * from './data';
export * from './db';
export * from './error';
export * from './order';

export interface CouponTableItem {
    id: number;
    name: string;
    redemption_type: string;
    current_uses: number;
    max_uses: number | null;
    start_date: string;
    end_date: string | null;
    status: string;
}

export enum PromotionRedemptionType {
    coupon = 'coupon',
    automatic = 'automatic'
}
