import { ApiProperty } from "@nestjs/swagger";

export class AssignRoleDTO {
  @ApiProperty({ description: 'Unique identifier for the role', required: false })
  _id?: string;

  @ApiProperty({ description: 'Role name', example: 'Super Admin' })
  roleName: string;

  @ApiProperty({ description: 'Users _id assigned role',  })
  userIDs: string[];

  @ApiProperty({ description: 'permissions',example:["UserModelCreate","UserModelUpadate","UserModelDelete","UserModelRead"]  })
  permissions: string[];
  
  @ApiProperty({ description: 'Organization at which the role is for', example: 'john@organization.com' })
  organizationID :string
  
  @ApiProperty({ description: 'Role description', })
  description :string
}