import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';

@Module({
  controllers: [MailController],
  providers: [MailService],
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT || '587', 10),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: process.env.MAIL_USER,
      },
      template: {
        dir: join(__dirname, 'templates'),
        dirs: [
          join(__dirname, 'templates'),
          join(process.cwd(), 'src/modules/mail/templates'),
          join(process.cwd(), 'dist/src/modules/mail/templates'),
          join(process.cwd(), 'apps/api/src/modules/mail/templates'),
          join(process.cwd(), 'apps/api/dist/src/modules/mail/templates'),
        ],
        adapter: new HandlebarsAdapter(),
        options: {
          strict: false,
        },
      },
    }),
  ],
  exports: [MailService],
})
export class MailModule {}
