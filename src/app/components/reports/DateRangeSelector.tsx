import { useEffect } from "react";

/**
 * Date range interface
 * Represents a date range with start and end dates
 */
export interface DateRange {
  /** Start date in YYYY-MM-DD format */
  startDate: string;
  /** End date in YYYY-MM-DD format */
  endDate: string;
}

/**
 * Props for the DateRangeSelector component
 * Allows users to select a date range with start and end dates
 */
interface DateRangeSelectorProps {
  /** Current date range */
  dateRange: DateRange;
  /** Callback function when date range changes */
  onDateChange: (range: DateRange) => void;
}

export const DateRangeSelector = ({ dateRange, onDateChange }: DateRangeSelectorProps) => {
  // Set default date range on component mount
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const defaultRange: DateRange = {
      startDate: firstDayOfMonth.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };

    // Only update if the current range is different from default
    if (dateRange.startDate !== defaultRange.startDate || dateRange.endDate !== defaultRange.endDate) {
      onDateChange(defaultRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const onStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    const currentEndDate = dateRange.endDate;

    if (!newStartDate) return;
    if (newStartDate > currentEndDate) {
      // Rule 2: new start after end → set end = start
      onDateChange({ startDate: newStartDate, endDate: newStartDate });
    } else {
      onDateChange({ ...dateRange, startDate: newStartDate });
    }
  };

  const onEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    const currentStartDate = dateRange.startDate;

    if (!newEndDate) return;
    if (newEndDate < currentStartDate) {
      // Rule 1: new end before start → set start = end
      onDateChange({ startDate: newEndDate, endDate: newEndDate });
    } else {
      onDateChange({ ...dateRange, endDate: newEndDate });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div>
        <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
        <input
          type="date"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={dateRange.startDate}
          onChange={onStartChange}
          aria-label="Tanggal mulai"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tanggal Akhir</label>
        <input
          type="date"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={dateRange.endDate}
          onChange={onEndChange}
          aria-label="Tanggal akhir"
        />
      </div>
    </div>
  );
};