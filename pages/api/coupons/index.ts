import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';

export default async function coupons(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { accessToken, storeHash } = await getSession(req);
        const bigcommerce = bigcommerceClient(accessToken, storeHash);
        const { page, limit, sort, direction } = req.query;

        const params = new URLSearchParams();
        if (typeof page === 'string') params.append('page', page);
        if (typeof limit === 'string') params.append('limit', limit);
        if (typeof sort === 'string') params.append('sort', sort);
        if (typeof direction === 'string') params.append('direction', direction);

        const response = await bigcommerce.get(`/coupons?${params.toString()}`);
        res.status(200).json(response);
    } catch (error) {
        const { message, response } = error;
        res.status(response?.status || 500).json({ message });
    }
}
