import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { AddressDto } from './dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address) private addressRepository: Repository<Address>,
  ) {}

  async getAddresses(userId: string) {
    return await this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async createAddress(userId: string, dto: AddressDto) {
    const addressCount = await this.addressRepository.count({ where: { userId } });
    
    let isDefault = dto.isDefault || false;
    if (addressCount === 0) {
      isDefault = true;
    }

    if (isDefault && addressCount > 0) {
      await this.addressRepository.update({ userId }, { isDefault: false });
    }

    const newAddress = this.addressRepository.create({
      ...dto,
      userId,
      isDefault,
    });

    return await this.addressRepository.save(newAddress);
  }

  async updateAddress(userId: string, addressId: number, dto: AddressDto) {
    const address = await this.addressRepository.findOne({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException('Cannot find address');

    if (dto.isDefault && !address.isDefault) {
      await this.addressRepository.update({ userId }, { isDefault: false });
    }

    await this.addressRepository.update(addressId, dto);
    return await this.addressRepository.findOne({ where: { id: addressId } });
  }

  async deleteAddress(userId: string, addressId: number) {
    const address = await this.addressRepository.findOne({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException('Cannot find address');

    await this.addressRepository.remove(address);
    return { success: true };
  }

  async setDefaultAddress(userId: string, addressId: number) {
    const address = await this.addressRepository.findOne({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException('Cannot find address');

    await this.addressRepository.update({ userId }, { isDefault: false });
    await this.addressRepository.update(addressId, { isDefault: true });
    
    return { success: true };
  }
}