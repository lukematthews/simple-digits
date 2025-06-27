import { Expose } from "class-transformer";
import { MonthSummary } from "./MonthSummary.dto";

export class BudgetSummaryDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    shortCode: string;

    @Expose()
    monthSummaries: MonthSummary[];
}