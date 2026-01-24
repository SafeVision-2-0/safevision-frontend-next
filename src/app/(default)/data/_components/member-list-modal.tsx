import Form from '@/app/(default)/data/_components/form';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badges';
import { Table } from '@/components/application/table/table';
import { PaginationCardMinimal } from '@/components/application/pagination/pagination';
import { getPeople } from '@/lib/api/people';
import { formatDate } from '@/utils/format';
import useSWR from 'swr';
import { useState } from 'react';
import { SortDescriptor } from 'react-aria-components';

interface MemberListModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupChange?: (group: any) => void;
  groupType: string;
  group: { id: string; name: string };
}

export default function MemberListModal({
  isOpen,
  onOpenChange,
  onGroupChange,
  group,
  groupType,
}: MemberListModalProps) {
  const itemsPerPage = 7;
  const [page, setPage] = useState<number>(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'name',
    direction: 'ascending',
  });

  const { data, isLoading } = useSWR(
    isOpen && group ? ['people', page, itemsPerPage, groupType, group.id] : null,
    () =>
      getPeople(
        page,
        itemsPerPage,
        groupType === 'position' ? Number(group.id) : undefined,
        groupType === 'team' ? Number(group.id) : undefined,
      ),
  );

  const handleClose = () => {
    onOpenChange(false);
    onGroupChange && onGroupChange(null);
    setPage(1); // Reset page on close
  };

  return (
    <Form
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showCloseButton={false}
      fitWidth={true}
      title={`Member List - ${group?.name || ''}`}
      buttonLabel="Done"
      showSecondaryButton={false}
      onSave={handleClose}
    >
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Table
            aria-label="Members"
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
          >
            <Table.Header>
              <Table.Head id="name" label="Name" isRowHeader allowsSorting className="w-1/3" />
              <Table.Head id="gender" label="Gender" allowsSorting />
              <Table.Head id="birth" label="Birth" allowsSorting />
              <Table.Head id="position" label="Positions" />
              <Table.Head id="team" label="Teams" />
            </Table.Header>
            <Table.Body items={data?.data || []}>
              {(item) => (
                <Table.Row id={item.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={
                          item.profileImage
                            ? `${process.env.NEXT_PUBLIC_BASE_API_URL}${item.profileImage}`
                            : undefined
                        }
                        alt={item.name}
                        size="sm"
                      />
                      <p className="text-primary text-sm font-medium whitespace-nowrap">
                        {item.name}
                      </p>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="capitalize">
                    {item.gender === 'M' ? 'Male' : item.gender === 'F' ? 'Female' : item.gender}
                  </Table.Cell>
                  <Table.Cell>{formatDate(item.birth)}</Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-wrap gap-1">
                      {item.position?.slice(0, 3).map((p) => (
                        <Badge key={p.id} color="blue" size="sm">
                          {p.name}
                        </Badge>
                      ))}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-wrap gap-1">
                      {item.team?.slice(0, 3).map((t) => (
                        <Badge key={t.id} color="purple" size="sm">
                          {t.name}
                        </Badge>
                      ))}
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>

          <PaginationCardMinimal
            align="right"
            page={page}
            total={data?.meta.totalPages}
            onPageChange={setPage}
            className="w-full px-4 py-3 md:px-5 md:pt-3 md:pb-4"
          />
        </>
      )}
    </Form>
  );
}
