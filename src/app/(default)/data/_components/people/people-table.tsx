'use client';

import React, { useState } from 'react';
import { SortDescriptor } from 'react-aria-components';
import { Edit01, Plus, Trash01 } from '@untitledui/icons';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { ButtonUtility } from '@/components/base/buttons/button-utility';
import { PaginationCardMinimal } from '@/components/application/pagination/pagination';
import { Table, TableCard } from '@/components/application/table/table';
import Delete from '@/components/popup/delete';
import useSWR from 'swr';
import { getPeople, deletePerson } from '@/lib/api/people';
import { getPositions } from '@/lib/api/positions';
import { getTeams } from '@/lib/api/teams';
import { formatDate } from '@/utils/format';
import { PersonBioModal } from './person-bio-modal';
import { PersonAssignmentModal } from './person-assignment-modal';

export function PeopleTable() {
  // UI States
  const [showBioForm, setShowBioForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Data States
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [page, setPage] = useState<number>(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'created_at',
    direction: 'descending',
  });

  // Fetch Data
  const { data, isLoading, mutate } = useSWR(['people', page, 10], ([, p, l]) => getPeople(p, l));
  const { data: posData } = useSWR(['positions', 1, 100], ([, p, l]) => getPositions(p, l));
  const { data: teamData } = useSWR(['teams', 1, 100], ([, p, l]) => getTeams(p, l));

  // Transform Options
  const teamsOpts = teamData?.data?.map((t) => ({ label: t.name, id: String(t.id) })) || [];
  const posOpts = posData?.data?.map((p) => ({ label: p.name, id: String(p.id) })) || [];

  // Handlers
  const handleBioSuccess = async (personId: string) => {
    await mutate();
    setShowBioForm(false);
    // If it was a create action (no previous selection), select it now and open assign
    if (!selectedPerson) {
      setSelectedPerson({ id: personId }); // Minimal obj needed for assignment
      setShowAssignForm(true);
    }
  };

  const handleAssignFinish = async () => {
    await mutate();
    setShowAssignForm(false);
    setSelectedPerson(null);
  };

  const handleDelete = async () => {
    if (!selectedPerson) return;
    setIsDeleting(true);
    try {
      await deletePerson(selectedPerson.id);
      await mutate();
      setShowDelete(false);
      setSelectedPerson(null);
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEdit = (person: any) => {
    setSelectedPerson(person);
    setShowBioForm(true);
  };

  const openDelete = (person: any) => {
    setSelectedPerson(person);
    setShowDelete(true);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <TableCard.Root size="sm">
        <TableCard.Header
          title="Manage People"
          badge={`${data?.meta.total || 0} people`}
          contentTrailing={
            <Button
              iconLeading={Plus}
              onClick={() => {
                setSelectedPerson(null);
                setShowBioForm(true);
              }}
            >
              Add People
            </Button>
          }
        />
        <Table aria-label="People" sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
          <Table.Header>
            <Table.Head id="name" label="Name" isRowHeader allowsSorting className="w-1/4" />
            <Table.Head id="gender" label="Gender" allowsSorting />
            <Table.Head id="birth" label="Birth" allowsSorting />
            <Table.Head id="position" label="Positions" />
            <Table.Head id="item" label="Teams" />
            <Table.Head id="actions" />
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
                <Table.Cell className="px-3">
                  <div className="flex justify-end gap-0.5">
                    <ButtonUtility
                      size="xs"
                      color="tertiary"
                      tooltip="Delete"
                      icon={Trash01}
                      onClick={() => openDelete(item)}
                    />
                    <ButtonUtility
                      size="xs"
                      color="tertiary"
                      tooltip="Edit"
                      icon={Edit01}
                      onClick={() => openEdit(item)}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>

        <PaginationCardMinimal
          align="right"
          page={page}
          total={data?.meta.totalPages || 0}
          onPageChange={setPage}
          className="px-4 py-3"
        />
      </TableCard.Root>

      <PersonBioModal
        isOpen={showBioForm}
        onOpenChange={setShowBioForm}
        personToEdit={selectedPerson}
        onSuccess={handleBioSuccess}
      />

      <PersonAssignmentModal
        isOpen={showAssignForm}
        onOpenChange={setShowAssignForm}
        personId={selectedPerson ? String(selectedPerson.id) : null}
        initialTeams={selectedPerson?.team}
        initialPositions={selectedPerson?.position}
        allTeams={teamsOpts}
        allPositions={posOpts}
        onFinish={handleAssignFinish}
      />

      <Delete
        isOpen={showDelete}
        onOpenChange={setShowDelete}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
