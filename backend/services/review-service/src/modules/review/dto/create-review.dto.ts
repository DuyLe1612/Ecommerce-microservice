import { IsInt, IsString, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ minLength: 10, maxLength: 2000, example: 'Great product, highly recommend!' })
  @IsString()
  @MinLength(10, { message: 'Comment must be between 10 and 2000 characters' })
  @MaxLength(2000, { message: 'Comment must be between 10 and 2000 characters' })
  comment: string;
}
