import { Role } from "@app/enum";
import { ApiProperty } from "@nestjs/swagger";

export class UserDTO {
    @ApiProperty({ description: 'Unique identifier for the user', required: false })
    _id?: string;

    @ApiProperty({ description: 'User ID', example: '12345', required: false })
    id: string;

    @ApiProperty({ description: 'Username of the user', example: 'john_doe' })
    username?: string;

    status?: string;

    @ApiProperty({ description: 'Email address of the user', example: 'john@example.com' })
    email: string;

    @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
    fullname: string;
    
    organizationID: string;
    
    @ApiProperty({ description: 'Phone number of the user', example: '+1234567890' }) // New property
    phone?: string;
    
    @ApiProperty({ description: 'User password', example: 'password123' })
    password?: string;

    @ApiProperty({
        description: 'Roles assigned to the user',
        type: [String], // Assuming roles are strings; adjust if using a specific enum type
        example: ['admin', 'user'],
    })
    roles?: String[];

    @ApiProperty({ description: 'Profile image URL', example: 'http://example.com/image.jpg' })
    profileImage?: string;

    @ApiProperty({ description: 'Indicates if the user is an admin', example: false })
    isAdmin?: boolean;

    @ApiProperty({ description: 'Indicates if the user is a super admin', example: false })
    isSuperAdmin?: boolean;

    @ApiProperty({ description: 'Mode of identification', example: 'passport' })
    modeOfIdentification?: string;

   
     // Voter Location
     @ApiProperty({ description: 'The state of the voter location', example: 'California' })
     state?: string;
   
     @ApiProperty({ description: 'The country of the voter location', example: 'USA' })
     country?: string;
   
     @ApiProperty({ description: 'The local government area of the voter location', example: 'Los Angeles County', required: false })
     localGovernmentArea?: string;
   
     @ApiProperty({ description: 'The postal code of the voter location', example: '90001' })
     postalCode?: string;
   
     @ApiProperty({ 
        description: 'Social media profiles with platforms as keys and handles as values', 
        example: { twitter: 'user_handle', facebook: 'user_handle' }, 
        required: false 
      })
      socialMediaProfile?: Record<string, string>;
   
     @ApiProperty({ description: 'User preferences', example: '' })
     preferences?: string;
 
}


export class UserIDDTO {
    @ApiProperty({ description: 'user_id',  })
    userID:string
}

export class ChangePasswordDTO {
    @ApiProperty({ description: 'current password',  })
    currentPassword:string
    @ApiProperty({ description: 'new passsword',  })
    newPassword:string
  
  }

  export class ForgotPasswordDTO {
    @ApiProperty({ description: 'code',  })
    code?:string
    // @ApiProperty({ description: 'token',  })
    // token?:string
    @ApiProperty({ description: 'new passsword',  })
    newPassword:string
  
  }

  export class SetAuthenticatorDto {
    @ApiProperty({ description: 'user_id',  })
   userID: String
   @ApiProperty({ description: 'secret',  })
   secret: String 
  }

  export class VerifyAuthenticationDto {
    @ApiProperty({ description: 'user_id',  })
    userID: String 
    @ApiProperty({ description: 'token',  })
    token: String 
    @ApiProperty({ description: 'code',  })
    code: String 
    
  
  }

  export class RefreshTokenDTO {
    @ApiProperty({ description: 'refresh_token:',  })
    refresh_token: String 
    
  
  }