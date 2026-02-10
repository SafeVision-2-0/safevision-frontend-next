/**
 * Validation utilities for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a person's name
 * - Must not be empty
 * - Must not contain emojis
 * - Must not contain special characters (only letters, spaces, hyphens, and apostrophes allowed)
 * - Must be between 1 and 100 characters
 */
export function validatePersonName(name: string): ValidationResult {
  if (!name || !name.trim()) {
    return {
      isValid: false,
      error: 'Name is required',
    };
  }

  const trimmedName = name.trim();

  // Check length
  if (trimmedName.length < 1 || trimmedName.length > 100) {
    return {
      isValid: false,
      error: 'Name must be between 1 and 100 characters',
    };
  }

  // Check for emojis using Unicode ranges
  // This regex matches emoji characters
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

  if (emojiRegex.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Name cannot contain emojis',
    };
  }

  // Check for allowed characters: letters (including international), spaces, hyphens, apostrophes, and dots
  // \p{L} matches any kind of letter from any language
  // \p{M} matches combining marks (for accented characters)
  const allowedCharsRegex = /^[\p{L}\p{M}\s.'-]+$/u;

  if (!allowedCharsRegex.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Name can only contain letters, spaces, hyphens, apostrophes, and dots',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validates a birthdate
 * - Must be a valid date
 * - Must be in the past
 * - Person must be at least 1 day old
 * - Person must not be older than 150 years
 */
export function validateBirthdate(birthdate: string | null | undefined): ValidationResult {
  if (!birthdate || birthdate.trim() === '') {
    return {
      isValid: false,
      error: 'Birth date is required',
    };
  }

  // Parse the date string
  let date: Date;
  try {
    // Handle ISO date format (YYYY-MM-DD)
    date = new Date(birthdate);
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: 'Invalid date format',
      };
    }
  } catch {
    return {
      isValid: false,
      error: 'Invalid date format',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const birthDate = new Date(date);
  birthDate.setHours(0, 0, 0, 0);

  // Check if date is in the future
  if (birthDate >= today) {
    return {
      isValid: false,
      error: 'Birth date must be in the past',
    };
  }

  // Check minimum age (at least 1 day old)
  const oneDayAgo = new Date(today);
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  if (birthDate > oneDayAgo) {
    return {
      isValid: false,
      error: 'Person must be at least 1 day old',
    };
  }

  // Check maximum age (150 years)
  const maxAge = 150;
  const minDate = new Date(today);
  minDate.setFullYear(minDate.getFullYear() - maxAge);

  if (birthDate < minDate) {
    return {
      isValid: false,
      error: `Birth date cannot be more than ${maxAge} years ago`,
    };
  }

  return {
    isValid: true,
  };
}
