import { useState, useCallback, useMemo } from 'react';
import { getWeekStart, getWeekEnd, getWeekNumber, formatWeekStart, formatDateRange } from '@/lib/utils';

export function useWeekNavigator() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart());

  const goToPrevWeek = useCallback(() => {
    setCurrentWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeekStart(getWeekStart());
  }, []);

  const weekInfo = useMemo(() => {
    const weekEnd = getWeekEnd(currentWeekStart);
    return {
      weekStart: formatWeekStart(currentWeekStart),
      weekEnd: formatWeekStart(weekEnd),
      weekNumber: getWeekNumber(currentWeekStart),
      dateRange: formatDateRange(currentWeekStart, weekEnd),
    };
  }, [currentWeekStart]);

  return {
    currentWeekStart,
    ...weekInfo,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
  };
}
