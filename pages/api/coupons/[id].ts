import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';

export default async function coupon(req: NextApiRequest, res: NextApiResponse) {
    const {
        query: { id },
        method,
    } = req;

    switch (method) {
        case 'DELETE':
            try {
                const { accessToken, storeHash } = await getSession(req);
                const bigcommerce = bigcommerceClient(accessToken, storeHash, 'v2');

                await bigcommerce.delete(`/v2/coupons/${id}`);
                res.status(204).end();
            } catch (error) {
                const { message, response } = error;
                res.status(response?.status || 500).json({ message });
            }
            break;
        default:
            res.setHeader('Allow', ['DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
