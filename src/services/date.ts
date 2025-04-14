/**
 * Represents the current day of the week.
 */
export interface DayOfWeek {
  /**
   * The current day of the week.
   */
  day: string;
}

/**
 * Asynchronously retrieves the current day of the week.
 *
 * @returns A promise that resolves to a DayOfWeek object containing the current day.
 */
export async function getDayOfWeek(): Promise<DayOfWeek> {
  // TODO: Implement this by calling an API.

  return {
    day: 'Monday',
  };
}
