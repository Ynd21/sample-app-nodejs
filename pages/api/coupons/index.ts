import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';

export default async function promotions(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method === 'GET') {
        try {
            const { accessToken, storeHash } = await getSession(req);
            const bigcommerce = bigcommerceClient(accessToken, storeHash, 'v3');

            const response = await bigcommerce.get('/promotions');

            const formattedPromotions = response.data.map(promotion => ({
                id: promotion.id,
                name: promotion.name,
                redemption_type: promotion.redemption_type,
                current_uses: promotion.current_uses,
                max_uses: promotion.max_uses,
                start_date: promotion.start_date,
                end_date: promotion.end_date,
                status: promotion.status
            }));

            res.status(200).json({
                data: formattedPromotions,
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
