import { Expose } from "class-transformer";

export class MonthSummary {
    @Expose()
    id: string;

    @Expose()
    shortCode: string;

    @Expose()
    name: string;

    @Expose()
    position: number;

    @Expose()
    startingBalance: number;

    @Expose()
    closingBalance: number;
}