import { parseAbsoluteToLocal } from '@internationalized/date';

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';

  return parseAbsoluteToLocal(dateString).toDate().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
