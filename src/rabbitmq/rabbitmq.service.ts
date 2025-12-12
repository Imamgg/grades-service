import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from "amqplib";

@Injectable()
export class RabbitmqService {
  private connection: any;
  private channel: any;

  constructor(private configService: ConfigService) {
    this.connect();
  }

  async connect() {
    try {
      this.connection = await amqp.connect(
        this.configService.get("RABBITMQ_URL")
      );
      this.channel = await this.connection.createChannel();
      console.log("Connected to RabbitMQ");
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
    }
  }

  async publishToQueue(queue: string, message: any) {
    try {
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
      console.log(`Message sent to queue ${queue}`);
    } catch (error) {
      console.error("Error publishing to queue:", error);
    }
  }

  async publishGradeNotification(data: any) {
    await this.publishToQueue("grade_notifications", data);
  }

  async publishReportGeneration(data: any) {
    await this.publishToQueue("report_generation", data);
  }
}
