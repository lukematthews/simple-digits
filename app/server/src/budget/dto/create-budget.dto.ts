import { MonthDto } from "@/month/dto/month.dto";
import { IsString } from "class-validator";

export class CreateBudgetDto {
    @IsString()
    name: string;
    @IsString()
    shortCode: string;
    months?: MonthDto[];
}