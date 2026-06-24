import { IsNotEmpty, IsOptional } from 'class-validator';

export class DeliveryInfoDto {
  @IsOptional()
  _id?: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  addressLineOne: string;

  @IsNotEmpty()
  addressLineTwo: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  zipCode: string;

  @IsNotEmpty()
  contactNumber: string;
}
