import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';

export default async function coupons(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method === 'GET') {
        try {
            const { accessToken, storeHash } = await getSession(req);
            const bigcommerce = bigcommerceClient(accessToken, storeHash, 'v2');

            const response = await bigcommerce.get('/coupons');

            const formattedCoupons = response.data.map(coupon => ({
                id: coupon.id,
                code: coupon.code,
                amount: coupon.amount,
                type: coupon.type,
                date_created: coupon.date_created
            }));

            res.status(200).json({
                data: formattedCoupons,
                meta: response.meta
            });
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
}
