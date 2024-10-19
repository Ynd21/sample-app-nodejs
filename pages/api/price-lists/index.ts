import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';

export default async function priceLists(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { accessToken, storeHash } = await getSession(req);
    const bigcommerce = bigcommerceClient(accessToken, storeHash, 'v3');

    switch (method) {
        case 'GET':
            try {
                const response = await bigcommerce.get('/pricelists');
                res.status(200).json(response.data);
            } catch (error) {
                console.error('Error fetching price lists:', error);
                res.status(error.status || 500).json({ message: error.message });
            }
            break;
        case 'POST':
            try {
                const response = await bigcommerce.post('/pricelists', req.body);
                res.status(201).json(response.data);
            } catch (error) {
                res.status(error.status || 500).json({ message: error.message });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
