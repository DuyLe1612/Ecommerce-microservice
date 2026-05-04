import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Province, District, Ward } from './entities/location.entity';

@Injectable()
export class LocationService implements OnModuleInit {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @InjectRepository(Province) private provinceRepo: Repository<Province>,
    @InjectRepository(District) private districtRepo: Repository<District>,
    @InjectRepository(Ward) private wardRepo: Repository<Ward>,
  ) {}

  async onModuleInit() {
    const count = await this.provinceRepo.count();
    if (count === 0) {
      this.logger.log('Data is empty, starting import...');
      await this.importLocations();
    }
  }

  async importLocations() {
    try {
      const response = await axios.get('https://provinces.open-api.vn/api/?depth=3');
      const provincesData = response.data;

      for (const p of provincesData) {
        const province = this.provinceRepo.create({ code: p.code, name: p.name });
        await this.provinceRepo.save(province);

        for (const d of p.districts) {
          const district = this.districtRepo.create({ 
            code: d.code, 
            name: d.name, 
            provinceCode: p.code 
          });
          await this.districtRepo.save(district);

          const wardEntities = d.wards.map(w => ({
            code: w.code,
            name: w.name,
            districtCode: d.code
          }));
          await this.wardRepo.insert(wardEntities);
        }
      }
      this.logger.log('Data import completed successfully');
    } catch (error: any) {
      this.logger.error('Error occurred while importing data:', error.message);
    }
  }

  async getProvinces() {
    return await this.provinceRepo.find({ order: { name: 'ASC' } });
  }

  async getDistricts(provinceCode: number) {
    return await this.districtRepo.find({ 
      where: { provinceCode }, 
      order: { name: 'ASC' } 
    });
  }

  async getWards(districtCode: number) {
    return await this.wardRepo.find({ 
      where: { districtCode }, 
      order: { name: 'ASC' } 
    });
  }
}