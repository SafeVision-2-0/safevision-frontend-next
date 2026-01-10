'use client';

import { useState } from 'react';
import { Key } from 'react-aria-components';
import Heading from '@/components/layout/heading';
import Section from '@/components/layout/section';
import { NativeSelect } from '@/components/base/select/select-native';
import { Tabs } from '@/components/application/tabs/tabs';
import { PeopleTable } from './_components/people-table';
import { TeamTable } from './_components/team-table';
import { PositionTable } from './_components/position-table';
import * as Modals from "@/components/application/modals/modal";
import { Cake, Calendar, Clock, IdCard, Mars, Users, X as Close } from 'lucide-react';
import {Avatar} from "@/components/base/avatar/avatar";

const tabs = [
  { id: 'people', label: 'People' },
  { id: 'teams', label: 'Teams' },
  { id: 'positions', label: 'Positions' },
];

export default function Data() {
  const [selectedTabIndex, setSelectedTabIndex] = useState<Key>('people');

  const renderTable = () => {
    if (selectedTabIndex === "people") return <PeopleTable />
    if (selectedTabIndex === "teams") return <TeamTable />
    if (selectedTabIndex === "positions") return <PositionTable />
    throw new Error("Invalid tab index: " + selectedTabIndex + "")
  }

  return (
    <Section>
      <div className="flex w-full flex-col">
        <Heading className="mb-8">Manage Data</Heading>

        <div>
          <NativeSelect
            aria-label="Tabs"
            value={selectedTabIndex as string}
            onChange={(event) => setSelectedTabIndex(event.target.value)}
            options={tabs.map((tab) => ({ label: tab.label, value: tab.id }))}
            className="w-80 md:hidden"
          />
          <Tabs
            selectedKey={selectedTabIndex}
            onSelectionChange={setSelectedTabIndex}
            className="w-max max-md:hidden"
          >
            <Tabs.List type="button-minimal" items={tabs}>
              {(tab) => <Tabs.Item {...tab} />}
            </Tabs.List>
          </Tabs>
        </div>

        <div className="mt-4">
          { renderTable() }
        </div>
      </div>
    </Section>
  );
}
