import { File } from "lucide-react";
import { Download } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Props for the ReportCardItem component
 * Displays a card for a report with view and export options
 */
export interface ReportCardItemProps {
    /** Title of the report */
    title: string;
    /** Description of the report */
    description: string;
    /** Icon to display for the report */
    icon: React.ReactNode;
    /** Callback function when the view button is clicked */
    onView: () => void;
    /** Optional callback function when the export to Excel button is clicked */
    onExportExcel?: (() => void) | undefined;
}

export const ReportCardItem = ({ title, description, icon, onView, onExportExcel }: ReportCardItemProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="relative flex flex-col p-6 border rounded-xl shadow-sm bg-white hover:shadow-md transition-all duration-200 min-h-48"
        >
            <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    {icon}
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800 mb-1">{title}</h2>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
            </div>
            <div className="mt-auto flex justify-center gap-2 pt-4">
                <button
                    onClick={onView}
                    className="inline-flex items-center justify-center h-9 px-4 text-lg btn btn-success font-medium text-white rounded-lg transition-colors min-w-[100px]"
                >
                    <File size={16} className="mr-2" />
                    Lihat
                </button>
                {onExportExcel && (
                    <button
                        onClick={onExportExcel}
                        className="inline-flex items-center justify-center h-9 px-4 text-lg btn btn-outline-success font-medium rounded-lg transition-colors min-w-[100px] border border-green-600 text-green-700 bg-white hover:bg-green-50"
                    >
                        <Download size={16} className="mr-2" />
                        .xlsx
                    </button>
                )}
            </div>
        </motion.div>
    );
}; 