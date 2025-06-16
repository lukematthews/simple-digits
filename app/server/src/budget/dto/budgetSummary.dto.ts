import { Expose } from "class-transformer";

export class BudgetSummaryDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    shortCode: string;
}