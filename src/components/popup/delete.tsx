import * as Modals from '@/components/application/modals/modal';
import Heading from '@/components/layout/heading';
import { X as Close } from 'lucide-react';
import { Button } from '@/components/base/buttons/button';

interface DeleteProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDelete: () => void | Promise<void>;
  isDeleting?: boolean;
  title?: string;
  desc?: string;
}

export default function Delete({
  isOpen,
  onOpenChange,
  title = 'Confirm Deletion',
  desc = 'Are you sure you want to delete this item? This action cannot be undone.',
  onDelete,
  isDeleting = false,
}: DeleteProps) {
  const onClose = () => {
    onOpenChange(false);
  };

  const handleDelete = async () => {
    await onDelete();
  };

  return (
    <Modals.DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modals.ModalOverlay>
        <Modals.Modal>
          <Modals.Dialog className="mx-auto flex max-w-120 flex-col gap-6 rounded-2xl bg-zinc-50 p-8 dark:bg-black">
            <div className="flex w-full items-center justify-between" aria-hidden="true">
              <Heading>{title}</Heading>
              <Close className="cursor-pointer" onClick={onClose} />
            </div>
            <div className="text-secondary w-full text-start">{desc}</div>
            <div className="flex w-full justify-end gap-3">
              <Button color="secondary" onClick={onClose} isDisabled={isDeleting}>
                Cancel
              </Button>
              <Button onClick={handleDelete} color="primary-destructive" isLoading={isDeleting}>
                Delete
              </Button>
            </div>
          </Modals.Dialog>
        </Modals.Modal>
      </Modals.ModalOverlay>
    </Modals.DialogTrigger>
  );
}
