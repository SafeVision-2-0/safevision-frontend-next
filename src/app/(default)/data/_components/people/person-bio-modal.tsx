import React, { useEffect, useState } from 'react';
import { DateValue } from 'react-aria-components';
import { Mars, Venus } from 'lucide-react';
import { parseDate } from '@internationalized/date';
import Form from '../form';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { Label } from '@/components/base/input/label';
import { DatePicker } from '@/components/application/date-picker/date-picker';
import { createPerson, updatePerson } from '@/lib/api/people';
import { validatePersonName, validateBirthdate } from '@/utils/validation';

interface PersonBioModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personToEdit: any | null; // Pass the full person object if editing
  onSuccess: (newPersonId: string) => void;
}

const GENDERS = [
  { label: 'Male', id: 'M', icon: Mars },
  { label: 'Female', id: 'F', icon: Venus },
];

export function PersonBioModal({
  isOpen,
  onOpenChange,
  personToEdit,
  onSuccess,
}: PersonBioModalProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<string>('M');
  const [birth, setBirth] = useState<DateValue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [birthError, setBirthError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      if (personToEdit) {
        setName(personToEdit.name);
        setGender(personToEdit.gender);
        console.log(personToEdit);
        try {
          if (personToEdit.birth) {
            const raw = personToEdit.birth;
            const dateStr =
              typeof raw === 'string'
                ? raw.slice(0, 10) // "2026-01-01T...Z" -> "2026-01-01"
                : new Date(raw).toISOString().slice(0, 10);
            setBirth(parseDate(dateStr));
          }
          console.log(personToEdit);
        } catch (e) {
          console.error(e);
        }
      } else {
        // Reset for create mode
        setName('');
        setGender('M');
        setBirth(null);
      }
      // Clear errors when modal opens
      setNameError(undefined);
      setBirthError(undefined);
    }
  }, [isOpen, personToEdit]);

  const handleNameChange = (value: string) => {
    setName(value);
    // Clear error when user starts typing
    if (nameError) {
      setNameError(undefined);
    }
  };

  const handleBirthChange = (value: DateValue | null) => {
    setBirth(value);
    // Clear error when user changes date
    if (birthError) {
      setBirthError(undefined);
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate name
    const nameValidation = validatePersonName(name);
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error);
      isValid = false;
    }

    // Validate birthdate
    // DateValue.toString() returns ISO format (YYYY-MM-DD)
    const birthValidation = validateBirthdate(birth ? birth.toString() : null);
    if (!birthValidation.isValid) {
      setBirthError(birthValidation.error);
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        gender,
        birth: birth ? birth.toString() : '',
      };

      let resId;
      if (personToEdit) {
        await updatePerson(String(personToEdit.id), payload);
        resId = String(personToEdit.id);
      } else {
        const res = await createPerson(payload);
        resId = String(res.data.id);
      }
      onSuccess(resId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={personToEdit ? 'Edit Person' : 'Add Person'}
      buttonLabel={personToEdit ? 'Update' : 'Create'}
      onSave={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <div className="flex w-full flex-col gap-4">
        <Input
          isRequired
          label="Name"
          className="w-full"
          value={name}
          onChange={handleNameChange}
          isInvalid={!!nameError}
          hint={nameError}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            isRequired
            selectedKey={gender}
            placeholder="Select Gender"
            items={GENDERS}
            label="Gender"
            onSelectionChange={(k) => setGender(k as string)}
          >
            {(item) => (
              <Select.Item id={item.id} icon={item.icon}>
                {item.label}
              </Select.Item>
            )}
          </Select>
          <div className="flex flex-col gap-1.5">
            <Label isRequired>Birth Date</Label>
            <DatePicker
              aria-label="Birth Date"
              value={birth}
              onChange={handleBirthChange}
              className="w-full"
              isInvalid={!!birthError}
            />
            {birthError && (
              <p className="text-xs text-red-500">{birthError}</p>
            )}
          </div>
        </div>
      </div>
    </Form>
  );
}
