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

type ApplicationResultEmailPayload = {
  to: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
};

type CompanyApprovalEmailPayload = {
  to: string;
  name: string;
  companyName: string;
  reason?: string | null;
};

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

  async sendCompanyApprovedEmail(payload: CompanyApprovalEmailPayload) {
    const dashboardUrl = `${process.env.FRONTEND_URL}/recruiter/post-job`;
    await this.mailerService
      .sendMail({
        to: payload.to,
        subject: `Công ty ${payload.companyName} đã được phê duyệt - Job Matcher`,
        template: 'company-approved',
        context: {
          name: payload.name,
          companyName: payload.companyName,
          dashboardUrl,
        },
      })
      .then(() => {
        console.log(`Email duyệt công ty đã được gửi đến ${payload.to}`);
      })
      .catch((error) => {
        console.error(`Lỗi gửi email duyệt công ty đến ${payload.to}:`, error);
      });
  }

  async sendCompanyRejectedEmail(payload: CompanyApprovalEmailPayload) {
    const companyUrl = `${process.env.FRONTEND_URL}/recruiter/company/list`;
    await this.mailerService
      .sendMail({
        to: payload.to,
        subject: `Hồ sơ công ty ${payload.companyName} chưa được phê duyệt - Job Matcher`,
        template: 'company-rejected',
        context: {
          name: payload.name,
          companyName: payload.companyName,
          reason: payload.reason ?? null,
          companyUrl,
        },
      })
      .then(() => {
        console.log(`Email từ chối công ty đã được gửi đến ${payload.to}`);
      })
      .catch((error) => {
        console.error(
          `Lỗi gửi email từ chối công ty đến ${payload.to}:`,
          error,
        );
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
  async sendApplicationHiredEmail(payload: ApplicationResultEmailPayload) {
    const applicationsUrl = `${process.env.FRONTEND_URL}/profile/applications`;
    await this.mailerService
      .sendMail({
        to: payload.to,
        subject: `Chúc mừng bạn đã trúng tuyển ${payload.jobTitle} - Job Matcher`,
        template: 'interview-passed',
        context: {
          ...payload,
          applicationsUrl,
        },
      })
      .then(() => {
        console.log(
          `Email thông báo trúng tuyển đã được gửi đến ${payload.to}`,
        );
      })
      .catch((error) => {
        console.error(
          `Lỗi gửi email thông báo trúng tuyển đến ${payload.to}:`,
          error,
        );
      });
  }

  async sendApplicationRejectedEmail(payload: ApplicationResultEmailPayload) {
    const applicationsUrl = `${process.env.FRONTEND_URL}/profile/applications`;
    await this.mailerService
      .sendMail({
        to: payload.to,
        subject: `Thông báo kết quả ứng tuyển ${payload.jobTitle} - Job Matcher`,
        template: 'interview-rejected',
        context: {
          ...payload,
          applicationsUrl,
        },
      })
      .then(() => {
        console.log(
          `Email thông báo từ chối ứng tuyển đã được gửi đến ${payload.to}`,
        );
      })
      .catch((error) => {
        console.error(
          `Lỗi gửi email thông báo từ chối ứng tuyển đến ${payload.to}:`,
          error,
        );
      });
  }

  async sendCandidateTalentPoolEmail(payload: ApplicationResultEmailPayload) {
    const applicationsUrl = `${process.env.FRONTEND_URL}/profile/applications`;
    await this.mailerService
      .sendMail({
        to: payload.to,
        subject: `Hồ sơ của bạn đã được lưu lại cho ${payload.jobTitle} - Job Matcher`,
        template: 'candidate-talent-pool',
        context: {
          ...payload,
          applicationsUrl,
        },
      })
      .then(() => {
        console.log(`Email thông báo lưu hồ sơ đã được gửi đến ${payload.to}`);
      })
      .catch((error) => {
        console.error(
          `Lỗi gửi email thông báo lưu hồ sơ đến ${payload.to}:`,
          error,
        );
      });
  }
}
