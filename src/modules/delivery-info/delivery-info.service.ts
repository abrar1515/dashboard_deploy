import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { mapDeliveryInfo } from '../../common/mappers';
import { DeliveryInfo } from '../../entities/delivery-info.entity';
import { User } from '../../entities/user.entity';
import { DeliveryInfoDto } from './dto/delivery-info.dto';

@Injectable()
export class DeliveryInfoService {
  constructor(
    @InjectRepository(DeliveryInfo)
    private readonly deliveryInfoRepository: Repository<DeliveryInfo>,
  ) {}

  async getDeliveryInfo(user: User) {
    const infos = await this.deliveryInfoRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });

    return infos.map(mapDeliveryInfo);
  }

  async addDeliveryInfo(user: User, payload: DeliveryInfoDto) {
    const info = this.deliveryInfoRepository.create({
      user,
      firstName: payload.firstName,
      lastName: payload.lastName,
      addressLineOne: payload.addressLineOne,
      addressLineTwo: payload.addressLineTwo,
      city: payload.city,
      zipCode: payload.zipCode,
      contactNumber: payload.contactNumber,
    });

    const saved = await this.deliveryInfoRepository.save(info);
    return mapDeliveryInfo(saved);
  }

  async editDeliveryInfo(user: User, payload: DeliveryInfoDto) {
    if (!payload._id) {
      throw new BadRequestException('Delivery info id is required');
    }

    const existing = await this.deliveryInfoRepository.findOne({
      where: { id: payload._id, user: { id: user.id } },
    });

    if (!existing) {
      throw new BadRequestException('Delivery info not found');
    }

    this.deliveryInfoRepository.merge(existing, {
      firstName: payload.firstName,
      lastName: payload.lastName,
      addressLineOne: payload.addressLineOne,
      addressLineTwo: payload.addressLineTwo,
      city: payload.city,
      zipCode: payload.zipCode,
      contactNumber: payload.contactNumber,
    });

    const saved = await this.deliveryInfoRepository.save(existing);
    return mapDeliveryInfo(saved);
  }
}
