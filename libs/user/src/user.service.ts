
import { UserModel,  ActivityLogDoc, ActivityLogModel, UserDoc } from '@app/schema';
import {  NotificationService, ObjectReturnType, serviceResponse } from '@app/service';
import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Action } from '@app/enum';

import { UserDTO } from '@app/dto';
// import { OrganizationAbilityFactory } from './organization-ability.factory';
import * as moment from 'moment';




@Injectable()
export class UserService {
    constructor(@InjectModel(UserModel.name) private userModel: Model<UserDoc>,
     @InjectModel(ActivityLogModel.name)
        private activityLogModel: Model<ActivityLogDoc>,
    // private organizationAbilityFactory: OrganizationAbilityFactory,
      private notificationActivity: NotificationService
  
  ) {}

  async upset(user: UserDTO,userData:UserDTO): Promise<ObjectReturnType> {
    try {
      const created = await this.userModel.create(user);

      this.notificationActivity.notificationActivity(
        {
          action: 'create',
          entityType: 'User',
          entityID: created._id.toString(),
          userID: userData?._id,
          details: `${userData?.fullname} created an user`,
        }
      );
      return serviceResponse({
        message: 'created successfully',
        data: created,
      });
    } catch (error) {
      throw new NotAcceptableException(error.message);
    }
  }

  async update(user: UserDTO,userData:UserDTO): Promise<ObjectReturnType> {
    
    const updatedRole = await this.userModel.findByIdAndUpdate(
      user._id,
      user,
      { new: true },
    );
     
    this.notificationActivity.notificationActivity(
      {
        action: 'updated',
        entityType: 'User',
        entityID: updatedRole._id.toString(),
        userID: userData?._id,
        details: `${userData?.fullname} updated an user`,
      },
       
    );
      return serviceResponse({
        message: 'updated successfully',
        data:updatedRole,
      });
    
  }

  async findbyId(id: any): Promise<ObjectReturnType> {
    try {
      const data = await this.userModel.findById(id);
      if (!data) {
        throw new NotFoundException();
      }
      return serviceResponse({
        message: 'Success',
        data,
      });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findbyAny(
    params: { key: string; value: string },
    query: any,
  ): Promise<ObjectReturnType> {
    const { key, value } = params;
    const { skip=0, limit=0 } = query;
   
    const result = await this.userModel
      .find({ [key]: value })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      ;
    if (!result.length) {
      throw new NotFoundException(value + ' not found in field ' + key);
    }
    return serviceResponse({
      message: 'Success',
      data: result,
    });
  }

  async findAll(query: any): Promise<ObjectReturnType> {
    const { skip=0, limit=0 } = query;
    try {
      
      const data = await this.userModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        ;
      
      return serviceResponse({
        message: 'Success',
        data,
      });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async delete(_id: string[],userData:UserDTO): Promise<ObjectReturnType> {
    const user = await this.userModel.find({ _id });
    for (let i = 0; i < user.length; i++) {
    //   await this.organizationAbilityFactory.checkAbility(
    //     userData.organizationID,
    //     userData?._id.toString(),
    //     Action.Delete,
    //     UserModel,
    //   );

      this.notificationActivity.notificationActivity(
        {
          action: 'delete',
          entityType: 'User',
          entityID: user[i]._id.toString(),
          userID: userData?._id,
          details: `${userData?.fullname} delete an user`,
        }
      );
    }
    const data = await this.userModel.deleteMany({ _id });
 
    try {
      return serviceResponse({
        message: 'Success',
        data,
      });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async deleteByEmails(_id: string[]): Promise<ObjectReturnType> {
    const data = await this.userModel.deleteMany({ email:_id });

    try {
      return serviceResponse({
        message: 'Success',
        data,
      });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findRecentUsers(
    period: 'day' | 'week' | 'month',
    query: any
  ): Promise<ObjectReturnType> {
    const { skip = 0, limit = 0 } = query;
  
    let startDate = moment().startOf('day'); // Start from today at 00:00
    let endDate = moment().endOf('day'); // End today at 23:59
  
    switch (period) {
      case 'day':
        startDate = moment().subtract(1, 'day').startOf('day'); // Yesterday 00:00
        endDate = moment().endOf('day'); // Today 23:59
        break;
      case 'week':
        startDate = moment().subtract(7, 'days').startOf('day'); // 7 days ago 00:00
        break;
      case 'month':
        startDate = moment().subtract(1, 'month').startOf('day'); // 1 month ago 00:00
        break;
    }
  
    const result = await this.userModel
      .find({ createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  
  
  
    return serviceResponse({
      message: `Users registered in the last ${period}`,
      data: result,
    });
  }
  


async countRecentUsers(): Promise<ObjectReturnType> {
  const today = moment().endOf('day');

  const lastDayStart = moment().subtract(1, 'day').startOf('day');
  const lastWeekStart = moment().subtract(7, 'days').startOf('day');
  const lastMonthStart = moment().subtract(1, 'month').startOf('day');

  const [countLastDay, countLastWeek, countLastMonth, totalUsers] =
    await Promise.all([
      this.userModel.countDocuments({
        createdAt: { $gte: lastDayStart.toDate(), $lte: today.toDate() },
      }),
      this.userModel.countDocuments({
        createdAt: { $gte: lastWeekStart.toDate(), $lte: today.toDate() },
      }),
      this.userModel.countDocuments({
        createdAt: { $gte: lastMonthStart.toDate(), $lte: today.toDate() },
      }),
      this.userModel.countDocuments(), // Total user count
    ]);

  return serviceResponse({
    message: 'User count fetched successfully',
    data: {
      totalUsers,
      lastDay: countLastDay,
      lastWeek: countLastWeek,
      lastMonth: countLastMonth,
    },
  });
}


}
