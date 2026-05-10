import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  UseInterceptors, 
  UploadedFile,   
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; 
import { diskStorage } from 'multer';
import { UsersDto } from './dto/users.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0].replace(/\s/g, '_'); 
  const fileExtName = file.originalname.substring(file.originalname.lastIndexOf('.'));
  const randomName = Array(16)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post(':id/upload-photo')
  @UseInterceptors(
    FileInterceptor('file', { 
      storage: diskStorage({
        destination: './uploads', 
        filename: editFileName,   
      }),
    }),
  )
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const photoUrl = `/uploads/${file.filename}`; 
    return this.userService.update(id, { fotosrc: photoUrl });
  }

  @IsPublic()
  @Post()
  async create(@Body() data: UsersDto) {
    return this.userService.create(data);
  }

  @Get()
  async findAll() {
    return this.userService.FindAll();
  }

  @Patch('change-password/:id')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(id, changePasswordDto);
  }

  @IsPublic()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.FindOne(Number(id));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateUserDto,
  ) {
    return this.userService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(Number(id));
  }
}