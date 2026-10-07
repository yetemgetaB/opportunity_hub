import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(SupabaseAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  async getMyNotifications(
    @CurrentUser('id') userId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.notificationsService.getMyNotifications(userId, {
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
  }

  @Get('unread-count')
  async getUnreadCount(
    @CurrentUser('id') userId: string,
  ) {
    return {
      count: await this.notificationsService.getUnreadCount(userId),
    };
  }

  @Patch(':id/read')
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(
      userId,
      notificationId,
    );
  }

  @Patch('read-all')
  async markAllAsRead(
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.markAllAsRead(userId);
  }
}