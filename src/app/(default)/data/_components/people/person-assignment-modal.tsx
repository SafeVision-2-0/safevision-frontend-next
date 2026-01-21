import React, { useEffect, useState } from 'react';
import { IdCard, Users } from 'lucide-react';
import { useListData } from 'react-stately';
import Form from '../form';
import { Label } from '@/components/base/input/label';
import { MultiSelect } from '@/components/base/select/multi-select';
import { PersonImageUpload } from './person-image-upload';
import { assignPosition, unassignPosition } from '@/lib/api/positions';
import { assignTeam, unassignTeam } from '@/lib/api/teams';

interface AssignmentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string | null;
  initialTeams?: any[];
  initialPositions?: any[];
  allTeams: { label: string; id: string }[];
  allPositions: { label: string; id: string }[];
  onFinish: () => void;
}

export function PersonAssignmentModal({
  isOpen,
  onOpenChange,
  personId,
  initialTeams = [],
  initialPositions = [],
  allTeams,
  allPositions,
  onFinish,
}: AssignmentModalProps) {
  const [isBusy, setIsBusy] = useState(false);

  const selectedTeams = useListData<any>({ initialItems: [] });
  const selectedPositions = useListData<any>({ initialItems: [] });

  // Sync state when modal opens or person changes
  useEffect(() => {
    if (isOpen) {
      selectedTeams.remove(...selectedTeams.items.map((i) => i.id));
      initialTeams.forEach((t) => selectedTeams.append({ id: String(t.id), label: t.name }));

      selectedPositions.remove(...selectedPositions.items.map((i) => i.id));
      initialPositions.forEach((p) =>
        selectedPositions.append({ id: String(p.id), label: p.name }),
      );
    }
  }, [isOpen, personId]);

  const handleAction = async (
    action: () => Promise<{
      success: boolean;
      message: string;
    }>,
  ) => {
    setIsBusy(true);
    try {
      await action();
    } catch (e) {
      console.error(e);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Form
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showCloseButton={false}
      title="Assign Images & Groups"
      buttonLabel="Done"
      showSecondaryButton={false}
      onSave={onFinish}
      isSubmitting={isBusy}
    >
      <div className="mb-4 flex w-full flex-col gap-2">
        <Label>Profile Image</Label>
        <PersonImageUpload
          personId={personId}
          onUploadSuccess={() => {}} // Could trigger a toast here
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MultiSelect
          isRequired
          placeholderIcon={IdCard}
          selectedItems={selectedPositions}
          label="Positions"
          items={allPositions}
          isDisabled={isBusy}
          onItemInserted={(k) => handleAction(() => assignPosition(Number(k), Number(personId)))}
          onItemCleared={(k) => handleAction(() => unassignPosition(Number(k), Number(personId)))}
        >
          {(item) => <MultiSelect.Item id={item.id}>{item.label}</MultiSelect.Item>}
        </MultiSelect>

        <MultiSelect
          isRequired
          placeholderIcon={Users}
          selectedItems={selectedTeams}
          isDisabled={isBusy}
          label="Teams"
          items={allTeams}
          onItemInserted={(k) => handleAction(() => assignTeam(Number(k), Number(personId)))}
          onItemCleared={(k) => handleAction(() => unassignTeam(Number(k), Number(personId)))}
        >
          {(item) => <MultiSelect.Item id={item.id}>{item.label}</MultiSelect.Item>}
        </MultiSelect>
      </div>
    </Form>
  );
}
