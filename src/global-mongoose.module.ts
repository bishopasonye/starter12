import { UserModel, UserSchema, AssignRoleModel, AssignRoleSchema, ActivityLogModel, ActivityLogSchema, AuthenticatorModel, AuthenticatorSchema, OTPModel, OTPSchema } from '@app/schema';
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';


const { MONGODB_URL, environment } = process.env;
const DBLINK =
  environment === 'production'
    ? MONGODB_URL
    : 'mongodb+srv://dbzNuk:02sHBz5d5K44k8X6@cluster0.rxbwmv5.mongodb.net/goveloox';

@Global()
@Module({
  imports: [
   
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}`,
        },
      }),
    }),
    MongooseModule.forRoot(DBLINK),

    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: AssignRoleModel.name, schema: AssignRoleSchema },
    ]),
    MongooseModule.forFeature([
      { name: ActivityLogModel.name, schema: ActivityLogSchema },
    ]),

    MongooseModule.forFeature([
      { name: AuthenticatorModel.name, schema: AuthenticatorSchema },
    ]),
    MongooseModule.forFeature([{ name: OTPModel.name, schema: OTPSchema }]),

     ],

  exports: [MongooseModule],
})
export class GlobalMongooseModule {}
