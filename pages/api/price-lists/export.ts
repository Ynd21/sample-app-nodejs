import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';

export default async function exportPriceLists(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);

        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { accessToken, storeHash } = await getSession(req);
        const bigcommerce = bigcommerceClient(accessToken, storeHash, 'v3');

        const response = await bigcommerce.get('/pricelists');
        const priceLists = response.data.data;

        // Convert price lists to CSV
        const csvContent = [
            ['ID', 'Name', 'Active', 'Date Created', 'Date Modified'],
            ...priceLists.map(list => [
                list.id,
                list.name,
                list.active ? 'Yes' : 'No',
                new Date(list.date_created).toLocaleDateString(),
                new Date(list.date_modified).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=price_lists.csv');
        res.status(200).send(csvContent);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}