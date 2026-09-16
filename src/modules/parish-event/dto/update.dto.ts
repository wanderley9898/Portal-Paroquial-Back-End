import { PartialType } from '@nestjs/swagger';
import { CreateParishEventDto } from './create.dto';

export class UpdateParishEventDto extends PartialType(CreateParishEventDto) {}
