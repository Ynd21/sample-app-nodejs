import { Button, Checkbox, Panel, Table, TableSortDirection } from '@bigcommerce/big-design';
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
    const tableItems: CouponTableItem[] = list.map(({ id, code, current_uses, max_uses, date_created }) => ({
        id,
        code,
        current_uses,
        max_uses,
        date_created,
    }));

    const onItemsPerPageChange = (newRange) => {
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
        try {
            for (const id of selectedCoupons) {
                await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
            }
            mutateList();
            setSelectedCoupons([]);
        } catch (error) {
            console.error('Error deleting coupons:', error);
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

    return (
        <Panel header="Coupons">
            <Button
                marginBottom="medium"
                onClick={handleDeleteSelected}
                disabled={selectedCoupons.length === 0}
            >
                Delete Selected
            </Button>
            <Table
                columns={[
                    { 
                        header: 'Select',
                        hash: 'select',
                        render: ({ id }) => (
                            <Checkbox
                                label=""
                                checked={selectedCoupons.includes(id)}
                                onChange={() => handleCheckboxChange(id)}
                            />
                        ),
                    },
                    { header: 'Code', hash: 'code', render: ({ code }) => code, isSortable: true },
                    { header: 'Current Uses', hash: 'current_uses', render: ({ current_uses }) => current_uses, isSortable: true },
                    { header: 'Max Uses', hash: 'max_uses', render: ({ max_uses }) => max_uses, isSortable: true },
                    { header: 'Created Date', hash: 'date_created', render: ({ date_created }) => new Date(date_created).toLocaleDateString(), isSortable: true },
                ]}
                items={tableItems}
                itemName="Coupons"
                pagination={{
                    currentPage,
                    totalItems: meta?.pagination?.total,
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
