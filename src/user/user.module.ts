import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';
import { UsersController } from './users.controller';
import { QueueModule } from 'src/queue/queue.module';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), QueueModule],
  providers: [UserService, CloudinaryService],
  controllers: [UsersController],
  exports: [UserService, CloudinaryService],
})
export class UserModule {}
