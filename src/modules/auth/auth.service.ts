import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDTO } from '../users/dto';
import { AppError } from 'src/common/constants/errors';
import { UserLoginDTO } from './dto';
import * as bcrypt from 'bcrypt';
import { AuthUserResponse } from './response';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  async registerUser(dto: CreateUserDTO): Promise<AuthUserResponse> {
    try {
      const existUser = await this.userService.findUserByEmail(dto.email);
      if (existUser) throw new BadRequestException(AppError.USER_EXIST);
      await this.userService.createUser(dto);
      return this.userService.publicUser(dto.email);
    } catch (e) {
      throw new Error(e);
    }
  }

  async loginUser(
    dto: UserLoginDTO,
  ): Promise<AuthUserResponse | BadRequestException> {
    try {
      const existUser = await this.userService.findUserByEmail(dto.email);
      if (!existUser) return new BadRequestException(AppError.USER_NOT_EXIST);
      const validatePassword = await bcrypt.compare(
        dto.password,
        existUser.password,
      );
      if (!validatePassword)
        return new BadRequestException(AppError.WRONG_DATA);
      return this.userService.publicUser(dto.email);
    } catch (e) {
      throw new Error(e);
    }
  }
}
