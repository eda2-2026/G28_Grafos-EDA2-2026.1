import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
export class MateriasUpdateDto {
    @IsString()
    @IsOptional()
    nome?: string;

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    adicionarProfIds?: number[];

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    removerProfIds?: number[];
};