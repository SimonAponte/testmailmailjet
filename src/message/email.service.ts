import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'node-mailjet';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  //private mailjet;

  constructor(private configService: ConfigService) {}

  async sendEmail(data: SendEmailDto): Promise<{ success: boolean } | null> {
    /*const mailjet = Mailjet.(
      'd8136d48d9bce168625227037d140dda',
      '35fab2f0e48dc5dedfa345b0898cdc91',
    );*/

    try {
      const mailjet = new Client({
        apiKey: 'secret',
        apiSecret: 'secret',
      });
      const { sender, recipients, subject, html, text } = data;

      const message: any = {
        From: sender ?? {
          Email: this.configService.get('MAIL_SENDER_DEFAULT'),
          Name: this.configService.get('MAIL_SENDER_NAME_DEFAULT'),
        },
        To: recipients.map((recipient) => ({
          Email: recipient.address,
          Name: recipient.name || '',
        })),
        Subject: subject,
        HTMLPart: html,
        TextPart: text || this.htmlToText(html),
      };
      await mailjet
        .post('send', { version: 'v3.1' })
        .request({ Messages: [message] });

      return { success: true };
    } catch (error) {
      console.error('Mailjet error:', error);
      return null;
    }
  }

  private htmlToText(html: string): string {
    // Implementación básica para convertir HTML a texto plano
    return html.replace(/<[^>]*>/g, '');
  }
}
