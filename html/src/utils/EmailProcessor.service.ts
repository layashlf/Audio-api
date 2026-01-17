import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from './EmailService';


type EmailJobData = {
    to: string;
    subject: string;
    body: {[key: string]: string | any;}
    action: string
};

@Processor('email', { concurrency: 5 })
export class EmailProcessor extends WorkerHost {
    constructor(private readonly emailService: EmailService) {

        super();
    }
    async process(job: Job<EmailJobData>): Promise<void> {
        const { to, subject, body, action } = job.data
        this.emailService.sendEmail({ to,subject, body }, action)
    }
}