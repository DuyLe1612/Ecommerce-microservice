import { Controller, Get, Query, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LocationService } from './location.service';

@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('provinces')
  @ApiOperation({ summary: 'Get provinces' })
  getProvinces() {
    return this.locationService.getProvinces();
  }

  @Get('districts')
  @ApiOperation({ summary: 'Get districts by province code' })
  getDistricts(@Query('provinceCode') provinceCode: number) {
    return this.locationService.getDistricts(provinceCode);
  }

  @Get('wards')
  @ApiOperation({ summary: 'Get wards by district code' })
  getWards(@Query('districtCode') districtCode: number) {
    return this.locationService.getWards(districtCode);
  }
}