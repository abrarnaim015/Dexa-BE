import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/entities/user.entity';
import { RolesGuard } from 'src/auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Put('me')
  updateMe(@Req() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  userMe(@Req() req) {
    return this.usersService.userMe(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  getUsers(@Query('name') name?: string, @Query('id') id?: number) {
    return this.usersService.getUsers({ name, id });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  updateUser(
    @Param('id') id: number,
    @Body() body: { name?: string; phoneNumber?: string },
  ) {
    return this.usersService.updateUser(+id, body);
  }

  @Put('me/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo'))
  async updateMyProfilePhoto(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    return this.usersService.updateProfilePhoto(userId, file);
  }

  @Delete('me/photo')
  @UseGuards(JwtAuthGuard)
  async removeMyProfilePhoto(@Req() req) {
    const userId = req.user.userId;
    return this.usersService.removeProfilePhoto(userId);
  }
}
