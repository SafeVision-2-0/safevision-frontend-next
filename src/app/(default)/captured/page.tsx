'use client';

import Section from '@/components/layout/section';
import { LiveCamera } from '@/app/(default)/camera/_components/live-camera';
import Heading from '@/components/layout/heading';
import { DatePicker } from '@/components/application/date-picker/date-picker';
import { Select } from '@/components/base/select/select';
import { User01 } from '@untitledui/icons';
import { Camera, Clock, Calendar, X as Close, Cake, Mars, Users, IdCard } from 'lucide-react';
import { CapturedPersonItem } from '@/app/(default)/camera/_components/captured-person-item';
import { getLocalTimeZone, today } from '@internationalized/date';
import { useState } from 'react';
import { DateValue } from 'react-aria-components';
import { DateRangePicker } from '@/components/application/date-picker/date-range-picker';
import * as Paginations from '@/components/application/pagination/pagination';
import * as Modals from '@/components/application/modals/modal';
import { Button } from '@/components/base/buttons/button';
import Image from 'next/image';
import { AvatarLabelGroup } from '@/components/base/avatar/avatar-label-group';
import { Avatar } from '@/components/base/avatar/avatar';

export default function Captured() {
  const people = [
    { label: 'Ikram Sabila', id: '1' },
    { label: 'Halilintar Daiva', id: '2' },
    { label: 'Andra Dzaki', id: '3' },
  ];

  const now = today(getLocalTimeZone());

  const [selectedPerson, setSelectedPerson] = useState<string>('1');
  const [value, setValue] = useState<{ start: DateValue; end: DateValue } | null>({
    start: now.subtract({ days: 7 }),
    end: now,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const total = 10;
  const [isDescOpen, setIsDescOpen] = useState(false);

  return (
    <Section>
      <div className="flex w-full flex-col">
        <Heading className="mb-4">Captured People</Heading>

        <div className="flex flex-col sm:flex-row sm:max-w-100 w-full gap-3">
          <DateRangePicker
            aria-label="Date range picker"
            shouldCloseOnSelect={false}
            value={value}
            onChange={setValue}
          />

          <Select
            isRequired
            selectedKey={selectedPerson}
            placeholder="Select Person"
            items={people}
            className="w-full"
            placeholderIcon={User01}
            onSelectionChange={(key) => setSelectedPerson(key as string)}
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
        </div>

        <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(20)].map((_, i) => (
            <img
              key={i}
              className="aspect-video w-full cursor-pointer rounded-lg object-cover"
              src={`https://picsum.photos/id/${180 + i}/300/200`}
              alt="Person"
              onClick={() => setIsDescOpen(true)}
            />
          ))}
        </div>

        <Paginations.PaginationPageMinimalCenter
          page={currentPage}
          total={total}
          onPageChange={setCurrentPage}
        />

        <Modals.DialogTrigger isOpen={isDescOpen} onOpenChange={setIsDescOpen}>
          <Modals.ModalOverlay>
            <Modals.Modal>
              <Modals.Dialog className="mx-auto grid max-w-225 grid-cols-1 gap-4 rounded-2xl bg-zinc-50 p-8 lg:grid-cols-3 lg:gap-10 dark:bg-black">
                <div className="mb-4 flex items-center justify-between lg:hidden" aria-hidden="true">
                  <Heading>Details</Heading>
                  <Close className="cursor-pointer" onClick={() => setIsDescOpen(false)} />
                </div>
                <div className={'lg:col-span-2'}>
                  <img
                    src="https://picsum.photos/id/180/300/200"
                    className="aspect-video w-full rounded-lg object-cover"
                    alt="Ikram"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="mb-4 lg:flex items-center justify-between hidden" aria-hidden="true">
                    <Heading>Details</Heading>
                    <Close className="cursor-pointer" onClick={() => setIsDescOpen(false)} />
                  </div>
                  <div className="mt-4 flex items-center">
                    <Avatar
                      size="xl"
                      alt="Olivia Rhye"
                      src="https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80"
                      className="shrink-0"
                    />
                    <span className="ml-4 flex-1 truncate">Olivia Rhye</span>
                  </div>

                  <div className="mt-4 flex flex-col gap-0.5 text-sm">
                    <h2 className="text-gray-500">Spotted</h2>
                    <span className="flex items-center gap-2">
                      <Clock width={15} />
                      <span>12.30:50 AM</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar width={15} />
                      <span>January 30, 2025</span>
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-0.5 text-sm">
                    <h2 className="text-gray-500">Information</h2>
                    <span className="flex items-center gap-2">
                      <Mars width={15} />
                      <span>Male</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Cake width={15} />
                      <span>January 30, 2003</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Users width={15} />
                      <span>Team Orion</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <IdCard width={15} />
                      <span>AI/ML Engineer</span>
                    </span>
                  </div>

                  {/*<p>Modal content goes here</p>*/}
                  {/*<Button onPress={() => setIsDescOpen(false)}>Close</Button>*/}
                </div>
              </Modals.Dialog>
            </Modals.Modal>
          </Modals.ModalOverlay>
        </Modals.DialogTrigger>
      </div>
    </Section>
  );
}
