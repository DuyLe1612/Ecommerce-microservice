import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VoteReviewDto {
  @ApiProperty({ enum: ['helpful', 'not_helpful'] })
  @IsIn(['helpful', 'not_helpful'])
  voteType: 'helpful' | 'not_helpful';
}
