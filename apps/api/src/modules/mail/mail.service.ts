import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InterviewStatus } from '@/common/enum/Interview.enum';

type InterviewInvitationEmailPayload = {
  to: string;
  candidateName: string;
  recruiterName: string;
  jobTitle: string;
  companyName: string;
  scheduledAt: Date;
  durationMinutes: number;
  meetingUrl?: string | null;
  location?: string | null;
  note?: string | null;
};

type InterviewResponseEmailPayload = {
  to: string;
  candidateName: string;
  recruiterName: string;
  jobTitle: string;
  companyName: string;
  scheduledAt: Date;
  status: InterviewStatus;
};

type InterviewScheduleChangeEmailPayload = InterviewInvitationEmailPayload;

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  private formatDateTime(value: Date) {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(value);
  }

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

  async sendInterviewInvitationEmail(payload: InterviewInvitationEmailPayload) {
    const applicationsUrl = `${process.env.FRONTEND_URL}/profile/applications`;
    await this.mailerService
      .sendMail({
        to: payload.to,
        subject: `Lời mời phỏng vấn ${payload.jobTitle} - Job Matcher`,
        template: 'interview-invitation',
        context: {
          ...payload,
          scheduledAtText: this.formatDateTime(payload.scheduledAt),
          applicationsUrl,
        },
      })
      .then(() => {
        console.log(`Email mời phỏng vấn đã được gửi đến ${payload.to}`);
      })
      .catch((error) => {
        console.error(`Lỗi gửi email mời phỏng vấn đến ${payload.to}:`, error);
      });
  }

  async sendInterviewResponseEmail(payload: InterviewResponseEmailPayload) {
    const statusText =
      payload.status === InterviewStatus.ACCEPTED
        ? 'đã xác nhận tham gia'
        : 'đã từ chối';
    const interviewsUrl = `${process.env.FRONTEND_URL}/recruiter/interviews`;

    await this.mailerService
      .sendMail({
        to: payload.to,
        subject: `Ứng viên ${statusText} phỏng vấn - Job Matcher`,
        template: 'interview-response',
        context: {
          ...payload,
          statusText,
          scheduledAtText: this.formatDateTime(payload.scheduledAt),
          interviewsUrl,
        },
      })
      .then(() => {
        console.log(`Email phản hồi phỏng vấn đã được gửi đến ${payload.to}`);
      })
      .catch((error) => {
        console.error(
          `Lỗi gửi email phản hồi phỏng vấn đến ${payload.to}:`,
          error,
        );
      });
  }

  async sendInterviewUpdatedEmail(
    payload: InterviewScheduleChangeEmailPayload,
  ) {
    const applicationsUrl = `${process.env.FRONTEND_URL}/profile/applications`;
    await this.mailerService
      .sendMail({
        to: payload.to,
        subject: `Lịch phỏng vấn ${payload.jobTitle} đã được cập nhật - Job Matcher`,
        template: 'interview-updated',
        context: {
          ...payload,
          scheduledAtText: this.formatDateTime(payload.scheduledAt),
          applicationsUrl,
        },
      })
      .then(() => {
        console.log(
          `Email cập nhật lịch phỏng vấn đã được gửi đến ${payload.to}`,
        );
      })
      .catch((error) => {
        console.error(
          `Lỗi gửi email cập nhật lịch phỏng vấn đến ${payload.to}:`,
          error,
        );
      });
  }

  async sendInterviewCancelledEmail(
    payload: InterviewScheduleChangeEmailPayload,
  ) {
    const applicationsUrl = `${process.env.FRONTEND_URL}/profile/applications`;
    await this.mailerService
      .sendMail({
        to: payload.to,
        subject: `Lịch phỏng vấn ${payload.jobTitle} đã bị hủy - Job Matcher`,
        template: 'interview-cancelled',
        context: {
          ...payload,
          scheduledAtText: this.formatDateTime(payload.scheduledAt),
          applicationsUrl,
        },
      })
      .then(() => {
        console.log(`Email hủy lịch phỏng vấn đã được gửi đến ${payload.to}`);
      })
      .catch((error) => {
        console.error(
          `Lỗi gửi email hủy lịch phỏng vấn đến ${payload.to}:`,
          error,
        );
      });
  }
}
