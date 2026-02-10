'use client';

import React, { useState } from 'react';
import { SortDescriptor } from 'react-aria-components';
import { Edit01, Plus, Trash01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { ButtonUtility } from '@/components/base/buttons/button-utility';
import { PaginationCardMinimal } from '@/components/application/pagination/pagination';
import { Table, TableCard } from '@/components/application/table/table';
import { getTeams, deleteTeam } from '@/lib/api/teams';
import useSWR from 'swr';
import { formatDate } from '@/utils/format';
import Delete from '@/components/popup/delete';
import { Avatar } from '@/components/base/avatar/avatar';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';
import { TeamFormModal } from './team-form-modal';
import MemberListModal from '@/app/(default)/data/_components/member-list-modal';
import TableSkeleton from '@/app/(default)/data/_components/table-skeleton';

export function TeamTable() {
  // UI States
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showMemberList, setShowMemberList] = useState<boolean>(false);
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Data States
  const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState<number>(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'status',
    direction: 'ascending',
  });

  const itemsPerPage = 10;

  // Fetch Data
  const { data, error, isLoading, mutate } = useSWR(
    ['teams', page, itemsPerPage],
    ([, page, limit]) => getTeams(page, limit),
  );

  // Handlers
  const handleFormSuccess = async () => {
    await mutate();
    setShowForm(false);
    setSelectedTeam(null);
  };

  const handleDelete = async () => {
    if (!selectedTeam) return;

    setIsDeleting(true);
    try {
      await deleteTeam(selectedTeam.id);
      await mutate();
      setShowDelete(false);
      setSelectedTeam(null);
    } catch (error) {
      console.error('Failed to delete team:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEdit = (team: { id: string; name: string }) => {
    setSelectedTeam(team);
    setShowForm(true);
  };

  const openDelete = (team: { id: string; name: string }) => {
    setSelectedTeam(team);
    setShowDelete(true);
  };

  const openMemberList = (team: { id: string; name: string }) => {
    setSelectedTeam(team);
    setShowMemberList(true);
  };

  if (isLoading) return <TableSkeleton />;
  if (error) return <div>Failed to load</div>;

  return (
    <>
      <TableCard.Root size="sm">
        <TableCard.Header
          title="Manage Teams"
          badge={`${data?.meta.total || 0} teams`}
          contentTrailing={
            <Button
              iconLeading={Plus}
              onClick={() => {
                setSelectedTeam(null);
                setShowForm(true);
              }}
            >
              Add Team
            </Button>
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
              className="w-full max-w-1/4"
            />
            <Table.Head id="members" label="Members" />
            <Table.Head id="created" label="Created At" />
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
                        <TooltipTrigger
                          className="cursor-pointer"
                          onClick={() => {
                            openMemberList({ id: String(item.id), name: item.name });
                          }}
                        >
                          <div className="flex -space-x-1">
                            {item.previewImages.slice(0, 5).map((img, i) => (
                              <Avatar
                                key={i}
                                className="ring-bg-primary ring-[1.5px]"
                                size="xs"
                                src={`${process.env.NEXT_PUBLIC_BASE_API_URL}${img}`}
                                alt="Member"
                              />
                            ))}
                            {[
                              ...Array(
                                (item.memberCount > 5 ? 5 : item.memberCount) -
                                  item.previewImages.length,
                              ),
                            ].map((img, i) => (
                              <Avatar
                                key={i}
                                className="ring-bg-primary ring-[1.5px]"
                                size="xs"
                                alt="Member"
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
                        onClick={() => openDelete({ id: String(item.id), name: item.name })}
                      />
                      <ButtonUtility
                        size="xs"
                        color="tertiary"
                        tooltip="Edit"
                        icon={Edit01}
                        onClick={() => openEdit({ id: String(item.id), name: item.name })}
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

      <TeamFormModal
        isOpen={showForm}
        onOpenChange={setShowForm}
        teamToEdit={selectedTeam}
        onSuccess={handleFormSuccess}
      />

      <MemberListModal
        isOpen={showMemberList}
        onOpenChange={setShowMemberList}
        group={selectedTeam!}
        onGroupChange={setSelectedTeam}
        groupType="team"
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
