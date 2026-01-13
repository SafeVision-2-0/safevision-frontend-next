import { parseAbsoluteToLocal } from '@internationalized/date';

export const formatDate = (dateString: string): string => {
  return parseAbsoluteToLocal(dateString).toDate().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
