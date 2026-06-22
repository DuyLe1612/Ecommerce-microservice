import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewDto, VoteReviewDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reviews')
@Controller('products/:productId/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // ─────────────────────────────────────────────
  // GET /api/products/:productId/reviews
  // ─────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Get all approved reviews for a product' })
  @ApiParam({ name: 'productId', type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'verifiedOnly', required: false, type: Boolean })
  async getProductReviews(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('verifiedOnly') verifiedOnly?: string,
  ) {
    const data = await this.reviewService.getProductReviews(
      productId,
      parseInt(page) || 1,
      parseInt(pageSize) || 20,
      verifiedOnly === 'true' ? true : verifiedOnly === 'false' ? false : undefined,
    );
    return { success: true, data };
  }

  // ─────────────────────────────────────────────
  // GET /api/products/:productId/reviews/summary
  // ─────────────────────────────────────────────
  @Get('summary')
  @ApiOperation({ summary: 'Get rating summary for a product' })
  @ApiParam({ name: 'productId', type: Number })
  async getReviewSummary(@Param('productId', ParseIntPipe) productId: number) {
    const data = await this.reviewService.getReviewSummary(productId);
    return { success: true, data };
  }

  // ─────────────────────────────────────────────
  // GET /api/products/:productId/reviews/can-review
  // ─────────────────────────────────────────────
  @Get('can-review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if current user can review this product' })
  @ApiParam({ name: 'productId', type: Number })
  async canReview(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() user: any,
  ) {
    const data = await this.reviewService.canReview(productId, user);
    return { success: true, data };
  }

  // ─────────────────────────────────────────────
  // POST /api/products/:productId/reviews
  // ─────────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for a product' })
  @ApiParam({ name: 'productId', type: Number })
  async createReview(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: any,
    @Request() req: any,
  ) {
    const token = req.headers.authorization?.split(' ')[1] || '';
    const data = await this.reviewService.createReview(productId, dto, user, token);
    return { success: true, message: 'Review submitted successfully, pending moderation', data };
  }

  // ─────────────────────────────────────────────
  // PUT /api/products/:productId/reviews/:reviewId
  // ─────────────────────────────────────────────
  @Put(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update your own review' })
  @ApiParam({ name: 'productId', type: Number })
  @ApiParam({ name: 'reviewId', type: Number })
  async updateReview(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.reviewService.updateReview(productId, reviewId, dto, user);
    return { success: true, message: 'Review updated successfully', data };
  }

  // ─────────────────────────────────────────────
  // DELETE /api/products/:productId/reviews/:reviewId
  // ─────────────────────────────────────────────
  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete your own review' })
  @ApiParam({ name: 'productId', type: Number })
  @ApiParam({ name: 'reviewId', type: Number })
  async deleteReview(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @CurrentUser() user: any,
  ) {
    await this.reviewService.deleteReview(productId, reviewId, user);
    return { success: true, message: 'Review deleted successfully', data: true };
  }

  // ─────────────────────────────────────────────
  // POST /api/products/:productId/reviews/:reviewId/vote
  // ─────────────────────────────────────────────
  @Post(':reviewId/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vote a review as helpful or not helpful' })
  @ApiParam({ name: 'productId', type: Number })
  @ApiParam({ name: 'reviewId', type: Number })
  async voteReview(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() dto: VoteReviewDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.reviewService.voteReview(productId, reviewId, dto, user);
    return { success: true, message: 'Vote recorded', data };
  }
}
