import { Controller, Get, Post, Put, Delete, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { AddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Profile Addresses')
@Controller('profile/addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AddressController {
    constructor(private readonly addressService: AddressService) { }

    @Get()
    @ApiOperation({ summary: 'Get addresses' })
    async getAddresses(@Request() req: { user: { id: string } }) {
        const data = await this.addressService.getAddresses(req.user.id);
        return data;
    }

    @Post()
    @ApiOperation({ summary: 'Create new address' })
    async createAddress(@Request() req: { user: { id: string } }, @Body() dto: AddressDto) {
        const data = await this.addressService.createAddress(req.user.id, dto);
        return data;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update address' })
    async updateAddress(
        @Request() req: { user: { id: string } },
        @Param('id') id: string,
        @Body() dto: AddressDto
    ) {
        const data = await this.addressService.updateAddress(req.user.id, Number(id), dto);
        return data;
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete address' })
    async deleteAddress(@Request() req: { user: { id: string } }, @Param('id') id: string) {
        await this.addressService.deleteAddress(req.user.id, Number(id));
        return true;
    }

    @Patch(':id/default')
    @ApiOperation({ summary: 'Set address as default' })
    async setDefaultAddress(@Request() req: { user: { id: string } }, @Param('id') id: string) {
        await this.addressService.setDefaultAddress(req.user.id, Number(id));
        return true;
    }
}