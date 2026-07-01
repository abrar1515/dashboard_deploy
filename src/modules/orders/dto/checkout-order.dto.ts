import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

export class CheckoutOrderDto {
  @IsUUID()
  @IsNotEmpty()
  deliveryInfoId: string;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  paymentId?: string;
}