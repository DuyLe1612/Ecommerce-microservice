import { IsInt, IsOptional, IsString, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 5, example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ minLength: 10, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Comment must be between 10 and 2000 characters' })
  @MaxLength(2000, { message: 'Comment must be between 10 and 2000 characters' })
  comment?: string;
}
