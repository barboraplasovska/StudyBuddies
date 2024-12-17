import Bull from "bull";
import {EventModel} from "database/model/EventModel";
import {EventUserModel} from "database/model/EventUserModel";
import {ExamModel} from "database/model/ExamModel";
import fs from "node:fs";
import nodemailer from "nodemailer";
import path from "node:path";
import {CredentialRepository, credentialRepository} from "database/repository/CredentialRepository";
import {EventRepository, eventRepository} from "database/repository/EventRepository";
import {EventUserRepository, eventUserRepository} from "database/repository/EventUserRepository";
import {ExamRepository, examRepository} from "database/repository/ExamRepository";
import {GroupRepository, groupRepository} from "database/repository/GroupRepository";
import {UserRepository, userRepository} from "database/repository/UserRepository";

const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;
const REDIS = { redis: { port: 6379, host: 'redis' } };

class NotificationService {
    examQueue: Bull.Queue = new Bull('ExamQueue', REDIS);
    eventQueue: Bull.Queue = new Bull('EventQueue', REDIS);

    eventRepository: EventRepository;
    eventUserRepository: EventUserRepository;

    examRepository: ExamRepository;

    userRepository: UserRepository;
    credentialRepository: CredentialRepository;

    groupRepository: GroupRepository;

    transporter = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.MAIL_ADDRESS,
            pass: process.env.MAIL_APP_PWD
        }
    });

    constructor(eventRepository: EventRepository,
                eventUserRepository: EventUserRepository,
                examRepository: ExamRepository,
                userRepository: UserRepository,
                credentialRepository: CredentialRepository,
                groupRepository: GroupRepository) {
        
        this.eventRepository = eventRepository;
        this.eventUserRepository = eventUserRepository;
        this.examRepository = examRepository;
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
        this.groupRepository = groupRepository;

        this.examQueue.process(async (job) => {
            await this.notifyExam(job.data.id);
        });

        this.eventQueue.process(async (job) => {
            await this.notifyEvent(job.data.id);
        });
    }

    async closeQueues() {
        await this.examQueue.close();
        await this.eventQueue.close();
    }

    // Get html template and replace variables with necessary information
    private getEventHtml(event: EventModel) {
        const templatePath = path.join(__dirname, '../../resources/EventNotification.html');
        let html = fs.readFileSync(templatePath, 'utf-8');
        html = html.replace('[Event Name]', event.name!)
            .replace('[Event Date and Time]', event.date!)
            .replace('[Event Details]', event.description!)
            .replace('[Event Location]', event.location!);

        return html;
    }

    // Get html template and replace variables with necessary information
    private getExamHtml(event: ExamModel) {
        const templatePath = path.join(__dirname, '../../resources/ExamNotification.html');
        let html = fs.readFileSync(templatePath, 'utf-8');
        html = html.replace('[Exam Name]', event.name!)
            .replace('[Exam Date and Time]', event.date!)
            .replace('[Exam Details]', event.description!);

        return html;
    }

    private async sendEventNotification(to: string, html: string, image: string): Promise<boolean> {
        const mailOptions = {
            from: 'contact.sbuddies@gmail.com',
            to: to,
            subject: "[STUDYBUDDIES][EVENT] Notification",
            html: html,
            attachments: [
                {
                    filename: 'StudyBuddiesLogo.png',
                    path: path.join(__dirname, '../../resources/StudyBuddiesLogo.png'),
                    cid: 'sbuddieslogo'
                },
                {
                    filename: 'eventBackgroundUrl',
                    content: image,
                    cid: 'eventbackground'
                }
            ]
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return true;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }

    private async sendExamNotification(to: string, html: string): Promise<boolean> {
        const mailOptions = {
            from: 'contact.sbuddies@gmail.com',
            to: to,
            subject: "[STUDYBUDDIES][EVENT] Notification",
            html: html,
            attachments: [
                {
                    filename: 'StudyBuddiesLogo.png',
                    path: path.join(__dirname, '../../resources/StudyBuddiesLogo.png'),
                    cid: 'sbuddieslogo'
                },
            ]
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return true;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }

    async notifyExam(id: string) {
        const exam = await this.examRepository.getById(id);
        if (!exam || new Date(exam.date!).getTime() <= Date.now()) {
            return;
        }

        const user = await this.userRepository.getById(exam.id);
        if (!user || user.banDate == null) {
            return;
        }

        let html = this.getExamHtml(exam);
        html = html.replace('[User\'s Name]', user.name!);

        const credentials = await this.credentialRepository.getByUserId(user.id);

        await this.sendExamNotification(credentials!.email!, html);
    }

    async notifyEvent(id: string) {
        const event = await this.eventRepository.getById(id);
        if (!event || new Date(event.date!).getTime() <= Date.now()) {
            return;
        }

        const group = await this.groupRepository.getById(event.groupId!);
        if (!group) {
            return;
        }

        // Send a notification to each user.
        let html = this.getEventHtml(event);
        html = html.replace('[Group Name]', group!.name!);
        const eventUsers : EventUserModel[] = await this.eventUserRepository.getByEventId(id);
        const notifications = eventUsers.map(async (eventUser ) => {
                const user = await this.userRepository.getById(eventUser.userid!);
                if (!user || user.banDate == null) {
                    return;
                }

                html = html.replace('[User\'s Name]', user.name!);

                const credentials = await this.credentialRepository.getByUserId(user.id!);

                return this.sendEventNotification(credentials!.email!, html, group.picture!);
        });

        await Promise.all(notifications);
    }

    addExam(examId: string, date: Date) {
        this.examQueue.add({ id: examId }, { delay: date.getTime() - Date.now() - DAY });
    }

    addEvent(eventId: string, date: Date) {
        this.eventQueue.add({ id: eventId }, { delay: date.getTime() - Date.now() - HOUR });
    }
}

const notificationService = new NotificationService(
    eventRepository,
    eventUserRepository,
    examRepository,
    userRepository,
    credentialRepository,
    groupRepository,
);

export  {
    NotificationService,
    notificationService
};