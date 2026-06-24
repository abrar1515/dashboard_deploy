import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AdminPriceTagDto {
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Type(() => Number)
  price: number;
}
