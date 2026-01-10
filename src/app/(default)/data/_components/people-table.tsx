'use client';

import { useMemo, useState } from 'react';
import { SortDescriptor } from 'react-aria-components';
import { Edit01, Plus, Trash01 } from '@untitledui/icons';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { ButtonUtility } from '@/components/base/buttons/button-utility';
import { PaginationCardMinimal } from '@/components/application/pagination/pagination';
import { Table, TableCard } from '@/components/application/table/table';
import Form from './form';
import peopleData from '../people-data.json';

export function PeopleTable() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'status',
    direction: 'ascending',
  });

  const sortedItems = useMemo(() => {
    return peopleData.items.sort((a, b) => {
      const first = a[sortDescriptor.column as keyof typeof a];
      const second = b[sortDescriptor.column as keyof typeof b];

      if (
        (typeof first === 'number' && typeof second === 'number') ||
        (typeof first === 'boolean' && typeof second === 'boolean')
      ) {
        return sortDescriptor.direction === 'descending' ? second - first : first - second;
      }

      if (typeof first === 'string' && typeof second === 'string') {
        let cmp = first.localeCompare(second);
        if (sortDescriptor.direction === 'descending') {
          cmp *= -1;
        }
        return cmp;
      }

      return 0;
    });
  }, [sortDescriptor]);

  return (
    <>
      <TableCard.Root size="sm">
        <TableCard.Header
          title="Manage People"
          badge="32 poeple"
          contentTrailing={
            <div className="">
              <Button iconLeading={Plus} onPress={() => setIsAddOpen(true)}>
                Add people
              </Button>
            </div>
          }
        />
        <Table
          aria-label="Team members"
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
        >
          <Table.Header>
            <Table.Head
              id="name"
              label="Name"
              isRowHeader
              allowsSorting
              className="w-full max-w-1/4"
            />
            <Table.Head id="gender" label="Gender" allowsSorting />
            <Table.Head id="birth" label="Birth" allowsSorting />
            <Table.Head id="position" label="Positions" allowsSorting />
            <Table.Head id="item" label="Teams" allowsSorting />
            <Table.Head id="actions" />
          </Table.Header>

          <Table.Body items={sortedItems}>
            {(item) => (
              <Table.Row id={item.id}>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <Avatar src={item.avatarUrl} alt={item.name} size="sm" />
                    <p className="text-primary text-sm font-medium whitespace-nowrap">
                      {item.name}
                    </p>
                  </div>
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap">{item.gender}</Table.Cell>
                <Table.Cell className="whitespace-nowrap">{item.birth}</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    {item.position.slice(0, 3).map((item) => (
                      <Badge key={item.name} color="blue" size="sm">
                        {item.name}
                      </Badge>
                    ))}

                    {item.position.length > 3 && (
                      <Badge color="gray" size="sm">
                        +{item.position.length - 3}
                      </Badge>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    {item.team.slice(0, 3).map((item) => (
                      <Badge key={item.name} color="purple" size="sm">
                        {item.name}
                      </Badge>
                    ))}

                    {item.team.length > 3 && (
                      <Badge color="gray" size="sm">
                        +{item.team.length - 3}
                      </Badge>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell className="px-3">
                  <div className="flex justify-end gap-0.5">
                    <ButtonUtility size="xs" color="tertiary" tooltip="Delete" icon={Trash01} />
                    <ButtonUtility size="xs" color="tertiary" tooltip="Edit" icon={Edit01} />
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>

        <PaginationCardMinimal
          align="right"
          page={1}
          total={10}
          className="px-4 py-3 md:px-5 md:pt-3 md:pb-4"
        />
      </TableCard.Root>
      <Form isOpen={isAddOpen} onOpenChange={setIsAddOpen} />
    </>
  );
}
