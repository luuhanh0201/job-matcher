import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

type MatchPasswordDto = {
  password: string;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
@ValidatorConstraint({ name: 'matchPassword', async: false })
export class MatchPassword implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const obj = args.object as MatchPasswordDto;

    return obj.password === confirmPassword;
  }

  defaultMessage(): string {
    return 'Passwords do not match';
  }
}
