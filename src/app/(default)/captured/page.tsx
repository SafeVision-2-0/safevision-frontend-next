// src/app/(default)/captured/page.tsx
'use client';

import Section from '@/components/layout/section';
import Heading from '@/components/layout/heading';
import { Select } from '@/components/base/select/select';
import { User01 } from '@untitledui/icons';
import { getLocalTimeZone, today } from '@internationalized/date';
import { Suspense, useEffect, useState } from 'react';
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
import CapturedClient from '@/app/(default)/captured/_components/captured-client';

export default function Captured() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CapturedClient />
    </Suspense>
  );
}
