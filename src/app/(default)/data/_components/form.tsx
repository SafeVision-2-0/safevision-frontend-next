import * as Modals from '@/components/application/modals/modal';
import Heading from '@/components/layout/heading';
import { X as Close, Mars, Venus, Users, IdCard } from 'lucide-react';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import React, { useState } from 'react';
import { DatePicker } from '@/components/application/date-picker/date-picker';
import { DateValue } from 'react-aria-components';
import { Label } from '@/components/base/input/label';
import { MultiSelect } from '@/components/base/select/multi-select';
import { useListData } from 'react-stately';
import { Button } from '@/components/base/buttons/button';

interface FormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function Form({ isOpen, onOpenChange }: FormProps) {
  const genders = [
    { label: 'Male', id: 'm', icon: Mars },
    { label: 'Female', id: 'f', icon: Venus },
  ];

  const teams = [
    { label: 'Team Orion', id: '1' },
    { label: 'Team Gemini', id: '2' },
    { label: 'Team Aphrodite', id: '3' },
    { label: 'Team Gaia', id: '4' },
  ]

  const positions = [
    { label: 'AI/ML Engineer', id: '1' },
    { label: 'UI/UX Designer', id: '2' },
    { label: 'Frontend Engineer', id: '3' },
    { label: 'Backend Engineer', id: '4' },
  ]

  const selectedTeams = useListData({
    initialItems: [],
  });
  const selectedPositions = useListData({
    initialItems: [],
  });
  const [selectedGender, setSelectedGender] = React.useState<string>('m');
  const [selectedBirth, setSelectedBirth] = useState<DateValue | null>(null);

  return (
    <Modals.DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modals.ModalOverlay>
        <Modals.Modal>
          <Modals.Dialog className="mx-auto flex max-w-120 flex-col gap-6 rounded-2xl bg-zinc-50 p-8 dark:bg-black">
            <div className="mb-4 flex w-full items-center justify-between" aria-hidden="true">
              <Heading>Add Person</Heading>
              <Close className="cursor-pointer" onClick={() => onOpenChange(false)} />
            </div>
            <div className="flex w-full flex-col gap-4">
              <div className="grid grid-cols-1 gap-4">
                <img
                  src="https://picsum.photos/id/180/300/200"
                  alt=""
                  className="aspect-video w-full rounded-lg object-cover"
                />
                <div className="grid grid-cols-3 mt-20">
                  <div>hel</div>
                  <div>hel</div>
                  <div>hel</div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Input isRequired label="Name" className="w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  isRequired
                  selectedKey={selectedGender}
                  placeholder="Select Person"
                  items={genders}
                  className="w-full"
                  label="Gender"
                  onSelectionChange={(key) => setSelectedGender(key as string)}
                >
                  {(item) => (
                    <Select.Item
                      id={item.id}
                      supportingText={item.supportingText}
                      isDisabled={item.isDisabled}
                      icon={item.icon}
                      avatarUrl={item.avatarUrl}
                    >
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
              <div className="grid grid-cols-2 gap-4">
                <MultiSelect
                  isRequired
                  placeholderIcon={IdCard}
                  selectedItems={selectedPositions}
                  label="Positions"
                  placeholder="Search Positions"
                  items={positions}
                >
                  {(item) => <MultiSelect.Item id={item.id}>{item.label}</MultiSelect.Item>}
                </MultiSelect>
                <MultiSelect
                  isRequired
                  placeholderIcon={Users}
                  selectedItems={selectedTeams}
                  label="Teams"
                  placeholder="Search Teams"
                  items={teams}
                >
                  {(item) => <MultiSelect.Item id={item.id}>{item.label}</MultiSelect.Item>}
                </MultiSelect>
              </div>
            </div>
            <div className="flex w-full justify-end gap-3">
              <Button color="secondary">Cancel</Button>
              <Button>Add</Button>
            </div>
          </Modals.Dialog>
        </Modals.Modal>
      </Modals.ModalOverlay>
    </Modals.DialogTrigger>
  );
}
