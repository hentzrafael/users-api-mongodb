import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Response } from 'express';
import { sendRabbit } from 'src/utils/rabbitMQ';
import { sendEmail } from 'src/utils/email';

@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const json = await this.usersService.create(createUserDto);
    res.status(HttpStatus.CREATED).send(json);
    await sendRabbit(`Usuário com o nome ${createUserDto.first_name} criado`);
    await sendEmail(
      `Usuário com o nome ${createUserDto.first_name} criado`,
      `Criação do usuário ${
        createUserDto.first_name + ' ' + createUserDto.last_name
      } finalizada com sucesso`,
      'bar@example.com',
    );
    return json;
  }

  @Get('user/:id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    res.status(HttpStatus.OK).send(await this.usersService.findOne(+id));
  }

  @Get('user/:id/avatar')
  getAvatarImage(@Param('id') id: string) {
    return this.usersService.getAvatarImage(+id);
  }

  @Delete('/user/:id/avatar')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
