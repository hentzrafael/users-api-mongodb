import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { HttpService } from '@nestjs/axios';
import { Connection, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User } from './schemas/UserSchema';

describe('UsersService', () => {
  let usersService: UsersService;
  let userModel: Model<User>;
  let connection: Connection;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: Connection,
          useValue: connection,
        },
        HttpService,
        {
          provide: getModelToken(User.name),
          useValue: Model,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    httpService = module.get<HttpService>(HttpService);
    connection = module.get<Connection>(Connection);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'janet.weaver@reqres.in',
        first_name: 'Mariana',
        last_name: 'Teste',
        avatar: 'https://reqres.in/img/faces/2-image.jpg',
      };

      const saveSpy = jest
        .spyOn(userModel.prototype, 'save')
        .mockResolvedValueOnce({
          _id: 'testUserId',
          ...createUserDto,
        } as User);

      const result = await usersService.create(createUserDto);

      expect(saveSpy).toHaveBeenCalledWith();
      expect(result).toEqual(
        expect.objectContaining({
          _id: 'testUserId',
          ...createUserDto,
        }),
      );
    });
  });

  describe('getAvatarImage', () => {
    it('should return the base64 avatar image', async () => {
      const userId = 1;
      const avatarInDB = null;

      jest.spyOn(usersService, 'hasAvatarDB').mockResolvedValueOnce(avatarInDB);
      jest.spyOn(httpService.axiosRef, 'get').mockResolvedValueOnce({
        data: {
          data: {
            avatar: 'https://example.com/avatar.jpg',
          },
        },
      });
      jest.spyOn(httpService.axiosRef, 'get').mockResolvedValueOnce({
        data: Buffer.from('image data').toString('base64'),
      });

      const saveImageSpy = jest.spyOn(usersService, 'saveImage');

      const result = await usersService.getAvatarImage(userId);

      expect(saveImageSpy).toHaveBeenCalledWith('aW1hZ2UgZGF0YQ==', userId);
      expect(result).toEqual({ base64: 'aW1hZ2UgZGF0YQ==' });
    });

    it('should return the base64 avatar image from the database', async () => {
      const userId = 1;
      const avatarInDB = {
        _id: new ObjectId('64a56db2bde61e58d8cc5745'),
        userId: userId,
        base64: 'aW1hZ2UgZGF0YQ==',
      };

      jest.spyOn(usersService, 'hasAvatarDB').mockResolvedValueOnce(avatarInDB);

      const saveImageSpy = jest.spyOn(usersService, 'saveImage');

      const result = await usersService.getAvatarImage(userId);

      expect(saveImageSpy).not.toHaveBeenCalled();
      expect(result).toEqual({ base64: 'aW1hZ2UgZGF0YQ==' });
    });
  });
});
