import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddToCartDto {
  @IsNotEmpty()
  product: string;

  @IsNotEmpty()
  priceTag: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}
