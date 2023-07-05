import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, Res } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        avatar:'teste.example.com/image.jpg'
      };

      const saveSpy = jest.spyOn(usersService, 'create').mockResolvedValueOnce(createUserDto);

      const responseMock = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await usersController.create(createUserDto, responseMock as unknown as Res);

      expect(saveSpy).toHaveBeenCalledWith(createUserDto);
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(responseMock.send).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findOne', () => {
    it('should return the user with the specified id', async () => {
      const userId = '1';
      const user = {
        id: 1,
        name: 'John Doe',
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValueOnce(user);

      const responseMock = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await usersController.findOne(userId, responseMock as unknown as Res);

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(responseMock.send).toHaveBeenCalledWith(user);
    });
  });

  describe('getAvatarImage', () => {
    it('should return the base64 avatar image', async () => {
      const userId = '1';
      const avatarImage = {
        base64: 'aW1hZ2UgZGF0YQ==',
      };

      jest.spyOn(usersService, 'getAvatarImage').mockResolvedValueOnce(avatarImage);

      const result = await usersController.getAvatarImage(userId);

      expect(result).toEqual(avatarImage);
    });
  });

  describe('remove', () => {
    it('should remove the avatar image of the user with the specified id', async () => {
      const userId = '1';

      const removeSpy = jest.spyOn(usersService, 'remove').mockResolvedValueOnce(undefined);

      const result = await usersController.remove(userId);

      expect(removeSpy).toHaveBeenCalledWith(+userId);
      expect(result).toBeUndefined();
    });
  });

  // Add more test cases for other controller methods...

});
