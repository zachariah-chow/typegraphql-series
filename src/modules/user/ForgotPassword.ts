import { Mutation, Resolver, Arg } from 'type-graphql';
import { v4 } from 'uuid';

import { User } from '../../entity/User';
import { redis } from '../../redis';
import { forgotPasswordPrefix } from '../constants/redisPrefixes';
import { sendMail } from '../utils/sendEmail';

@Resolver()
export class ForgotPasswordResolver {
    @Mutation(() => Boolean)
    async forgotPassword(@Arg('email') email: string): Promise<boolean> {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new Error('User is not found!');
        }

        const token = v4();
        await redis.set(forgotPasswordPrefix + token, user.id, 'ex', 60 * 60 * 24); // 1 day expiration

        await sendMail(email, `http://localhost:3000/user/change-password/${token}`);

        return true;
    }
}
