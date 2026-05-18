import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

type MatchPasswordDto = {
  password: string;
};

@ValidatorConstraint({ name: 'matchPassword', async: false })
export class MatchPassword implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments): boolean {
    const obj = args.object as MatchPasswordDto;

    return obj.password === confirmPassword;
  }

  defaultMessage(): string {
    return 'Passwords do not match';
  }
}
