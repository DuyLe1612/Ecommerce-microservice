import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { UpdateProfileDto } from './dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'email', 'fullName', 'phoneNumber', 'role', 'createdAt'],
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Current password is incorrect');

    const updateData: Partial<User> = {};

    if (dto.fullname !== undefined) {
      updateData.fullName = dto.fullname;
    }
    
    if (dto.phoneNumber !== undefined) {
      updateData.phoneNumber = dto.phoneNumber;
    }

    if (dto.newEmail) {
      const emailExists = await this.userRepository.findOne({ where: { email: dto.newEmail } });
      if (emailExists && emailExists.id !== userId) {
        throw new BadRequestException('Email is already in use');
      }
      updateData.email = dto.newEmail;
    }

    if (Object.keys(updateData).length > 0) {
      await this.userRepository.update(userId, updateData);
    }

    return { message: 'Profile updated successfully' };
  }
}