'use client';

import React, { useMemo, useState } from 'react';
import { DateValue, SortDescriptor } from 'react-aria-components';
import { Edit01, Plus, Trash01 } from '@untitledui/icons';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { ButtonUtility } from '@/components/base/buttons/button-utility';
import { PaginationCardMinimal } from '@/components/application/pagination/pagination';
import { Table, TableCard } from '@/components/application/table/table';
import Form from './form';
import peopleData from '../people-data.json';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { Label } from '@/components/base/input/label';
import { DatePicker } from '@/components/application/date-picker/date-picker';
import { MultiSelect } from '@/components/base/select/multi-select';
import { IdCard, Mars, Users, Venus } from 'lucide-react';
import { useListData } from 'react-stately';

export function PeopleTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'status',
    direction: 'ascending',
  });

  const genders = [
    { label: 'Male', id: 'm', icon: Mars },
    { label: 'Female', id: 'f', icon: Venus },
  ];

  const teams = [
    { label: 'Team Orion', id: '1' },
    { label: 'Team Gemini', id: '2' },
    { label: 'Team Aphrodite', id: '3' },
    { label: 'Team Gaia', id: '4' },
  ];

  const positions = [
    { label: 'AI/ML Engineer', id: '1' },
    { label: 'UI/UX Designer', id: '2' },
    { label: 'Frontend Engineer', id: '3' },
    { label: 'Backend Engineer', id: '4' },
  ];

  const selectedTeams = useListData({
    initialItems: [],
  });
  const selectedPositions = useListData({
    initialItems: [],
  });
  const [selectedGender, setSelectedGender] = React.useState<string>('m');
  const [selectedBirth, setSelectedBirth] = useState<DateValue | null>(null);

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
              <Button iconLeading={Plus} onClick={() => setIsOpen(true)}>
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

      <Form isOpen={isOpen} onOpenChange={setIsOpen} title="Add Person">
        <div className="flex w-full flex-col gap-4">
          <div className="grid grid-cols-1 gap-4">
            <img
              src="https://picsum.photos/id/180/300/200"
              alt=""
              className="aspect-video w-full rounded-lg object-cover"
            />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(3)].map((_, i) => (
                <img
                  key={i}
                  src={`https://picsum.photos/id/${181 + i}/300/200`}
                  alt=""
                  className="aspect-video w-full rounded-lg object-cover"
                />
              ))}
              <div className="flex aspect-video w-full cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900">
                <span>+3</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Input isRequired label="Name" className="w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              isRequired
              selectedKey={selectedGender}
              placeholder="Select Person"
              items={genders}
              className="w-full"
              label="Gender"
              onSelectionChange={(key) => setSelectedGender(key as string)}
            >
              {(item) => (
                <Select.Item
                  id={item.id}
                  supportingText={item.supportingText}
                  isDisabled={item.isDisabled}
                  icon={item.icon}
                  avatarUrl={item.avatarUrl}
                >
                  {item.label}
                </Select.Item>
              )}
            </Select>
            <div className="flex flex-col gap-1.5">
              <Label isRequired={true} className="">
                Birth Date
              </Label>
              <DatePicker
                aria-label="Date picker"
                value={selectedBirth}
                onChange={setSelectedBirth}
                className="w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <MultiSelect
              isRequired
              placeholderIcon={IdCard}
              selectedItems={selectedPositions}
              label="Positions"
              placeholder="Search Positions"
              items={positions}
            >
              {(item) => <MultiSelect.Item id={item.id}>{item.label}</MultiSelect.Item>}
            </MultiSelect>
            <MultiSelect
              isRequired
              placeholderIcon={Users}
              selectedItems={selectedTeams}
              label="Teams"
              placeholder="Search Teams"
              items={teams}
            >
              {(item) => <MultiSelect.Item id={item.id}>{item.label}</MultiSelect.Item>}
            </MultiSelect>
          </div>
        </div>
      </Form>
    </>
  );
}
