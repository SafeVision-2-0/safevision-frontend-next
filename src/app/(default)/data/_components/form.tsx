import * as Modals from '@/components/application/modals/modal';
import Heading from '@/components/layout/heading';
import { X as Close } from 'lucide-react';
import { Button } from '@/components/base/buttons/button';

interface FormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: () => void | Promise<void>;
  showCloseButton?: boolean;
  buttonLabel?: string;
  secondaryButtonLabel?: string;
  fitWidth?: boolean;
  showSecondaryButton?: boolean;
  title?: string;
  children: React.ReactNode;
  isSubmitting?: boolean;
  className?: string;
}

export default function Form({
  isOpen,
  onOpenChange,
  onSave,
  showCloseButton = true,
  title = 'Add Data',
  buttonLabel = 'Add',
  fitWidth = false,
  secondaryButtonLabel = 'Cancel',
  showSecondaryButton = true,
  children,
  isSubmitting = false,
  className
}: FormProps) {
  const onClose = () => {
    onOpenChange(false);
  };

  const handleSave = async () => {
    await onSave();
  };

  return (
    <Modals.DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modals.ModalOverlay>
        <Modals.Modal>
          <Modals.Dialog
            className={`
              mx-auto flex ${fitWidth ? 'max-w-fit' : 'max-w-120'} ${className ?? ''} flex-col gap-6 rounded-2xl bg-zinc-50 p-8 dark:bg-black
            `}
          >
            <div className="mb-4 flex w-full items-center justify-between" aria-hidden="true">
              <Heading>{title}</Heading>
              <Close
                className={`cursor-pointer ${!showCloseButton && 'hidden'}`}
                onClick={onClose}
              />
            </div>
            {children}
            <div className="flex w-full justify-end gap-3">
              {showSecondaryButton && (
                <Button color="secondary" onClick={onClose} isDisabled={isSubmitting}>
                  {secondaryButtonLabel}
                </Button>
              )}
              <Button onClick={handleSave} isDisabled={isSubmitting}>
                {buttonLabel}
              </Button>
            </div>
          </Modals.Dialog>
        </Modals.Modal>
      </Modals.ModalOverlay>
    </Modals.DialogTrigger>
  );
}
