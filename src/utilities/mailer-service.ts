import {Injectable, Logger} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private  transporter: nodemailer.Transporter;
  private readonly logger =  new Logger(MailService.name);
  
  constructor(private readonly config: ConfigService ) {}

  // lazy loading, only will be created once it used, not in the app initialization stage
  private getTransporter(): nodemailer.Transporter {

    if (!this.transporter) {
      const environment = this.config.getOrThrow<string>('app.nodeEnv');
  
      const isSecure = environment === 'production';
      const port = isSecure ? this.config.getOrThrow<string>('emailInfo.securePort') : this.config.getOrThrow<string>('emailInfo.nonSecurePort');
  
      this.transporter =  nodemailer.createTransport({
        host: this.config.getOrThrow<string>('emailInfo.emailHost'), // e.g., Gmail: smtp.gmail.com
        port: +port,
        secure: isSecure, // Use true for port 465
        auth: {
          user: this.config.getOrThrow<string>('emailInfo.emailAddress'),
          pass: this.config.getOrThrow<string>('emailInfo.emailPassword'),
        },
      })
    }

    return this.transporter;
  }

  public async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    try {

      const mailOptions = {
        from: this.config.getOrThrow<string>('emailInfo.emailAddress'),
        to,
        subject,
        text,
        ...(html ? {html} : {}),
      };
  
      await this.getTransporter().sendMail(mailOptions);

    } catch(error) {
      this.logger.error('sendMail::', error.stack);
      
      throw error;
    }
  }

}