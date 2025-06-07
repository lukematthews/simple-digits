import { MonthDto } from "@/month/dto/month.dto";
import { IsString } from "class-validator";

export class CreateBudgetDto {
    @IsString()
    name: string;
    months?: MonthDto[];
}