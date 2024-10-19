import { Box, Button, Flex, Panel, Table, TableSortDirection, Text } from '@bigcommerce/big-design';
import { AddIcon, DeleteIcon, GetAppIcon } from '@bigcommerce/big-design-icons';
import Link from 'next/link';
import { useState } from 'react';
import ErrorMessage from '../../components/error';
import Loading from '../../components/loading';
import { usePriceLists } from '../../lib/hooks';

const PriceLists = () => {
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [columnHash, setColumnHash] = useState('');
    const [direction, setDirection] = useState<TableSortDirection>('ASC');

    const { error, isLoading, priceLists } = usePriceLists({
        page: String(currentPage),
        limit: String(itemsPerPage),
        ...(columnHash && { sort: columnHash }),
        ...(columnHash && { direction: direction.toLowerCase() }),
    });

    const handleCreatePriceList = () => {
        // Implement create price list functionality
    };

    const handleExportPriceLists = () => {
        // Implement export price lists functionality
    };

    const handleImportPriceLists = () => {
        // Implement import price lists functionality
    };

    const handleDeleteSelected = () => {
        // Implement delete selected price lists functionality
    };

    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

    return (
        <Panel header="Price Lists">
            <Flex justifyContent="space-between" marginBottom="medium">
                <Box>
                    <Link href="/">
                        <a>{'<- Back to Dashboard'}</a>
                    </Link>
                </Box>
                <Box>
                    <Button iconLeft={<GetAppIcon />} variant="secondary" marginRight="small" onClick={handleExportPriceLists}>
                        Export Price Lists
                    </Button>
                    <Button iconLeft={<AddIcon />} variant="secondary" marginRight="small" onClick={handleImportPriceLists}>
                        Import Price Lists
                    </Button>
                    <Button iconLeft={<AddIcon />} variant="primary" marginRight="small" onClick={handleCreatePriceList}>
                        Create Price List
                    </Button>
                    <Button 
                        iconLeft={<DeleteIcon />} 
                        variant="primary" 
                        onClick={handleDeleteSelected}
                        style={{ backgroundColor: 'red', borderColor: 'red' }}
                    >
                        Delete Selected
                    </Button>
                </Box>
            </Flex>
            <Table
                columns={[
                    { header: 'Name', hash: 'name', render: ({ name }) => <Text>{name}</Text>, isSortable: true },
                    { header: 'Active', hash: 'active', render: ({ active }) => <Text>{active ? 'Yes' : 'No'}</Text>, isSortable: true },
                    { header: 'Date Created', hash: 'date_created', render: ({ date_created }) => <Text>{new Date(date_created).toLocaleDateString()}</Text>, isSortable: true },
                    { header: 'Date Modified', hash: 'date_modified', render: ({ date_modified }) => <Text>{new Date(date_modified).toLocaleDateString()}</Text>, isSortable: true },
                ]}
                items={priceLists}
                itemName="Price Lists"
                pagination={{
                    currentPage,
                    totalItems: priceLists.length,
                    onPageChange: setCurrentPage,
                    itemsPerPageOptions: [10, 20, 50, 100],
                    onItemsPerPageChange: setItemsPerPage,
                    itemsPerPage,
                }}
                sortable={{
                    columnHash,
                    direction,
                    onSort: (newColumnHash, newDirection) => {
                        setColumnHash(newColumnHash);
                        setDirection(newDirection);
                    },
                }}
                stickyHeader
            />
        </Panel>
    );
};

export default PriceLists;
