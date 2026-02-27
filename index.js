require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
const port = process.env.PORT || 3000;

const reports = [];

bot.start((ctx) => {
    ctx.reply('Welcome to the Stockbud Support Bot!\n\nHow to use:\n- Type /report <your issue> to submit a report.\n- Type /reports to view all submitted reports.');
});

bot.command('report', (ctx) => {
    const reportText = ctx.message.text.split(' ').slice(1).join(' ');

    if (!reportText) {
        return ctx.reply('Please provide a message for your report.\nExample: /report Cannot log into my account');
    }

    const newReport = {
        id: reports.length + 1,
        userId: ctx.from.id,
        username: ctx.from.username || ctx.from.first_name || 'Unknown User',
        message: reportText,
        timestamp: new Date().toISOString()
    };

    reports.push(newReport);
    ctx.reply(`Thank you! Your report (ID: ${newReport.id}) has been received and saved. Our support team will review it.`);
});

bot.command('reports', (ctx) => {
    if (reports.length === 0) {
        return ctx.reply('There are currently no reports submitted.');
    }

    let replyText = '*All Support Reports:*\n\n';

    const recentReports = reports.slice(-10);

    recentReports.forEach((report) => {
        replyText += `ID: ${report.id}\nUser: @${report.username}\nIssue: ${report.message}\nTime: ${report.timestamp}\n----------------\n`;
    });


    if (reports.length > 10) {
        replyText += `\n...and ${reports.length - 10} more older reports.`;
    }

    ctx.reply(replyText, { parse_mode: 'Markdown' });
});

bot.launch().then(() => {
    console.log('Stockbud Support Bot is up and running!');
}).catch((err) => {
    console.error('Failed to start the bot:', err);
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Stockbud Support Bot is running!');
});

app.get('/api/reports', (req, res) => {
    res.json({
        total: reports.length,
        reports: reports
    });
});

app.listen(port, () => {
    console.log(`Express server is listening on port ${port}`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
