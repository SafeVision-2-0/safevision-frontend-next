// src/app/(default)/captured/page.tsx
'use client';

import Section from '@/components/layout/section';
import Heading from '@/components/layout/heading';
import { Select } from '@/components/base/select/select';
import { User01 } from '@untitledui/icons';
import { getLocalTimeZone, today } from '@internationalized/date';
import { useEffect, useState } from 'react';
import { DateValue } from 'react-aria-components';
import { DatePicker } from '@/components/application/date-picker/date-picker';
import * as Paginations from '@/components/application/pagination/pagination';
import CapturedDetails from '@/components/custom/captured-details';
import { Person } from '@/types/person';
import { getHistory, HistoryItem } from '@/lib/api/history';
import { getPeople } from '@/lib/api/people';
import { buildImageUrl } from '@/lib/helpers/format';
import { Meta } from '@/types/global';
import { useSearchParams } from 'next/navigation';

export default function CapturedClient() {
  const now = today(getLocalTimeZone());

  const searchParams = useSearchParams();
  const person = searchParams.get('person');

  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string>(person ?? 'all');
  const [selectedDate, setSelectedDate] = useState<DateValue | null>(now);
  const [capturedHistory, setCapturedHistory] = useState<HistoryItem[]>([]);
  const [capturedMeta, setCapturedMeta] = useState<Meta>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

  // Pagination (keeping UI, though API logic from camera page is strictly used)
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPerson, selectedDate]);

  // Fetch history based on filters
  useEffect(() => {
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
          page: currentPage,
          limit: perPage,
          // page: currentPage // Assuming API supports pagination if needed later
        });
        setCapturedMeta(response.meta);
        setCapturedHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
        setCapturedHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [selectedDate, selectedPerson, currentPage]);

  const handleHistoryClick = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setIsDescOpen(true);
  };

  const handleHistoryClose = () => {
    setSelectedHistoryItem(null);
    setIsDescOpen(false);
  };

  const peopleItems = [
    { label: 'All People', id: 'all' },
    { label: 'Unknown', id: 'unknown' },
    ...people.map((person) => ({
      label: person.name,
      id: String(person.id),
    })),
  ];

  return (
    <Section>
      <div className="flex w-full flex-col">
        <Heading className="mb-4">Captured People</Heading>

        <div className="flex w-full flex-col gap-3 sm:max-w-100 sm:flex-row">
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

        <div className="my-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {isLoading ? (
            <p className="col-span-full py-8 text-center text-gray-500">Loading...</p>
          ) : capturedHistory.length === 0 ? (
            <p className="col-span-full py-8 text-center text-gray-500">No captures found</p>
          ) : (
            capturedHistory.map((item) => (
              <img
                key={item.id}
                className="aspect-video w-full cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-90"
                src={buildImageUrl(item.imageCaptured)}
                alt={item.profile?.name || 'Unknown Person'}
                onClick={() => handleHistoryClick(item)}
              />
            ))
          )}
        </div>

        <Paginations.PaginationPageMinimalCenter
          page={currentPage}
          total={capturedMeta?.totalPages ?? 0}
          onPageChange={setCurrentPage}
        />

        <CapturedDetails
          isDescOpen={isDescOpen}
          setIsDescOpen={setIsDescOpen}
          item={selectedHistoryItem}
          onClose={handleHistoryClose}
        />
      </div>
    </Section>
  );
}
