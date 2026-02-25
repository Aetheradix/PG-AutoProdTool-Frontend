import {
    useGetBprPdrQuery
} from '../../../store/api/masterDataApi';
import { StandardDataTable } from './StandardDataTable';

export function BPRPDRTable() {
    return (
        <StandardDataTable
            useGetQuery={useGetBprPdrQuery}
            title="BPR-PDR"
            searchPlaceholder="Search BPR-PDR..."
            readOnly={true}
        />
    );
}

export default BPRPDRTable;
