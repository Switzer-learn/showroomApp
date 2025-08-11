import { useEffect } from "react";
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export interface DateRange {
    startDate: string;
    endDate: string;
}

interface DateRangeSelectorProps {
    dateRange: DateRange;
    onDateChange: (range: DateRange) => void;
}

const theme = createTheme({
    palette: {
        primary: { main: '#2563eb' }, // Tailwind blue-600
        secondary: { main: '#facc15' }, // Tailwind yellow-400
        background: { default: '#fff' },
        text: { primary: '#111827' }, // Tailwind gray-900
    },
});

export const DateRangeSelector = ({ dateRange, onDateChange }: DateRangeSelectorProps) => {
    // Set default date range on component mount
    useEffect(() => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const defaultRange: DateRange = {
            startDate: firstDayOfMonth.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
        };

        // Only update if the current range is different from default
        if (dateRange.startDate !== defaultRange.startDate || dateRange.endDate !== defaultRange.endDate) {
            onDateChange(defaultRange);
        }
    }, []); // Empty dependency array means this runs only once on mount


    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <MobileDatePicker
                            value={new Date(dateRange.startDate)}
                            onChange={date => {
                                if (!date) return;
                                const newStartDate = date.toISOString().split('T')[0];
                                const currentEndDate = dateRange.endDate;

                                if (newStartDate > currentEndDate) {
                                    // Rule 2: new start is after end → set end = start
                                    onDateChange({ startDate: newStartDate, endDate: newStartDate });
                                } else {
                                    onDateChange({ ...dateRange, startDate: newStartDate });
                                }
                            }}
                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <MobileDatePicker
                            value={new Date(dateRange.endDate)}
                            onChange={date => {
                                if (!date) return;
                                const newEndDate = date.toISOString().split('T')[0];
                                const currentStartDate = dateRange.startDate;

                                if (newEndDate < currentStartDate) {
                                    // Rule 1: new end is before start → set start = end
                                    onDateChange({ startDate: newEndDate, endDate: newEndDate });
                                } else {
                                    onDateChange({ ...dateRange, endDate: newEndDate });
                                }
                            }}
                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                        />
                    </div>
                </div>
            </LocalizationProvider>
        </ThemeProvider>
    );
}; 