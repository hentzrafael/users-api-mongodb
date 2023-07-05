import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/UserSchema';
import { Connection, Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectConnection() private connection: Connection,
    private readonly httpService: HttpService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findOne(id: number) {
    const { data } = await this.httpService.axiosRef.get(
      `https://reqres.in/api/users/${id}`,
    );
    return data;
  }

  async getAvatarImage(id: number) {
    const avatarInDB = await this.hasAvatarDB(id);
    if (avatarInDB == null) {
      const { data } = await this.httpService.axiosRef.get(
        `https://reqres.in/api/users/${id}`,
      );
      const imageResponse = await this.httpService.axiosRef.get(
        data.data.avatar,
        { responseType: 'arraybuffer' },
      );
      const image64 = Buffer.from(imageResponse.data, 'binary').toString(
        'base64',
      );
      await this.saveImage(image64, id);
      return { base64: image64 };
    }
    return { base64: avatarInDB.base64 };
  }

  async saveImage(base64: string, id: number) {
    await this.connection.collection('files').insertOne({
      userId: id,
      base64: base64,
    });
  }
  async hasAvatarDB(userId: number) {
    const user = await this.connection.collection('files').findOne({
      userId: userId,
    });
    return user;
  }

  async remove(id: number) {
    return await this.connection.collection('files').deleteOne({
      userId: id,
    });
  }
}
