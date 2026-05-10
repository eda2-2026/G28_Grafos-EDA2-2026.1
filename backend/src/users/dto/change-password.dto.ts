import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'A senha antiga não pode estar vazia.' })
  senhaAntiga: string;

  @IsString()
  @IsNotEmpty({ message: 'A nova senha não pode estar vazia.' })
  novaSenha: string;
}