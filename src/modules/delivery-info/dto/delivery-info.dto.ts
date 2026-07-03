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

  @IsOptional()
  addressLineTwo?: string;

  @IsNotEmpty()
  city: string;

  @IsOptional()
  zipCode?: string;

  @IsNotEmpty()
  contactNumber: string;
}
