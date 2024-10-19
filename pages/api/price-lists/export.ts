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

        // First, get all price lists
        const priceListsResponse = await bigcommerce.get('/pricelists');
        const priceLists = priceListsResponse.data.data;

        let allRecords = [];

        // For each price list, fetch its records
        for (const priceList of priceLists) {
            const recordsResponse = await bigcommerce.get(`/pricelists/${priceList.id}/records`);
            const records = recordsResponse.data.data;
            allRecords = allRecords.concat(records.map(record => ({
                ...record,
                price_list_name: priceList.name
            })));
        }

        // Convert price list records to CSV
        const csvContent = [
            ['Price List Name', 'Currency', 'Product ID', 'Variant ID', 'Price', 'Sale Price', 'Retail Price', 'MAP Price'],
            ...allRecords.map(record => [
                record.price_list_name,
                record.currency,
                record.product_id,
                record.variant_id,
                record.price,
                record.sale_price,
                record.retail_price,
                record.map_price
            ])
        ].map(row => row.join(',')).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=price_list_records.csv');
        res.status(200).send(csvContent);
    } catch (error) {
        console.error('Error exporting price list records:', error);
        res.status(error.status || 500).json({ message: error.message });
    }
}
