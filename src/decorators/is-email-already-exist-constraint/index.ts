import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailAlreadyExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  defaultMessage(_: ValidationArguments) {
    return 'O e-mail $value já existe. Escolha outro e-mail.';
  }

  async validate(email: string, _: ValidationArguments) {
    const user = await this.userRepository.findOne({ where: { email } });
    return !user;
  }
}

export function IsEmailAlreadyExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      constraints: [],
      propertyName: propertyName,
      options: validationOptions,
      target: object.constructor,
      validator: IsEmailAlreadyExistConstraint,
    });
  };
}
