import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';



@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private config:ConfigService) {
        super({
            clientID: '664872400063-5g3holsjkgmanem3t6b8dg1uvmp7qogt.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: `${config.get('callbackURL')}/v1/auth/google/callback`,
            
            scope: ['email', 'profile'],
        });
    }
    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { name, emails, photos } = profile
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken
        }
        done(null, user);
    }
}