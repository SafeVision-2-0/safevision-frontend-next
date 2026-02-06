// src/app/(default)/camera/page.tsx
'use client';

import Section from '@/components/layout/section';
import Heading from '@/components/layout/heading';
import { Select } from '@/components/base/select/select';
import { useEffect, useState } from 'react';
import { User01 } from '@untitledui/icons';
import { DatePicker } from '@/components/application/date-picker/date-picker';
import { getLocalTimeZone, today, parseDate } from '@internationalized/date';
import { DateValue } from 'react-aria-components';
import { LiveCamera } from './_components/live-camera';
import { CapturedPersonItem } from './_components/captured-person-item';
import { getHistory, HistoryItem } from '@/lib/api/history';
import { getPeople } from '@/lib/api/people';
import { Person } from '@/types/person';
import { buildImageUrl, formatDate, formatTime } from '@/lib/helpers/format';
import CapturedDetails from '@/components/custom/captured-details';

export default function Camera() {
  const now = today(getLocalTimeZone());

  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<DateValue | null>(now);
  const [capturedHistory, setCapturedHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

  // Fetch people list
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await getPeople(1, 100);
        setPeople(response.data);
      } catch (error) {
        console.error('Failed to fetch people:', error);
      }
    };

    fetchPeople();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const dateString = selectedDate
        ? `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`
        : undefined;

      const response = await getHistory({
        date: dateString,
        profileId:
          selectedPerson === 'all' || selectedPerson === 'unknown'
            ? undefined
            : Number(selectedPerson),
        status: selectedPerson === 'unknown' ? 'unknown' : undefined,
        limit: 50,
      });

      setCapturedHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setCapturedHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch history based on filters
  useEffect(() => {
    fetchHistory();
  }, [selectedDate, selectedPerson]);

  const handleHistoryClick = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setIsDescOpen(true);
  }

  const handleHistoryClose = () => {
    setSelectedHistoryItem(null);
    setIsDescOpen(false);
  }

  // Format people data for Select component
  const peopleItems = [
    { label: 'All People', id: 'all' },
    { label: 'Unknown', id: 'unknown' },
    ...people.map((person) => ({
      label: person.name,
      id: String(person.id),
    })),
  ];

  const onHistorySent = () => {
    fetchHistory();
  }

  return (
    <Section>
      <>
        <div className="flex w-full gap-12 lg:gap-6 flex-col lg:flex-row">
          {/* Left Side: Live Feed */}
          <LiveCamera onHistorySent={onHistorySent} />

          {/* Right Side: Captured List */}
          <div className="w-full lg:w-100 shrink-0">
            <Heading className="mb-4">Captured People</Heading>

            <div className="grid w-full grid-cols-2 gap-3">
              <DatePicker
                aria-label="Date picker"
                value={selectedDate}
                onChange={setSelectedDate}
                showButtons={false}
                className="w-full"
              />

              <Select
                selectedKey={selectedPerson}
                placeholder="Select Person"
                items={peopleItems}
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

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4 lg:gap-0">
              {isLoading ? (
                <p className="text-tertiary py-8 text-center">Loading...</p>
              ) : capturedHistory.length === 0 ? (
                <p className="text-tertiary py-8 text-center">No captures found</p>
              ) : (
                capturedHistory.map((item) => (
                  <CapturedPersonItem
                    onClick={() => handleHistoryClick(item)}
                    key={item.id}
                    name={item.profile?.name || 'Unknown Person'}
                    time={formatTime(item.created_at)}
                    date={formatDate(item.created_at)}
                    imageUrl={buildImageUrl(item.imageCaptured)}
                    isUnknown={!item.profile}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <CapturedDetails
          isDescOpen={isDescOpen}
          setIsDescOpen={setIsDescOpen}
          item={selectedHistoryItem}
          onClose={handleHistoryClose}
        />
      </>
    </Section>
  );
}
