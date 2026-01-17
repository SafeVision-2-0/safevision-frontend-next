import React, { useEffect, useState } from 'react';
import Form from '../form';
import { Input } from '@/components/base/input/input';
import { createTeam, updateTeam } from '@/lib/api/teams';

interface TeamFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamToEdit: { id: string; name: string } | null;
  onSuccess: () => void;
}

export function TeamFormModal({ isOpen, onOpenChange, teamToEdit, onSuccess }: TeamFormModalProps) {
  const [teamName, setTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (teamToEdit) {
        setTeamName(teamToEdit.name);
      } else {
        setTeamName('');
      }
    }
  }, [isOpen, teamToEdit]);

  const handleSubmit = async () => {
    if (!teamName.trim()) return;

    setIsSubmitting(true);
    try {
      if (teamToEdit) {
        await updateTeam(teamToEdit.id, teamName);
      } else {
        await createTeam(teamName);
      }
      onSuccess();
    } catch (error) {
      console.error(`Failed to ${teamToEdit ? 'update' : 'create'} team:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={teamToEdit ? 'Edit Team' : 'Add Team'}
      buttonLabel={teamToEdit ? 'Update' : 'Create'}
      onSave={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <div className="flex w-full flex-col gap-4">
        <Input
          isRequired
          label="Team Name"
          className="w-full"
          value={teamName}
          onChange={setTeamName}
        />
      </div>
    </Form>
  );
}
