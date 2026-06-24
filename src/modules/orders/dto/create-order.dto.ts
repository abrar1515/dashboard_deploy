import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';

export class CreateOrderItemDto {
  @IsOptional()
  _id?: string;

  @IsNotEmpty()
  product: string;

  @IsNotEmpty()
  priceTag: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Type(() => Number)
  quantity: number;
}

export class CreateOrderDto {
  @IsOptional()
  _id?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];

  @IsNotEmpty()
  deliveryInfo: string;

  @IsNumber()
  @Type(() => Number)
  discount: number;
}
