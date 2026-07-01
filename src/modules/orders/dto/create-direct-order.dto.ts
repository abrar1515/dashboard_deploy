import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

export class CreateDirectOrderDto {
  @IsUUID()
  @IsNotEmpty()
  deliveryInfoId: string;

  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsUUID()
  @IsNotEmpty()
  priceTagId: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  quantity: number;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  paymentId?: string;
}