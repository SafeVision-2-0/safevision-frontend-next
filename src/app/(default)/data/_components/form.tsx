import * as Modals from '@/components/application/modals/modal';
import Heading from '@/components/layout/heading';
import { X as Close } from 'lucide-react';
import { Button } from '@/components/base/buttons/button';

interface FormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title?: string;
  children: React.ReactNode;
}

export default function Form({ isOpen, onOpenChange, title = 'Add Data', children }: FormProps) {
  const onClose = () => {
    onOpenChange(false);
  };

  const onSave = () => {
    onOpenChange(false);
  };

  return (
    <Modals.DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modals.ModalOverlay>
        <Modals.Modal>
          <Modals.Dialog className="mx-auto flex max-w-120 flex-col gap-6 rounded-2xl bg-zinc-50 p-8 dark:bg-black">
            <div className="mb-4 flex w-full items-center justify-between" aria-hidden="true">
              <Heading>{title}</Heading>
              <Close className="cursor-pointer" onClick={onClose} />
            </div>
            {children}
            <div className="flex w-full justify-end gap-3">
              <Button color="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onSave}>Add</Button>
            </div>
          </Modals.Dialog>
        </Modals.Modal>
      </Modals.ModalOverlay>
    </Modals.DialogTrigger>
  );
}
