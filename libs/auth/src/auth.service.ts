import {
    Injectable,
    NotAcceptableException,
    NotFoundException,
    UnauthorizedException,
  } from '@nestjs/common';
  
  import * as bcrypt from 'bcrypt';
  import { InjectModel } from '@nestjs/mongoose';
  import {
    UserModel,
    UserDoc,
    AuthenticatorModel,
    AuthenticatorDoc,
    OTPDoc,
    OTPModel,
 
    AssignRoleModel,
    AssignRoleDoc,
  } from '@app/schema';
  import { Model } from 'mongoose';
  
  
  import { JwtService } from '@nestjs/jwt';
  
  import { authenticator } from 'otplib';
  
  import { MailerService } from '@nestjs-modules/mailer';
  
  import { SendMailService } from '@app/service';
import { UserDTO } from '@app/dto';
  
  @Injectable()
  export class AuthService {
    constructor(
      private readonly mailService: MailerService,
      @InjectModel(UserModel.name) private userModel: Model<UserDoc>,

      @InjectModel(OTPModel.name) private otpModel: Model<OTPDoc>,
      @InjectModel(AssignRoleModel.name)
      private assignRoleModel: Model<AssignRoleDoc>,
      @InjectModel(AuthenticatorModel.name)
      private authenticatorModel: Model<AuthenticatorDoc>,
      private jwtService: JwtService,
      
      private sendMailService: SendMailService,
    ) {}
  
    async register(users: UserDTO): Promise<any> {
      try {
        const created = await this.userModel.create(users);
        
  
        const data = await this.otpModel.create({ userID: created._id });
  
        this.sendMailService.sendMail({
          to: created.email,
          subject: 'Email Code Verification',
          text: `${data.code}`,
        });
  
        return {
          message:
            'Registration successful, Please Proceed to Email Verification',
          userID: created._id,
        };
      } catch (error) {
        throw new NotAcceptableException(error.message);
      }
    }
  
    async login(username: string, password: string): Promise<any> {
      const user = await this.userModel
        .findOne({
          $or: [{ username }, { email: username }],
        })
        .select(['email', 'username', 'id', 'password']);
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          const data = await this.otpModel.create({ userID: user._id });
  
          this.sendMailService.sendMail({to:user.email,subject:"Email Code Verification",text: `${data.code}`})
  
          return {
            message:
              'Correct Credentials, Please Proceed to Two-factor authentication',
              userID:user._id
          };
  
          
        }
        throw new UnauthorizedException('Invalid Credentials');
      }
  
      throw new NotFoundException('No User Found');
    }
  
    async editProfile(body: UserDTO, userID: string) {
      delete body.email;
      delete body.id;
      delete body.isAdmin;
      delete body.isSuperAdmin;
      delete body.status;
      delete body.password;
      delete body.roles;
      const user = await this.userModel.findByIdAndUpdate(userID, body, {
        new: true,
      });
      return {
        message: 'User profile updated',
        data: user, // You may want to implement rotation here
      };
    }
    async refreshToken(token: string) {
      const payload = this.jwtService.verify(token);
      if (!payload) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const user = await this.userModel.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
  
      const newAccessToken = this.jwtService.sign(
        { email: user.email, sub: user._id },
        { expiresIn: '15m' },
      );
      return {
        access_token: newAccessToken,
        refresh_token: token, // You may want to implement rotation here
      };
    }
    async ssoGoogle(req: any): Promise<any> {
      const user = await this.userModel.findOne({ email: req.user.email });
  
      if (user) {
        const payload = {
          sub: user._id,
          username: user.username,
          email: user.email,
        };
        const access_token = this.jwtService.sign(payload, { expiresIn: '1d' });
        const refresh_token = this.jwtService.sign(payload, {
          expiresIn: '100d',
        });
        const organization = await this.assignRoleModel
        .find({ users: user._id.toString() })
        .select('description users organizationID name permissions')
        .populate({
          path: 'organizationID', // This is the field to populate
          select: 'name', // Select only the 'name' field from the related organization
        });
        const seenOrganizations = new Set();
        const filteredData = organization.filter((item: any) => {
          const orgID = item.organizationID._id;
          if (seenOrganizations.has(orgID)) {
            return false;
          }
          seenOrganizations.add(orgID);
          return true;
        });
        return {
          message: 'Login successful',
          data: user,
          access_token,
          refresh_token,
          roles:filteredData
        };
      } else {
        const created = await this.userModel.create({
          ...req.user,
          username: req.user.email,
          password: '',
        });
        
  
        const payload = {
          sub: created._id,
          username: created.username,
          email: created.email,
        };
        const access_token = this.jwtService.sign(payload, { expiresIn: '1d' });
        const refresh_token = this.jwtService.sign(payload, {
          expiresIn: '100d',
        });
        return {
          message: 'Registration successful',
          data: created,
          access_token,
          refresh_token,
        };
      }
    }
  
    async ssoFacebook(req: any): Promise<any> {
      
      const user = await this.userModel.findOne({ email: req.user.email });
  
      if (user) {
        const payload = {
          sub: user._id,
          username: user.username,
          email: user.email,
        };
        const access_token = this.jwtService.sign(payload, { expiresIn: '1d' });
        const refresh_token = this.jwtService.sign(payload, {
          expiresIn: '100d',
        });
        const organization = await this.assignRoleModel
        .find({ users: user._id.toString() })
        .select('description users organizationID name permissions')
        .populate({
          path: 'organizationID', // This is the field to populate
          select: 'name', // Select only the 'name' field from the related organization
        });
        const seenOrganizations = new Set();
        const filteredData = organization.filter((item: any) => {
          const orgID = item.organizationID._id;
          if (seenOrganizations.has(orgID)) {
            return false;
          }
          seenOrganizations.add(orgID);
          return true;
        });
        return {
          message: 'Login successful',
          data: user,
          access_token,
          refresh_token,
          roles:filteredData
        };
      } else {
        const created = await this.userModel.create({
          ...req.user,
          username: req.user.email,
          password: '',
        });
        
        const payload = {
          sub: created._id,
          username: created.username,
          email: created.email,
        };
        const access_token = this.jwtService.sign(payload, { expiresIn: '1d' });
        const refresh_token = this.jwtService.sign(payload, {
          expiresIn: '100d',
        });
        return {
          message: 'Registration successful',
          data: created,
          access_token,
          refresh_token,
        };
      }
    }
  
    async twoFactorAuthenticationLogin(body: any): Promise<any> {
      let isValid = false;
      if (body.token) {
        const secret = await this.authenticatorModel.findOne({
          userID: body.userID,
        });
  
        if (!secret) {
          throw new NotFoundException('User has not set authenticator');
        }
  
        isValid = authenticator.check(body.token, secret.secret);
      }
      const code = await this.otpModel.findOne({ code: body.code });
     
      isValid = code ? true : isValid;
     
      if (!isValid) {
        throw new NotFoundException('Code not found or expired');
      }
      const user = await this.userModel.findById(body.userID);
      const payload = {
        sub: user._id,
        username: user.username,
        email: user.email,
      };
  
      const access_token = this.jwtService.sign(payload, { expiresIn: '1d' });
      const refresh_token = this.jwtService.sign(payload, {
        expiresIn: '100d',
      });
      if (code) {
        await this.otpModel.findByIdAndDelete(code._id);
      }
      const organization = await this.assignRoleModel
      .find({ users: user._id.toString() })
      .select('description users organizationID name permissions')
      .populate({
        path: 'organizationID', // This is the field to populate
        select: 'name', // Select only the 'name' field from the related organization
      });
  
    const seenOrganizations = new Set();
    const filteredData = organization.filter((item: any) => {
      const orgID = item.organizationID._id;
      if (seenOrganizations.has(orgID)) {
        return false;
      }
      seenOrganizations.add(orgID);
      return true;
    });
  
      return {
        message: 'Login successful',
        data: user,
        access_token,
        refresh_token,
        roles:filteredData
      };
    }
  
    async sendTwoFactorAuthenticationMail(body: any): Promise<any> {
      const user = await this.userModel.findOne({
        $or: [{ _id: body.userID }, { email: body.email || body.userID }],
      });
      if (!user) {
        throw new NotFoundException('No User Found');
      }
      const data = await this.otpModel.create({ userID: user._id.toString() });
      this.sendMailService.sendMail({
        to: user.email,
        subject: 'Email Code Verification',
        text: `${data.code}`,
      });
  
      return {
        message: 'Code sent',
        data,
      };
    }
  
    async setTwoFactorAuthenticator(body: any): Promise<any> {
      const isValid = authenticator.check(body.code, body.secret);
      if (!isValid) {
        throw new UnauthorizedException('Invalid Token');
      }
  
      const data = await this.authenticatorModel.create({
        userID: body.userID,
        secret: body.secret,
      });
      const user = await this.userModel.findById(body.userID);
      this.sendMailService.sendMail({
        to: user.email,
        subject: 'Two Factor Authenticator',
        text: `${body.secret}`,
      });
      return {
        message: 'authenticator set',
        data,
      };
    }
  
    async changePassword(
      userID: string,
      currentPassword: string,
      newPassword: string,
    ): Promise<any> {
      // Step 1: Find the user by their user ID
      const user = await this.userModel.findById(userID);
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      // Step 2: Check if the current password matches the one in the database
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Current password is incorrect');
      }
  
      const salt = await bcrypt.genSalt();
      // Step 3: Hash the new password before saving it
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await this.userModel.findByIdAndUpdate(userID, {
        password: hashedPassword,
      });
  
      return {
        message: 'Password successfully updated',
      };
    }
  
    async forgotPassword(
      token: string,
      code: string,
      newPassword: string,
    ): Promise<any> {
      let isValid = false;
      // if (token) {
      //   const secret = await this.authenticatorModel.findOne({
      //     userID: userID,
      //   });
  
      //   if (!secret) {
      //     throw new NotFoundException('User has not set authenticator');
      //   }
  
      //   isValid = authenticator.check(token, secret.secret);
      // }
      const checkCode = await this.otpModel.findOne({ code: code });
  
      isValid = checkCode ? true : isValid;
  
      if (!isValid) {
        throw new NotFoundException('Code not found or expired');
      }
  
      // Step 1: Find the user by their user ID
      const user = await this.userModel.findById(checkCode.userID);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const salt = await bcrypt.genSalt();
      // Step 3: Hash the new password before saving it
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      await this.userModel.findByIdAndUpdate(checkCode.userID, {
        password: hashedPassword,
      });
      return {
        message: 'Password successfully updated',
      };
    }
  }
  