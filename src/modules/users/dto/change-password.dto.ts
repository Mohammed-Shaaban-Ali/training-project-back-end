import { ValidationArguments, registerDecorator, ValidationOptions, IsNotEmpty, IsString } from "class-validator";


export class ChangePasswordDto {

  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  // @IsStrongPassword() //! will be disabled for now for easy testing
  newPassword: string;
}


export function IsStrongPassword(validationOptions?: ValidationOptions) {

  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any, args: ValidationArguments) {
           // Password strength criteria
           const hasUppercase = /[A-Z]/.test(value);
           const hasLowercase = /[a-z]/.test(value);
           const hasNumber = /[0-9]/.test(value);
           const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
           return (
            typeof value === "string" &&
            value.length >= 8 && // Minimum length
            hasUppercase &&
            hasLowercase &&
            hasNumber &&
            hasSpecialChar
          );
        },
        defaultMessage() {
          return "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and a special character.";
        }
      }
    });
  }
}



