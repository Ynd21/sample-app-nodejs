import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';

export default async function promotion(req: NextApiRequest, res: NextApiResponse) {
    const {
        query: { id },
        method,
    } = req;

    const { accessToken, storeHash } = await getSession(req);
    const bigcommerce = bigcommerceClient(accessToken, storeHash, 'v3');

    switch (method) {
        case 'DELETE':
            try {
                await bigcommerce.delete(`/promotions/${id}`);
                res.status(204).end();
            } catch (error) {
                const { message, response } = error;
                res.status(response?.status || 500).json({ message });
            }
            break;
        case 'PATCH':
            try {
                const { status } = req.body;
                await bigcommerce.put(`/promotions/${id}`, { status });
                res.status(200).json({ message: 'Status updated successfully' });
            } catch (error) {
                const { message, response } = error;
                res.status(response?.status || 500).json({ message });
            }
            break;
        default:
            res.setHeader('Allow', ['DELETE', 'PATCH']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}