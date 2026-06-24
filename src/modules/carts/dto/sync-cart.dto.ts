import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';

export class SyncCartItemDto {
  @IsNotEmpty()
  product: string;

  @IsNotEmpty()
  priceTag: string;
}

export class SyncCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncCartItemDto)
  data: SyncCartItemDto[];
}
