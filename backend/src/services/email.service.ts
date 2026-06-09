import nodemailer from 'nodemailer';
import { env } from '../config/env';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });
    } else {
      console.warn('SMTP settings are missing. Email Service will run in mock mode.');
    }
  }

  async sendExpertConnectionRequest(expertEmail: string, userName: string) {
    if (!this.transporter) {
      console.log(`[Mock Email] To: ${expertEmail} - Connection request from ${userName}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: env.SMTP_FROM || 'GOODVIET <noreply@goodviet.com>',
        to: expertEmail,
        subject: 'Yêu cầu kết nối từ học viên GOODVIET',
        html: `
          <h2>Yêu cầu kết nối mới</h2>
          <p>Học viên <strong>${userName}</strong> muốn kết nối với bạn.</p>
          <p>Vui lòng đăng nhập để xem chi tiết và phản hồi.</p>
        `,
      });
    } catch (err) {
      console.error('Failed to send email', err);
    }
  }

  async sendSessionConfirmation(userEmail: string, sessionDate: Date) {
    if (!this.transporter) {
      console.log(`[Mock Email] To: ${userEmail} - Session confirmed for ${sessionDate}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: env.SMTP_FROM || 'GOODVIET <noreply@goodviet.com>',
        to: userEmail,
        subject: 'Xác nhận đặt lịch tư vấn',
        html: `
          <h2>Lịch tư vấn đã được xác nhận</h2>
          <p>Thời gian: <strong>${sessionDate.toLocaleString('vi-VN')}</strong></p>
          <p>Vui lòng có mặt đúng giờ.</p>
        `,
      });
    } catch (err) {
      console.error('Failed to send email', err);
    }
  }
}

export const emailService = new EmailService();
