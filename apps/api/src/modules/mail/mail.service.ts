import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private readonly templates: Record<string, string> = {};

  constructor(private readonly mailerService: MailerService) {
    this.loadTemplates();
  }

  private loadTemplates() {
    const templateDir = path.join(__dirname, 'templates');
    const templateFiles = ['verify-email.html'];

    for (const file of templateFiles) {
      try {
        const filePath = path.join(templateDir, file);
        this.templates[file] = fs.readFileSync(filePath, 'utf-8');
      } catch {
        console.warn(`Không thể load template: ${file}`);
      }
    }
  }

  private renderTemplate(
    name: string,
    variables: Record<string, string>,
  ): string {
    let template = this.templates[name];
    if (!template) {
      console.warn(`Template "${name}" not found, falling back to inline HTML`);
      return this.getFallbackTemplate(variables);
    }

    for (const [key, value] of Object.entries(variables)) {
      template = template.replaceAll(`{{${key}}}`, value);
    }

    return template;
  }

  private getFallbackTemplate(variables: Record<string, string>): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
        <h1 style="color: #1e40af;">Job Matcher</h1>
        <p>Xin chào <strong>${variables.name}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấn vào liên kết dưới đây để xác minh email:</p>
        <a href="${variables.verifyUrl}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Xác minh email</a>
        <p style="margin-top: 24px; color: #64748b;">Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
        <p>Trân trọng,<br/><strong>Đội ngũ Job Matcher</strong></p>
      </div>
    `;
  }

  async sendVerificationEmail(email: string, token: string, name = 'bạn') {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const htmlContent = this.renderTemplate('verify-email.html', {
      name,
      verifyUrl,
    });

    await this.mailerService
      .sendMail({
        to: email,
        subject: 'Xác minh email của bạn - Job Matcher',
        html: htmlContent,
      })
      .then(() => {
        console.log(`Email xác minh đã được gửi đến ${email}`);
      })
      .catch((error) => {
        console.error(`Lỗi gửi email đến ${email}:`, error);
      });
  }
}
