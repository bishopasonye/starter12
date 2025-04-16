import { ActivityLogDoc, ActivityLogModel } from '@app/schema';
import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { NotificationGateway } from './notification.gateway';

interface NotificationInterface {
  action: string;
  entityType: string;
  entityID: string;
  userID: string;
  details: string;
}

@Injectable()
export class NotificationService {
  constructor(private readonly notificationGateway: NotificationGateway,
     @InjectModel(ActivityLogModel.name)
            private activityLogModel: Model<ActivityLogDoc>,
  ) {}


   API_KEY = "YOUR ONESIGNAL API KEY";
 ONESIGNAL_APP_ID = "YOUR ONESIGNAL APP ID";
 BASE_URL = "https://onesignal.com/api/v1";

  async notificationActivity(
    { entityType, userID, details, action, entityID }: NotificationInterface,
    
  ) {
   
      await this.activityLogModel.create({ entityType, userID, details, action, entityID });
    

    // Send real-time notification
    this.notificationGateway.sendNotification(userID.toString(), {
      action,
      entityType,
      entityID,
      details,
    });
  }

  optionsBuilder (method:string, path:string, body:string){
    return {
            method,
            'url': `${this.BASE_URL}/${path}`,
            'headers': {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${this.API_KEY}`,
        },
        body: body ? JSON.stringify(body) : null
    };
}


  async createNotication (data) {
  const options = this.optionsBuilder("post","notifications", data);
  try {
          const response = await axios(options);
          return response.data;
      } catch (error) {
          console.error(error);
          return error;
      }
  }
}


