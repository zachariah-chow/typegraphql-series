import { Query, Mutation, Resolver, Arg, UseMiddleware } from 'type-graphql';
import bcrypt from 'bcryptjs';

import { User } from '../../entity/User';
import { RegisterInput } from './register/RegisterInput';
import { isAuth } from '../middleware/isAuth';
import { logger } from '../middleware/logger';
import { createConfirmationUrl } from '../utils/createConfirmationUrl';
import { sendMail } from '../utils/sendEmail';

@Resolver()
export class RegisterResolver {
    @UseMiddleware(isAuth, logger)
    @Query(() => String)
    testQuery(): string {
        return 'Test Query';
    }

    @Mutation(() => User)
    async register(@Arg('data') { email, firstName, lastName, password }: RegisterInput): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        }).save();

        await sendMail(email, await createConfirmationUrl(user.id));

        return user;
    }
}
