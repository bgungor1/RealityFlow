import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  ParseEnumPipe,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserRole } from '../common/constants/user-roles.js';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe.js';

import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new user/agent' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users, optionally filtered by role' })
  findAll(
    @Query('role', new ParseEnumPipe(UserRole, { optional: true }))
    role?: UserRole,
  ) {
    return this.userService.findAll(role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific user by ID' })
  findById(@Param('id', ParseMongoIdPipe) id: string) {
    return this.userService.findById(id);
  }
}
