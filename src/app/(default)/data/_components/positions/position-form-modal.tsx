import React, { useEffect, useState } from 'react';
import Form from '../form';
import { Input } from '@/components/base/input/input';
import { createPosition, updatePosition } from '@/lib/api/positions';

interface PositionFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  positionToEdit: { id: string; name: string } | null;
  onSuccess: () => void;
}

export function PositionFormModal({
  isOpen,
  onOpenChange,
  positionToEdit,
  onSuccess,
}: PositionFormModalProps) {
  const [positionName, setPositionName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (positionToEdit) {
        setPositionName(positionToEdit.name);
      } else {
        setPositionName('');
      }
    }
  }, [isOpen, positionToEdit]);

  const handleSubmit = async () => {
    if (!positionName.trim()) return;

    setIsSubmitting(true);
    try {
      if (positionToEdit) {
        await updatePosition(positionToEdit.id, positionName);
      } else {
        await createPosition(positionName);
      }
      onSuccess();
    } catch (error) {
      console.error(`Failed to ${positionToEdit ? 'update' : 'create'} position:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={positionToEdit ? 'Edit Position' : 'Add Position'}
      buttonLabel={positionToEdit ? 'Update' : 'Create'}
      onSave={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <div className="flex w-full flex-col gap-4">
        <Input
          isRequired
          label="Position Name"
          className="w-full"
          value={positionName}
          onChange={setPositionName}
        />
      </div>
    </Form>
  );
}
