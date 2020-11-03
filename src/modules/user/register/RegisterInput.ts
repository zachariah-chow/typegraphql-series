import { Field, InputType } from 'type-graphql';
import { IsEmail, Length } from 'class-validator';

@InputType()
export class RegisterInput {
    @Field()
    @Length(1, 255)
    firstName: string;

    @Field()
    @Length(1, 255)
    lastName: string;

    @Field()
    @IsEmail()
    email: string;

    @Field()
    password: string;
}
