import { IsIn } from 'class-validator';

import { UserRole } from '../../../common/enums/user-role.enum';

export class UpdateUserRoleDto {
  @IsIn([UserRole.ADMIN, UserRole.CUSTOMER])
  role: UserRole;
}
