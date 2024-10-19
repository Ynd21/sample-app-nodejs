import { Box, Button, Checkbox, Flex, Input, Panel, Link as StyledLink, Switch, Table, TableSortDirection, Text } from '@bigcommerce/big-design';
import { AddIcon, DeleteIcon, GetAppIcon, SearchIcon } from '@bigcommerce/big-design-icons';
import Link from 'next/link';
import { useState } from 'react';
import ErrorMessage from '../../components/error';
import Loading from '../../components/loading';
import { usePromotionList } from '../../lib/hooks';

const Promotions = () => {
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [columnHash, setColumnHash] = useState('');
    const [direction, setDirection] = useState<TableSortDirection>('ASC');
    const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const { error, isLoading, list = [], meta = {}, mutateList } = usePromotionList({
        page: String(currentPage),
        limit: String(itemsPerPage),
        ...(columnHash && { sort: columnHash }),
        ...(columnHash && { direction: direction.toLowerCase() }),
    });

    const itemsPerPageOptions = [10, 20, 50, 100];

    const onItemsPerPageChange = (newRange: number) => {
        setCurrentPage(1);
        setItemsPerPage(newRange);
    };

    const onSort = (newColumnHash: string, newDirection: TableSortDirection) => {
        setColumnHash(newColumnHash);
        setDirection(newDirection);
    };

    const handleCheckboxChange = (id: string) => {
        setSelectedPromotions(prev => 
            prev.includes(id) ? prev.filter(promotionId => promotionId !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = async () => {
        if (window.confirm('Are you sure you want to delete the selected promotions?')) {
            try {
                for (const id of selectedPromotions) {
                    await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
                }
                mutateList();
                setSelectedPromotions([]);
                alert('Selected promotions deleted successfully!');
            } catch (error) {
                console.error('Error deleting promotions:', error);
                alert('Error deleting promotions. Please try again.');
            }
        }
    };

    const renderName = (name: string) => <Text>{name}</Text>;
    const renderRedemptionType = (type: string) => <Text>{type}</Text>;
    const renderUses = (current: number, max: number | null) => (
        <Text>{`${current} / ${max === null ? '∞' : max}`}</Text>
    );
    const renderDate = (date: string) => <Text>{new Date(date).toLocaleDateString()}</Text>;
    const renderStatus = (status: string, id: string | number) => (
        <Switch
            checked={status === 'ENABLED'}
            onChange={() => handleStatusChange(id, status)}
        />
    );

    const handleStatusChange = async (id: string | number, currentStatus: string) => {
        try {
            await fetch(`/api/coupons/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: currentStatus === 'ENABLED' ? 'DISABLED' : 'ENABLED' })
            });
            mutateList();
        } catch (error) {
            console.error('Error updating promotion status:', error);
            alert('Error updating promotion status. Please try again.');
        }
    };

    const filteredList = list.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

    return (
        <Panel header="Promotions">
            <Flex justifyContent="space-between" marginBottom="medium">
                <Box>
                    <Link href="/">
                        <StyledLink>{'<- Back to Dashboard'}</StyledLink>
                    </Link>
                </Box>
                <Box>
                    <Button iconLeft={<GetAppIcon />} variant="secondary" marginRight="small">
                        Export Promotions
                    </Button>
                    <Button iconLeft={<AddIcon />} variant="secondary" marginRight="small">
                        Create Promotion
                    </Button>
                    <Button 
                        iconLeft={<DeleteIcon />} 
                        onClick={handleDeleteSelected}
                        disabled={selectedPromotions.length === 0}
                    >
                        Delete Selected
                    </Button>
                </Box>
            </Flex>
            <Flex marginBottom="medium">
                <Input
                    iconLeft={<SearchIcon />}
                    placeholder="Search promotions"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </Flex>
            <Table
                columns={[
                    { 
                        header: 'Select',
                        hash: 'select',
                        render: ({ id }) => (
                            <Checkbox
                                label=""
                                checked={selectedPromotions.includes(id.toString())}
                                onChange={() => handleCheckboxChange(id.toString())}
                            />
                        ),
                    },
                    { header: 'Name', hash: 'name', render: ({ name }) => renderName(name), isSortable: true },
                    { header: 'Type', hash: 'redemption_type', render: ({ redemption_type }) => renderRedemptionType(redemption_type), isSortable: true },
                    { header: 'Uses', hash: 'uses', render: ({ current_uses, max_uses }) => renderUses(current_uses, max_uses), isSortable: true },
                    { header: 'Start Date', hash: 'start_date', render: ({ start_date }) => renderDate(start_date), isSortable: true },
                    { header: 'End Date', hash: 'end_date', render: ({ end_date }) => renderDate(end_date || 'No end date'), isSortable: true },
                    { header: 'Status', hash: 'status', render: ({ status, id }) => renderStatus(status, id), isSortable: true },
                ]}
                items={filteredList}
                itemName="Promotions"
                pagination={{
                    currentPage,
                    totalItems: meta?.pagination?.total || list.length,
                    onPageChange: setCurrentPage,
                    itemsPerPageOptions,
                    onItemsPerPageChange,
                    itemsPerPage,
                }}
                sortable={{
                    columnHash,
                    direction,
                    onSort,
                }}
                stickyHeader
            />
        </Panel>
    );
};

export default Promotions;
