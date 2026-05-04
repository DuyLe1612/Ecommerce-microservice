import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class AddressDto {
  @IsString() @IsNotEmpty()
  recipientName: string;

  @IsString() @IsNotEmpty()
  phoneNumber: string;

  @IsString() @IsNotEmpty()
  addressLine: string;

  @IsNumber()
  provinceCode: number;

  @IsString() @IsNotEmpty()
  provinceName: string;

  @IsNumber()
  districtCode: number;

  @IsString() @IsNotEmpty()
  districtName: string;

  @IsNumber()
  wardCode: number;

  @IsString() @IsNotEmpty()
  wardName: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}