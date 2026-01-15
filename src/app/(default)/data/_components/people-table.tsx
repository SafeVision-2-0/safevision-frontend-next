'use client';

import React, { useState, useEffect } from 'react';
import { DateValue, SortDescriptor } from 'react-aria-components';
import { parseDate } from '@internationalized/date';
import { Edit01, Plus, Trash01 } from '@untitledui/icons';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { ButtonUtility } from '@/components/base/buttons/button-utility';
import { PaginationCardMinimal } from '@/components/application/pagination/pagination';
import { Table, TableCard } from '@/components/application/table/table';
import Form from './form';
import { Input } from '@/components/base/input/input';
import { Select, SelectItemType } from '@/components/base/select/select';
import { Label } from '@/components/base/input/label';
import { DatePicker } from '@/components/application/date-picker/date-picker';
import { MultiSelect } from '@/components/base/select/multi-select';
import { IdCard, Mars, Users, Venus } from 'lucide-react';
import { useListData } from 'react-stately';
import Delete from '@/components/popup/delete';
import useSWR from 'swr';
import { getPeople, createPerson, deletePerson, updatePerson } from '@/lib/api/people';
import { assignPosition, getPositions, unassignPosition } from '@/lib/api/positions';
import { assignTeam, getTeams, unassignTeam } from '@/lib/api/teams';
import { formatDate } from '@/utils/format';

export function PeopleTable() {
  const [showBioForm, setShowBioForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'created_at',
    direction: 'descending',
  });

  const itemsPerPage = 10;

  // Fetch People Data
  const { data, error, isLoading, mutate } = useSWR(
    ['people', page, itemsPerPage],
    ([, page, limit]) => getPeople(page, limit),
  );

  // Fetch Options for Forms (Teams & Positions)
  // We fetch a larger limit to get all options for the dropdowns
  const { data: positionsData } = useSWR(['positions', 1, 100], ([, p, l]) => getPositions(p, l));

  const { data: teamsData } = useSWR(['teams', 1, 100], ([, p, l]) => getTeams(p, l));

  // Form States
  const [personName, setPersonName] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('m');
  const [selectedBirth, setSelectedBirth] = useState<DateValue | null>(null);

  const teams = teamsData?.data?.map((t) => ({ label: t.name, id: String(t.id) })) || [];
  const positions = positionsData?.data?.map((p) => ({ label: p.name, id: String(p.id) })) || [];

  const genders = [
    { label: 'Male', id: 'M', icon: Mars },
    { label: 'Female', id: 'F', icon: Venus },
  ];

  const selectedTeams = useListData<SelectItemType>({ initialItems: [] });
  const selectedPositions = useListData<SelectItemType>({ initialItems: [] });

  const resetForm = () => {
    setPersonName('');
    setSelectedGender('M');
    setSelectedBirth(null);
    selectedTeams.remove(...selectedTeams.items.map((i) => i.id));
    selectedPositions.remove(...selectedPositions.items.map((i) => i.id));
    setShowBioForm(false);
    setIsEditMode(false);
    setSelectedPersonId(null);
  };

  const handleSavePerson = async () => {
    if (!personName.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: personName,
        gender: selectedGender,
        birth: selectedBirth ? selectedBirth.toString() : '',
      };

      if (isEditMode && selectedPersonId) {
        const res = await updatePerson(selectedPersonId, payload);
      } else {
        const res = await createPerson(payload);
        setSelectedPersonId(String(res.data.id));
        console.log(res);
        console.log(res.data.id);
        console.log(selectedPersonId);
      }
      await mutate();
      setShowAssignForm(true);
      setShowBioForm(false);
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} person:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignPerson = async () => {
    await mutate();
    setShowAssignForm(false);
    setShowBioForm(false);
    resetForm();
  };

  const handleAssignPosition = async (positionId: number) => {
    setIsAssigning(true);
    try {
      await assignPosition(positionId, Number(selectedPersonId));
    } catch (error) {
      console.error('Failed to assign position:', error);
    } finally {
      setIsAssigning(false);
    }
  }

  const handleUnassignPosition = async (positionId: number) => {
    setIsAssigning(true);
    try {
      await unassignPosition(positionId, Number(selectedPersonId));
    } catch (error) {
      console.error('Failed to unassign position:', error);
    } finally {
      setIsAssigning(false);
    }
  }

  const handleAssignTeam = async (teamId: number) => {
    setIsAssigning(true);
    try {
      await assignTeam(teamId, Number(selectedPersonId));
    } catch (error) {
      console.error('Failed to assign team:', error);
    } finally {
      setIsAssigning(false);
    }
  }

  const handleUnassignTeam = async (teamId: number) => {
    setIsAssigning(true);
    try {
      await unassignTeam(teamId, Number(selectedPersonId));
    } catch (error) {
      console.error('Failed to unassign team:', error);
    } finally {
      setIsAssigning(false);
    }
  }

  const handleDeletePerson = async () => {
    if (!selectedPersonId) return;
    setIsDeleting(true);
    try {
      await deletePerson(selectedPersonId);
      await mutate();
      setShowDelete(false);
      setSelectedPersonId(null);
    } catch (error) {
      console.error('Failed to delete person:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const onDelete = (id: string) => {
    setSelectedPersonId(id);
    setShowDelete(true);
  };

  const onEdit = (person: any) => {
    setSelectedPersonId(String(person.id));
    setPersonName(person.name);
    setSelectedGender(person.gender);
    if (person.birth) {
      try {
        setSelectedBirth(parseDate(person.birth));
      } catch (e) {
        // handle invalid date format if necessary
      }
    }

    // Map existing positions/teams to selection
    selectedPositions.remove(...selectedPositions.items.map((i) => i.id));
    if (person.position) {
      // Backend likely returns 'position' array based on table body usage
      person.position.forEach((p: any) =>
        selectedPositions.append({ id: String(p.id), label: p.name }),
      );
    }
    selectedTeams.remove(...selectedTeams.items.map((i) => i.id));
    if (person.team) {
      // Backend likely returns 'team' array based on table body usage
      person.team.forEach((t: any) => selectedTeams.append({ id: String(t.id), label: t.name }));
    }

    setIsEditMode(true);
    setShowBioForm(true);
  };

  const onAdd = () => {
    resetForm();
    setShowBioForm(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load</div>;

  return (
    <>
      <TableCard.Root size="sm">
        <TableCard.Header
          title="Manage People"
          badge={`${data?.meta.total || 0} people`}
          contentTrailing={
            <div className="">
              <Button iconLeading={Plus} onClick={onAdd}>
                Add People
              </Button>
            </div>
          }
        />
        <Table
          aria-label="People list"
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
            <Table.Head id="position" label="Positions" />
            <Table.Head id="item" label="Teams" />
            <Table.Head id="actions" />
          </Table.Header>

          {data && (
            <Table.Body items={data.data}>
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
                  <Table.Cell className="whitespace-nowrap capitalize">
                    {item.gender === 'M' ? 'Male' : item.gender === 'F' ? 'Female' : item.gender}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{formatDate(item.birth)}</Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-wrap gap-1">
                      {item.position?.slice(0, 3).map((pos) => (
                        <Badge key={pos.id} color="blue" size="sm">
                          {pos.name}
                        </Badge>
                      ))}
                      {item.position?.length > 3 && (
                        <Badge color="gray" size="sm">
                          +{item.position.length - 3}
                        </Badge>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-wrap gap-1">
                      {item.team?.slice(0, 3).map((team) => (
                        <Badge key={team.id} color="purple" size="sm">
                          {team.name}
                        </Badge>
                      ))}
                      {item.team?.length > 3 && (
                        <Badge color="gray" size="sm">
                          +{item.team.length - 3}
                        </Badge>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-3">
                    <div className="flex justify-end gap-0.5">
                      <ButtonUtility
                        size="xs"
                        color="tertiary"
                        tooltip="Delete"
                        icon={Trash01}
                        onClick={() => onDelete(String(item.id))}
                      />
                      <ButtonUtility
                        size="xs"
                        color="tertiary"
                        tooltip="Edit"
                        icon={Edit01}
                        onClick={() => onEdit(item)}
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          )}
        </Table>

        <PaginationCardMinimal
          align="right"
          page={page}
          total={data?.meta.totalPages || 0}
          onPageChange={setPage}
          className="px-4 py-3 md:px-5 md:pt-3 md:pb-4"
        />
      </TableCard.Root>

      <Form
        isOpen={showAssignForm}
        onOpenChange={(open) => {
          setShowAssignForm(open);
          if (!open) resetForm();
        }}
        title="Assign Image and Group"
        buttonLabel="Done"
        showSecondaryButton={false}
        onSave={handleAssignPerson}
        isSubmitting={isSubmitting}
      >
        selected id: {selectedPersonId}
        <div className="grid grid-cols-2 gap-4">
          <MultiSelect
            isRequired
            placeholderIcon={IdCard}
            selectedItems={selectedPositions}
            label="Positions"
            placeholder="Search Positions"
            items={positions}
            isDisabled={isAssigning}
            onItemInserted={(key) => handleAssignPosition(key as number)}
            onItemCleared={(key) => handleUnassignPosition(key as number)}
          >
            {(item) => <MultiSelect.Item id={item.id}>{item.label}</MultiSelect.Item>}
          </MultiSelect>
          <MultiSelect
            isRequired
            placeholderIcon={Users}
            selectedItems={selectedTeams}
            isDisabled={isAssigning}
            label="Teams"
            placeholder="Search Teams"
            items={teams}
            onItemInserted={(key) => handleAssignTeam(key as number)}
            onItemCleared={(key) => handleUnassignTeam(key as number)}
          >
            {(item) => <MultiSelect.Item id={item.id}>{item.label}</MultiSelect.Item>}
          </MultiSelect>
        </div>
      </Form>

      <Form
        isOpen={showBioForm}
        onOpenChange={(open) => {
          setShowBioForm(open);
          if (!open) resetForm();
        }}
        title={isEditMode ? 'Edit Person' : 'Add Person'}
        buttonLabel={isEditMode ? 'Update' : 'Create'}
        onSave={handleSavePerson}
        isSubmitting={isSubmitting}
      >
        <div className="flex w-full flex-col gap-4">
          <div className="grid grid-cols-1 gap-4">
            <Input
              isRequired
              label="Name"
              className="w-full"
              value={personName}
              onChange={setPersonName}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              isRequired
              selectedKey={selectedGender}
              placeholder="Select Gender"
              items={genders}
              className="w-full"
              label="Gender"
              onSelectionChange={(key) => setSelectedGender(key as string)}
            >
              {(item) => (
                <Select.Item id={item.id} icon={item.icon}>
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
        </div>
      </Form>

      <Delete
        isOpen={showDelete}
        onOpenChange={setShowDelete}
        onDelete={handleDeletePerson}
        isDeleting={isDeleting}
      />
    </>
  );
}
