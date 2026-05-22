/**
 * Helper to calculate the number of working days (Mon-Fri) between two dates.
 * It is inclusive of both start and end dates.
 */
export function calculateWorkingDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (start > end) return 0;
  
  let count = 0;
  // Create a copy of start date to iterate
  const curDate = new Date(start.getTime());
  
  // Set time of curDate and end to midnight to avoid potential DST offsets causing infinite loop
  curDate.setHours(0, 0, 0, 0);
  const endTime = new Date(end.getTime());
  endTime.setHours(0, 0, 0, 0);
  
  while (curDate <= endTime) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sundays (0) and Saturdays (6)
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  
  return count;
}

/**
 * Check if two date ranges overlap.
 */
export function doRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return aStart <= bEnd && bStart <= aEnd;
}
