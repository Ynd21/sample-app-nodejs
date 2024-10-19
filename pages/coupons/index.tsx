import { Box, Button, Checkbox, Flex, Panel, Link as StyledLink, Table, TableSortDirection, Text } from '@bigcommerce/big-design';
import { AddIcon, DeleteIcon, GetAppIcon } from '@bigcommerce/big-design-icons';
import Link from 'next/link';
import { useState } from 'react';
import ErrorMessage from '../../components/error';
import Loading from '../../components/loading';
import { useCouponList } from '../../lib/hooks';
import { CouponTableItem } from '../../types';

const Coupons = () => {
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [columnHash, setColumnHash] = useState('');
    const [direction, setDirection] = useState<TableSortDirection>('ASC');
    const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);

    const { error, isLoading, list = [], meta = {}, mutateList } = useCouponList({
        page: String(currentPage),
        limit: String(itemsPerPage),
        ...(columnHash && { sort: columnHash }),
        ...(columnHash && { direction: direction.toLowerCase() }),
    });

    const itemsPerPageOptions = [10, 20, 50, 100];
    const tableItems: CouponTableItem[] = list.map(({ id, code, amount, type, date_created }) => ({
        id,
        code,
        amount,
        type,
        date_created,
    }));

    const onItemsPerPageChange = (newRange: number) => {
        setCurrentPage(1);
        setItemsPerPage(newRange);
    };

    const onSort = (newColumnHash: string, newDirection: TableSortDirection) => {
        setColumnHash(newColumnHash);
        setDirection(newDirection);
    };

    const handleCheckboxChange = (id: string) => {
        setSelectedCoupons(prev => 
            prev.includes(id) ? prev.filter(couponId => couponId !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = async () => {
        if (window.confirm('Are you sure you want to delete the selected coupons?')) {
            try {
                for (const id of selectedCoupons) {
                    await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
                }
                mutateList();
                setSelectedCoupons([]);
                alert('Selected coupons deleted successfully!');
            } catch (error) {
                console.error('Error deleting coupons:', error);
                alert('Error deleting coupons. Please try again.');
            }
        }
    };

    const renderName = (name: string) => <Text>{name}</Text>;
    const renderRedemptionType = (type: string) => <Text>{type}</Text>;
    const renderUses = (current: number, max: number | null) => (
        <Text>{`${current} / ${max === null ? '∞' : max}`}</Text>
    );
    const renderDate = (date: string) => <Text>{new Date(date).toLocaleDateString()}</Text>;
    const renderStatus = (status: string) => <Text>{status}</Text>;

    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

    return (
        <Panel header="Coupons">
            <Flex justifyContent="space-between" marginBottom="medium">
                <Box>
                    <Link href="/">
                        <StyledLink>{'<- Back to Dashboard'}</StyledLink>
                    </Link>
                </Box>
                <Box>
                    <Button iconLeft={<GetAppIcon />} variant="secondary" marginRight="small">
                        Export Coupons
                    </Button>
                    <Button iconLeft={<AddIcon />} variant="secondary" marginRight="small">
                        Generate Coupons
                    </Button>
                    <Button 
                        iconLeft={<DeleteIcon />} 
                        onClick={handleDeleteSelected}
                        disabled={selectedCoupons.length === 0}
                    >
                        Delete Selected
                    </Button>
                </Box>
            </Flex>
            <Table
                columns={[
                    { 
                        header: 'Select',
                        hash: 'select',
                        render: ({ id }) => (
                            <Checkbox
                                label=""
                                checked={selectedCoupons.includes(id.toString())}
                                onChange={() => handleCheckboxChange(id.toString())}
                            />
                        ),
                    },
                    { header: 'Name', hash: 'name', render: ({ name }) => renderName(name), isSortable: true },
                    { header: 'Type', hash: 'redemption_type', render: ({ redemption_type }) => renderRedemptionType(redemption_type), isSortable: true },
                    { header: 'Uses', hash: 'uses', render: ({ current_uses, max_uses }) => renderUses(current_uses, max_uses), isSortable: true },
                    { header: 'Start Date', hash: 'start_date', render: ({ start_date }) => renderDate(start_date), isSortable: true },
                    { header: 'End Date', hash: 'end_date', render: ({ end_date }) => renderDate(end_date || 'No end date'), isSortable: true },
                    { header: 'Status', hash: 'status', render: ({ status }) => renderStatus(status), isSortable: true },
                ]}
                items={tableItems}
                itemName="Coupons"
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

export default Coupons;
