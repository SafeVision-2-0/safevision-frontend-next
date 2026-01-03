'use client';

import Image from 'next/image';
import { Button } from '@/components/base/buttons/button';
import { Check } from '@untitledui/icons';
import { useState } from 'react';
import { getLocalTimeZone, today } from '@internationalized/date';
import { DatePicker } from '@/components/application/date-picker/date-picker';
import { DateValue } from 'react-aria-components';

const now = today(getLocalTimeZone());

export default function Test() {
  const [value, setValue] = useState<DateValue | null>(now);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      hello
      <Button color="primary" size="md" iconLeading={<Check data-icon />}>
        Publish now
      </Button>
      <DatePicker aria-label="Date picker" value={value} onChange={setValue} />
    </div>
  );
}
