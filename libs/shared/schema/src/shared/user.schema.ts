import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomInt, randomUUID } from 'crypto';
import { HydratedDocument,models,model } from 'mongoose';
import * as unique from 'mongoose-unique-validator'

import * as bcrypt from 'bcrypt';
import { Role } from '@app/enum';
export type UserDoc = HydratedDocument<UserModel>;

@Schema({ timestamps: true })
export class UserModel {
  @Prop({index: true, unique: true,})
  id: string;
  @Prop({})
  username: string;
  @Prop({index: true, unique: true,})
  email: string;
  @Prop({  })
  phone: string; 
  @Prop()
  fullname: string;
  @Prop()
  password: string;

 
  @Prop()
  profileImage:string
  @Prop()
  roles: Role[];
  @Prop()
  isAdmin:Boolean
  @Prop({default:"unverified"})
  status:string
  @Prop()
  isSuperAdmin:Boolean
  @Prop()
  
  @Prop({  })
  state: string;

  @Prop({  })
  country: string;

  @Prop()
  localGovernmentArea?: string;

  @Prop({  })
  postalCode: string;

  @Prop({type:Object})
  socialMediaProfile?: Record<string, string>;

  

  @Prop({ type: [{ question: String, answer: String }] })
  recoveryQuestion: [{
    question: string;
    answer: string;
  }];

  
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
unique(UserSchema)
UserSchema.pre<UserModel>('save', async function (next,error) {

  
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(this.password||"123456", salt);
  this.id = randomInt(99999) + randomUUID().replace(/\D/g, '').substring(0, 5);
  this.password = hash;
this.username=this.username||this.email
  
  next();
});
