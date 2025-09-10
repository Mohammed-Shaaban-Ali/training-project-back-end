import {Injectable, Logger} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger =  new Logger(MailService.name);
  constructor(
    private readonly config: ConfigService,
  ) {
    const environment = this.config.getOrThrow<string>('app.nodeEnv');
    console.log('--environment:', environment);

    const isSecure = environment === 'production';
    const port = isSecure ? this.config.getOrThrow<string>('emailInfo.securePort') : this.config.getOrThrow<string>('emailInfo.nonSecurePort');
    const secure = isSecure ? true : false
    
    

    this.transporter =  nodemailer.createTransport({
      host: this.config.getOrThrow<string>('emailInfo.emailHost'), // e.g., Gmail: smtp.gmail.com
      port: +port,
      secure, // Use true for port 465
      auth: {
        user: this.config.getOrThrow<string>('emailInfo.emailAddress'),
        pass: this.config.getOrThrow<string>('emailInfo.emailPassword'),
      },
    })
  }

  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    try {
      console.log('--to:', to);
      console.log('--subject:', subject);
      console.log('--text:', text);
      // console.log('---html:', html);
      console.log('-- from email:', this.config.getOrThrow<string>('emailInfo.emailAddress'));
      console.log('--email password:', this.config.getOrThrow<string>('emailInfo.emailPassword'));
      const mailOptions = {
        from: this.config.getOrThrow<string>('emailInfo.emailAddress'),
        to,
        subject,
        text,
        ...(html ? {html} : {}),
      };
  
      await this.transporter.sendMail(mailOptions);

    } catch(error) {
      console.log('---error---');
      console.log(error);
      this.logger.error('sendMail::', error.trace);
      throw error;
    }
  }


 

}