import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { MatchResultsService } from './match-results.service';
import { JwtAuthGuard } from '@/modules/auth/Guards/jwt-auth.guard';
import { User } from '@/modules/user/entities/user.entity';

@Controller('match-results')
export class MatchResultsController {
  constructor(private readonly matchResultsService: MatchResultsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyMatchResults(@Request() req: Request & { user: User }) {
    return this.matchResultsService.getMyMatchResults(req.user.id);
  }
}
