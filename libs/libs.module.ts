import { AuthModule } from '@app/auth';
import { UserModule } from '@app/user';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UploadsModule } from './uploads/src';


@Module({
  imports: [AuthModule, UserModule,UploadsModule],
  providers: [
   
  ],
  controllers: [],
  exports:[]
})
export class LibsModule {}
