import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';

export default async function coupons(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { accessToken, storeHash } = await getSession(req);
        const bigcommerce = bigcommerceClient(accessToken, storeHash, 'v2');

        console.log('Sending request to BigCommerce API: GET /coupons');
        const response = await bigcommerce.get('/coupons');
        
        console.log('Response from BigCommerce API:', JSON.stringify(response, null, 2));

        if (!response || !response.data) {
            throw new Error('Invalid response from BigCommerce API');
        }

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ message: 'An error occurred while fetching coupons', error: error.message });
    }
}
