import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateUserLimitsDto {
  @IsOptional()
  @IsInt()
  @Min(-1)
  maxSystems?: number;

  @IsOptional()
  @IsInt()
  @Min(-1)
  maxCampaigns?: number;

  @IsOptional()
  @IsInt()
  @Min(-1)
  maxCharacters?: number;
}
