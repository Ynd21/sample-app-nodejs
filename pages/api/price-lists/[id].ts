import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';

export default async function priceList(req: NextApiRequest, res: NextApiResponse) {
    const { query: { id }, method } = req;
    const { accessToken, storeHash } = await getSession(req);
    const bigcommerce = bigcommerceClient(accessToken, storeHash, 'v3');

    switch (method) {
        case 'GET':
            try {
                const response = await bigcommerce.get(`/pricelists/${id}`);
                res.status(200).json(response.data);
            } catch (error) {
                res.status(error.status || 500).json({ message: error.message });
            }
            break;
        case 'PUT':
            try {
                const response = await bigcommerce.put(`/pricelists/${id}`, req.body);
                res.status(200).json(response.data);
            } catch (error) {
                res.status(error.status || 500).json({ message: error.message });
            }
            break;
        case 'DELETE':
            try {
                await bigcommerce.delete(`/pricelists/${id}`);
                res.status(204).end();
            } catch (error) {
                res.status(error.status || 500).json({ message: error.message });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}