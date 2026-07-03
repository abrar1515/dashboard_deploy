import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(4)
  orderStatus: number;
}
