import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, Min, ValidateNested } from 'class-validator';

export class SyncCartItemDto {
  @IsNotEmpty()
  product: string;

  @IsNotEmpty()
  priceTag: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class SyncCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncCartItemDto)
  data: SyncCartItemDto[];
}
