import { PrismaClient } from "@prisma/client";
import _ from 'lodash';

class LogProcessor {
  // specify batch size and interval as class instance variables.
  static CHUNK_SIZE = 500;
  static FLUSH_INTERVAL = 5000;

  // In-memory storage for logs
  spend_logs = [];
  key_logs = [];
  user_logs = [];
  team_logs = [];

  prisma = new PrismaClient();

  startProcessing() {
    setInterval(this.flushLogsToDb.bind(this), LogProcessor.FLUSH_INTERVAL);
  }

  async flushLogsToDb() {
    await this.processSpendLogs();
    await this.processKeyLogs();
    await this.processUserLogs();
    await this.processTeamLogs();
  }

  async processSpendLogs() {
    const chunkedLogs = _.chunk(this.spend_logs, LogProcessor.CHUNK_SIZE);

    for (const chunk of chunkedLogs) {
      await this.prisma.spend_logs.createMany({ data: chunk });
      this.spend_logs = this.spend_logs.slice(chunk.length);
      console.log(`Flushed ${chunk.length} logs to the spend_logs table.`);
    }
  }

  async processKeyLogs() {
    for (const log of this.key_logs) {
      await this.prisma.key_logs.update({
        where: { token: log.token },
        data: { spend: { increment: log.spend } },
      });
    }
    this.key_logs = [];
    console.log(`Updated key_logs table.`);
  }

  async processUserLogs() {
    for (const log of this.user_logs) {
      await this.prisma.user_logs.update({
        where: { user_id: log.user_id },
        data: { spend: { increment: log.spend } },
      });
    }
    this.user_logs = [];
    console.log(`Updated user_logs table.`);
  }

  async processTeamLogs() {
    for (const log of this.team_logs) {
      await this.prisma.team_logs.update({
        where: { team_id: log.team_id },
        data: { spend: { increment: log.spend } },
      });
    }
    this.team_logs = [];
    console.log(`Updated team_logs table.`);
  }
}

const logProcessor = new LogProcessor
logProcessor.startProcessing();