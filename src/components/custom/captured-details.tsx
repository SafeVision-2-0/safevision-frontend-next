'use client';

import * as Modals from '@/components/application/modals/modal';
import Heading from '@/components/layout/heading';
import { Cake, Calendar, Clock, IdCard, Mars, Users, Venus, X as Close } from 'lucide-react';
import { Avatar } from '@/components/base/avatar/avatar';
import { HistoryItem } from '@/lib/api/history';
import { buildImageUrl, formatDate, formatTime, getInitials } from '@/lib/helpers/format';
import { useEffect, useState } from 'react';
import { getPeople, getPerson } from '@/lib/api/people';
import { Person } from '@/types/person';

interface CapturedDetailsProps {
  isDescOpen: boolean;
  setIsDescOpen: (isOpen: boolean) => void;
  item?: HistoryItem | null;
  onClose?: () => void;
}

export default function CapturedDetails({
  isDescOpen,
  setIsDescOpen,
  item,
  onClose,
}: CapturedDetailsProps) {
  const [person, setPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    console.log('close');
    setPerson(null);
    onClose?.();
    setIsDescOpen(false);
  };

  useEffect(() => {
    console.log('is opened');
    // console.log(!isDescOpen);
    // console.log(item?.profile);
    if (!isDescOpen || !item?.profile) return;
    console.log('is fething');

    const fetchPerson = async () => {
      setIsLoading(true);
      try {
        const response = await getPerson(item!.profile!.id);
        setPerson(response.data);
      } catch (error) {
        console.error('Failed to fetch people:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerson();
  }, [isDescOpen]);

  return (
    <Modals.DialogTrigger isOpen={isDescOpen} onOpenChange={setIsDescOpen}>
      <Modals.ModalOverlay>
        <Modals.Modal>
          <Modals.Dialog className="mx-auto grid max-w-225 grid-cols-1 gap-4 rounded-2xl bg-zinc-50 p-8 lg:grid-cols-3 lg:gap-10 dark:bg-black">
            <div className="mb-4 flex items-center justify-between lg:hidden" aria-hidden="true">
              <Heading>Details</Heading>
              <span onClick={handleClose}>
                <Close className="cursor-pointer" />
              </span>
            </div>
            <div className={'lg:col-span-2'}>
              {item?.imageCaptured && (
                <img
                  src={buildImageUrl(item.imageCaptured)}
                  className="aspect-video w-full rounded-lg object-cover"
                  alt="Captured Image"
                />
              )}
            </div>
            <div className="flex min-h-full flex-col">
              <div className="mb-4 hidden items-center justify-between lg:flex" aria-hidden="true">
                <Heading>Details</Heading>
                <Close className="cursor-pointer" onClick={handleClose} />
              </div>
              <div className="mt-4 flex items-center">
                <Avatar
                  size="xl"
                  alt="Profile Picture"
                  initials={!item?.profile ? '?' : getInitials(item?.profile?.name)}
                  className="shrink-0"
                />
                <span className="ml-4 flex-1 truncate">
                  {item?.profile?.name ?? 'Unknown Person'}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-0.5 text-sm">
                <h2 className="text-gray-500">Spotted</h2>
                <span className="flex items-center gap-2">
                  <Clock width={15} />
                  <span>{item?.created_at ? formatTime(item?.created_at) : ''}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Calendar width={15} />
                  <span>{item?.created_at ? formatDate(item?.created_at) : ''}</span>
                </span>
              </div>

              <div className="mt-4 flex flex-1 flex-col gap-0.5 text-sm">
                {!!person && (
                  <>
                    <h2 className="text-gray-500">Information</h2>
                    <span className="flex items-center gap-2">
                      {person?.gender === 'F' ? <Venus width={15} /> : <Mars width={15} />}
                      <span>
                        {person?.gender === 'M' ? 'Male' : person?.gender === 'F' ? 'Female' : '-'}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Cake width={15} />
                      <span>{person?.birth && formatDate(person?.birth)}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Users width={15} />
                      <span>
                        {person?.team.map((team, i) => (
                          <span key={team.id}>
                            {team.name}
                            {i !== person?.team.length - 1 && ', '}
                          </span>
                        ))}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <IdCard width={15} />
                      <span>
                        {person?.position.map((position, i) => (
                          <span key={position.id}>
                            {position.name}
                            {i !== person?.position.length - 1 && ', '}
                          </span>
                        ))}
                      </span>
                    </span>
                  </>
                )}
              </div>

            </div>
          </Modals.Dialog>
        </Modals.Modal>
      </Modals.ModalOverlay>
    </Modals.DialogTrigger>
  );
}
