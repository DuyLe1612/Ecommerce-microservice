import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin Reviews')
@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─────────────────────────────────────────────
  // GET /api/admin/reviews/product/:productId
  // ─────────────────────────────────────────────
  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all reviews (any status) for a product — Admin only' })
  @ApiParam({ name: 'productId', type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getProductReviews(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ) {
    const data = await this.adminService.getProductReviews(
      productId,
      parseInt(page) || 1,
      parseInt(pageSize) || 20,
    );
    return { success: true, data };
  }

  // ─────────────────────────────────────────────
  // PATCH /api/admin/reviews/:reviewId/approve
  // ─────────────────────────────────────────────
  @Patch(':reviewId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a review — Admin only' })
  @ApiParam({ name: 'reviewId', type: Number })
  async approveReview(@Param('reviewId', ParseIntPipe) reviewId: number) {
    const data = await this.adminService.approveReview(reviewId);
    return { success: true, message: 'Review approved successfully', data };
  }

  // ─────────────────────────────────────────────
  // PATCH /api/admin/reviews/:reviewId/reject
  // ─────────────────────────────────────────────
  @Patch(':reviewId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a review — Admin only' })
  @ApiParam({ name: 'reviewId', type: Number })
  async rejectReview(@Param('reviewId', ParseIntPipe) reviewId: number) {
    const data = await this.adminService.rejectReview(reviewId);
    return { success: true, message: 'Review rejected successfully', data };
  }
}
