import { PartialType } from '@nestjs/swagger';
import { CreateBroadcastDto } from './create.dto';

export class UpdateBroadcastDto extends PartialType(CreateBroadcastDto) {}
