'use client';

import React, { useState } from 'react';
import { SortDescriptor } from 'react-aria-components';
import { Edit01, Plus, Trash01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { ButtonUtility } from '@/components/base/buttons/button-utility';
import { PaginationCardMinimal } from '@/components/application/pagination/pagination';
import { Table, TableCard } from '@/components/application/table/table';
import Form from './form';
import { Input } from '@/components/base/input/input';
import { createTeam, getTeams, deleteTeam, updateTeam } from '@/lib/api/teams';
import useSWR from 'swr';
import { formatDate } from '@/utils/format';
import Delete from '@/components/popup/delete';
import { Avatar } from '@/components/base/avatar/avatar';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';

export function TeamTable() {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [teamName, setTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'status',
    direction: 'ascending',
  });
  const itemsPerPage = 10;

  const { data, error, isLoading, mutate } = useSWR(
    ['teams', page, itemsPerPage],
    ([, page, limit]) => getTeams(page, limit),
  );

  const handleSaveTeam = async () => {
    if (!teamName.trim()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && selectedTeamId) {
        await updateTeam(selectedTeamId, teamName);
      } else {
        await createTeam(teamName);
      }
      await mutate();
      resetForm();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} team:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeamId) return;

    setIsDeleting(true);
    try {
      await deleteTeam(selectedTeamId);
      await mutate();
      setShowDelete(false);
      setSelectedTeamId(null);
    } catch (error) {
      console.error('Failed to delete team:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setTeamName('');
    setShowForm(false);
    setIsEditMode(false);
    setSelectedTeamId(null);
  };

  const onDelete = (teamId: string) => {
    setSelectedTeamId(teamId);
    setShowDelete(true);
  };

  const onEdit = (teamId: string, teamName: string) => {
    setSelectedTeamId(teamId);
    setTeamName(teamName);
    setIsEditMode(true);
    setShowForm(true);
  };

  const onAdd = () => {
    resetForm();
    setShowForm(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load</div>;

  return (
    <>
      <TableCard.Root size="sm">
        <TableCard.Header
          title="Manage Teams"
          badge={`${data?.meta.total || 0} teams`}
          contentTrailing={
            <div className="">
              <Button iconLeading={Plus} onClick={onAdd}>
                Add Team
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
            <Table.Head id="members" label="Members" allowsSorting />
            <Table.Head id="created" label="Created At" allowsSorting />
            <Table.Head id="actions" />
          </Table.Header>

          {data && (
            <Table.Body items={data.data}>
              {(item) => (
                <Table.Row id={item.id}>
                  <Table.Cell className="whitespace-nowrap">{item.name}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {item.memberCount > 0 ? (
                      <Tooltip title="Show members">
                        <TooltipTrigger className="cursor-pointer">
                          <div className="flex -space-x-1">
                            {item.previewImages.slice(0, 5).map((img, i) => (
                              <Avatar
                                className="ring-bg-primary ring-[1.5px]"
                                size="xs"
                                src={`${process.env.NEXT_PUBLIC_BASE_API_URL}${img}`}
                                alt="Olivia Rhye"
                              />
                            ))}
                            {item.memberCount > 5 && (
                              <Avatar
                                size="xs"
                                className="ring-bg-primary ring-[1.5px]"
                                placeholder={
                                  <span className="text-quaternary text-xs font-semibold">
                                    +{item.memberCount - 5}
                                  </span>
                                }
                              />
                            )}
                          </div>
                        </TooltipTrigger>
                      </Tooltip>
                    ) : (
                      'No members yet'
                    )}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {formatDate(item.created_at)}
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
                        onClick={() => onEdit(String(item.id), item.name)}
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
          total={data?.meta.totalPages}
          onPageChange={setPage}
          className="px-4 py-3 md:px-5 md:pt-3 md:pb-4"
        />
      </TableCard.Root>

      <Form
        isOpen={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) resetForm();
        }}
        buttonLabel={isEditMode ? 'Update' : 'Create'}
        onSave={handleSaveTeam}
        title={isEditMode ? 'Edit Team' : 'Add Team'}
        isSubmitting={isSubmitting}
      >
        <div className="flex w-full flex-col gap-4">
          <div className="grid grid-cols-1 gap-4">
            <Input
              isRequired
              label="Team Name"
              className="w-full"
              value={teamName}
              onChange={setTeamName}
            />
          </div>
        </div>
      </Form>

      <Delete
        isOpen={showDelete}
        onOpenChange={setShowDelete}
        onDelete={handleDeleteTeam}
        isDeleting={isDeleting}
      />
    </>
  );
}
