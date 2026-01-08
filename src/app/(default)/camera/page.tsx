'use client';

import Section from '@/components/layout/section';
import Heading from '@/components/layout/heading';
import { Select } from '@/components/base/select/select';
import { useState } from 'react';
import { User01 } from '@untitledui/icons';
import { DatePicker } from '@/components/application/date-picker/date-picker';
import { getLocalTimeZone, today } from '@internationalized/date';
import { DateValue } from 'react-aria-components';
import { LiveCamera } from './_components/live-camera';
import { CapturedPersonItem } from './_components/captured-person-item';

export default function Camera() {
  const people = [
    { label: 'Ikram Sabila', id: '1' },
    { label: 'Halilintar Daiva', id: '2' },
    { label: 'Andra Dzaki', id: '3' },
  ];

  const now = today(getLocalTimeZone());

  const [selectedPerson, setSelectedPerson] = useState<string>('1');
  const [value, setValue] = useState<DateValue | null>(now);

  return (
    <Section>
      <div className="flex w-full gap-6">
        {/* Left Side: Live Feed */}
        <LiveCamera />

        {/* Right Side: Captured List */}
        <div className="w-100 shrink-0">
          <Heading className="mb-4">Captured People</Heading>

          <div className="grid w-full grid-cols-2 gap-3">
            <DatePicker
              aria-label="Date picker"
              value={value}
              onChange={setValue}
              className="w-full"
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

          <div className="mt-4 flex flex-col">
            {[...Array(7)].map((_, i) => (
              <CapturedPersonItem
                key={i}
                name="Jane Antoinette Doe"
                time="12.30:50 AM"
                date="Jan 30, 2025"
                imageUrl={`https://picsum.photos/id/${180 + i}/300/200`}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
