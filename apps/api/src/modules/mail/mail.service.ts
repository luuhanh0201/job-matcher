import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, token: string, name = 'bạn') {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await this.mailerService
      .sendMail({
        to: email,
        subject: 'Xác minh email của bạn - Job Matcher',
        template: 'verify-email',
        context: {
          name,
          verifyUrl,
        },
      })
      .then(() => {
        console.log(`Email xác minh đã được gửi đến ${email}`);
      })
      .catch((error) => {
        console.error(`Lỗi gửi email đến ${email}:`, error);
      });
  }

  async sendRecruiterRegistrationSuccessEmail(email: string, name = 'bạn') {
    const dashboardUrl = `${process.env.FRONTEND_URL}/recruiter`;
    await this.mailerService
      .sendMail({
        to: email,
        subject: 'Đăng ký nhà tuyển dụng thành công - Job Matcher',
        template: 'recruiter-registration-success',
        context: {
          name,
          dashboardUrl,
        },
      })
      .then(() => {
        console.log(`Email thông báo recruiter đã được gửi đến ${email}`);
      })
      .catch((error) => {
        console.error(`Lỗi gửi email thông báo recruiter đến ${email}:`, error);
      });
  }
}
