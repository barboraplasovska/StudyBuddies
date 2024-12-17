import * as fs from "node:fs";
import * as path from "node:path";
import {CredentialEntity} from "domain/entity/CredentialEntity";
import {ErrorEnum} from "utils/enumerations/ErrorEnum";
import {HttpResponse} from "presentation/HttpResponse";
import {ICalCalendar} from "ical-generator";
import {ResetPasswordEntity} from "domain/entity/ResetPasswordEntity";
import nodemailer from 'nodemailer';
import {redis} from "../../app";
import request from "supertest";

const MAX = 999999;
const MIN = 100000;

class EmailService {

    private getHtml(htmlFilePath: string, validationCode: number = -1) {
        const templatePath = path.join(__dirname, htmlFilePath);
        let html = fs.readFileSync(templatePath, 'utf-8');
        if (validationCode !== -1)
            html = html.replace('[Verification Code]', String(validationCode));
        return html;
    }

    private async sendEmail(to: string, validationCode: number, htmlFilePath: string): Promise<boolean> {
        const transporter = nodemailer.createTransport({
            service: process.env.MAIL_SERVICE,
            auth: {
                user: process.env.MAIL_ADDRESS,
                pass: process.env.MAIL_APP_PWD
            }
        });

        const subject = htmlFilePath.includes("Registration") ? "Account confirmation" : "Password reset process";
        const mailOptions = {
            from: 'contact.sbuddies@gmail.com',
            to: to,
            subject: `[STUDYBUDDIES] ${subject}`,
            html: this.getHtml(htmlFilePath, validationCode),
            attachments: [{
                filename: 'StudyBuddiesLogo.png',
                path: path.join(__dirname, '../../resources/StudyBuddiesLogo.png'),
                cid: 'sbuddieslogo'
            }]
        };

        try {
            await transporter.sendMail(mailOptions);
            return true;
        }
        catch (err) {
            return false;
        }
    }

    async sendCalendar(to: string, eventName: string, calendar: ICalCalendar) {
        const transporter = nodemailer.createTransport({
            service: process.env.MAIL_SERVICE,
            auth: {
                user: process.env.MAIL_ADDRESS,
                pass: process.env.MAIL_APP_PWD
            }
        });

        const subject = `Add your event to your calendar: ${eventName}`;
        const mailOptions = {
            from: 'contact.sbuddies@gmail.com',
            to: to,
            subject: `[STUDYBUDDIES] ${subject}`,
            html: this.getHtml('../../resources/CalendarMail.html'),
            attachments: [
                {
                    filename: 'StudyBuddiesLogo.png',
                    path: path.join(__dirname, '../../resources/StudyBuddiesLogo.png'),
                    cid: 'sbuddieslogo'
                },
                {
                    filename: 'calendar.ics',
                    method: request,
                    content: calendar.toString()
                }]
        };

        try {
            await transporter.sendMail(mailOptions);
            return new HttpResponse({}, 201);
        }
        catch (err) {
            return new HttpResponse({error: "Bad Request."}, ErrorEnum.BAD_REQUEST);
        }
    }

    confirmRegistrationEmail(to: string, password: string, userId: string): Promise<boolean> {
        const validationCode = Math.floor(Math.random() * (MAX - MIN + 1) + MIN);
        setTimeout(async() => {
            await redis.delete(to);
        }, 300000);
        redis.set(to, new CredentialEntity(validationCode.toString(),to, password, userId));
        return this.sendEmail(to, validationCode, '../../resources/ConfirmRegistration.html');
    }

    askForNewCode(credentials: CredentialEntity): Promise<boolean> {
        const validationCode = Math.floor(Math.random() * (MAX - MIN + 1) + MIN);
        credentials.validationCode = validationCode.toString();
        redis.set(credentials.email, credentials);
        return this.sendEmail(credentials.email, validationCode, '../../resources/ConfirmRegistration.html');
    }

    initResetPasswordProcess(to: string) : Promise<boolean> {
        const validationCode = Math.floor(Math.random() * (MAX - MIN + 1) + MIN);
        redis.set(to, new ResetPasswordEntity(validationCode.toString(), to));
        return this.sendEmail(to, validationCode, '../../resources/ResetPassword.html');
    }
}

const emailService = new EmailService();

export {
    EmailService,
    emailService
};