import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgRequiredGuard } from '../common/guards/org-required.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { AllowSkipOrgWhenGlobal } from '../common/decorators/allow-skip-org-when-global.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { OrgId } from '../common/decorators/org-id.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { InviteService } from './invite.service';
import { CreateInviteDto, createInviteSchema } from './dto/create-invite.dto';
import { RequestUser } from '../common/auth-context.types';

@ApiTags('Invites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invites')
export class InviteController {
  constructor(private inviteService: InviteService) {}

  @Post()
  @UseGuards(PermissionGuard, OrgRequiredGuard)
  @RequirePermission('employee:create')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({ summary: 'Send invite to user for organization' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  create(
    @Body(new ZodValidationPipe(createInviteSchema)) dto: CreateInviteDto,
    @OrgId() organizationId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.inviteService.create(dto, organizationId, user.id);
  }

  @Get()
  @UseGuards(PermissionGuard, OrgRequiredGuard)
  @RequirePermission('employee:read')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({ summary: 'Get all invites for organization' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  findAll(@OrgId() organizationId: string) {
    return this.inviteService.findAll(organizationId);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept invite' })
  accept(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.inviteService.accept(id, user.id);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard, OrgRequiredGuard)
  @RequirePermission('employee:delete')
  @AllowSkipOrgWhenGlobal()
  @ApiOperation({ summary: 'Delete invite' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @OrgId() organizationId: string,
  ) {
    return this.inviteService.remove(id, organizationId);
  }
}
