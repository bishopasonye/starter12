import { Role } from "@app/enum";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDTO {
  @ApiProperty({ description: 'email',  })
  email: string

  @ApiProperty({ description: 'Password',  })
  password: string;
  @ApiProperty({ description: 'username',  })
  username?: string;
}