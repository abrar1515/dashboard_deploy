import { IsNotEmpty } from 'class-validator';

export class AddToCartDto {
  @IsNotEmpty()
  product: string;

  @IsNotEmpty()
  priceTag: string;
}
