import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, Min, ValidateNested } from 'class-validator';

export class CreateOrderItemDto {
  @IsOptional()
  _id?: string;

  @IsNotEmpty()
  product: string;

  @IsNotEmpty()
  priceTag: string;

  @IsInt()
  @Min(1)
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

  @IsOptional()
  @Type(() => Number)
  discount?: number;
}
