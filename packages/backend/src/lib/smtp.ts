import net from "node:net";
import tls from "node:tls";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  requireTls: boolean;
  user?: string;
  pass?: string;
  from: string;
  timeoutMs: number;
};

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export class SmtpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SmtpError";
  }
}

export function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

export async function sendSmtpMail(input: SendMailInput) {
  const config = getSmtpConfig();
  const client = new SmtpClient(config);
  await client.send(input);
}

function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;

  if (!host || !from) {
    throw new SmtpError("SMTP is not configured. Set SMTP_HOST and SMTP_FROM.");
  }

  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure = parseBoolean(process.env.SMTP_SECURE) || port === 465;

  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    secure,
    requireTls: parseBoolean(process.env.SMTP_REQUIRE_TLS ?? "true"),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from,
    timeoutMs: Number(process.env.SMTP_TIMEOUT_MS ?? "12000"),
  };
}

class SmtpClient {
  private socket: net.Socket | tls.TLSSocket | null = null;
  private buffer = "";

  constructor(private readonly config: SmtpConfig) {}

  async send(input: SendMailInput) {
    try {
      await this.connect();
      await this.expect(220);
      await this.command(`EHLO ${smtpDomain()}`, 250);

      if (!this.config.secure && this.config.requireTls) {
        await this.command("STARTTLS", 220);
        await this.upgradeToTls();
        await this.command(`EHLO ${smtpDomain()}`, 250);
      }

      if (this.config.user && this.config.pass) {
        const auth = Buffer.from(`\u0000${this.config.user}\u0000${this.config.pass}`).toString("base64");
        await this.command(`AUTH PLAIN ${auth}`, 235);
      }

      await this.command(`MAIL FROM:<${this.config.from}>`, 250);
      await this.command(`RCPT TO:<${input.to}>`, [250, 251]);
      await this.command("DATA", 354);
      await this.write(`${buildMessage(this.config.from, input)}\r\n.\r\n`);
      await this.expect(250);
      await this.command("QUIT", 221).catch(() => undefined);
    } catch (error) {
      throw new SmtpError(error instanceof Error ? error.message : "SMTP send failed");
    } finally {
      this.socket?.destroy();
    }
  }

  private async connect() {
    this.socket = await new Promise<net.Socket | tls.TLSSocket>((resolve, reject) => {
      const onError = (error: Error) => reject(error);
      const socket = this.config.secure
        ? tls.connect(this.config.port, this.config.host, { servername: this.config.host }, () => resolve(socket))
        : net.connect(this.config.port, this.config.host, () => resolve(socket));

      socket.setTimeout(this.config.timeoutMs, () => socket.destroy(new Error("SMTP connection timed out")));
      socket.once("error", onError);
    });

    this.socket.setEncoding("utf8");
    this.socket.on("data", (chunk) => {
      this.buffer += chunk;
    });
  }

  private async upgradeToTls() {
    if (!this.socket) throw new Error("SMTP socket is not connected");

    this.socket = await new Promise<tls.TLSSocket>((resolve, reject) => {
      const secureSocket = tls.connect(
        {
          socket: this.socket as net.Socket,
          servername: this.config.host,
        },
        () => resolve(secureSocket),
      );
      secureSocket.setTimeout(this.config.timeoutMs, () => {
        secureSocket.destroy(new Error("SMTP TLS upgrade timed out"));
      });
      secureSocket.once("error", reject);
    });

    this.buffer = "";
    this.socket.setEncoding("utf8");
    this.socket.on("data", (chunk) => {
      this.buffer += chunk;
    });
  }

  private async command(command: string, expected: number | number[]) {
    await this.write(`${command}\r\n`);
    return this.expect(expected);
  }

  private async write(value: string) {
    if (!this.socket) throw new Error("SMTP socket is not connected");
    await new Promise<void>((resolve, reject) => {
      this.socket!.write(value, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  private async expect(expected: number | number[]) {
    const expectedCodes = Array.isArray(expected) ? expected : [expected];
    const line = await this.readResponse();
    const code = Number(line.slice(0, 3));

    if (!expectedCodes.includes(code)) {
      throw new Error(`SMTP rejected command: ${line}`);
    }

    return line;
  }

  private async readResponse() {
    const startedAt = Date.now();

    while (Date.now() - startedAt < this.config.timeoutMs) {
      const lines = this.buffer.split(/\r?\n/).filter(Boolean);
      const finalIndex = lines.findIndex((line) => /^\d{3} /.test(line));

      if (finalIndex >= 0) {
        const finalLine = lines[finalIndex];
        this.buffer = "";
        return finalLine;
      }

      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    throw new Error("SMTP response timed out");
  }
}

function buildMessage(from: string, input: SendMailInput) {
  const boundary = `duitlater-${Date.now()}`;
  const headers = [
    `From: ${header(from)}`,
    `To: ${header(input.to)}`,
    `Subject: ${header(input.subject)}`,
    "MIME-Version: 1.0",
    `Date: ${new Date().toUTCString()}`,
    input.html
      ? `Content-Type: multipart/alternative; boundary="${boundary}"`
      : 'Content-Type: text/plain; charset="UTF-8"',
  ];

  if (!input.html) {
    return `${headers.join("\r\n")}\r\n\r\n${normalizeBody(input.text)}`;
  }

  return `${headers.join("\r\n")}\r\n\r\n--${boundary}\r\nContent-Type: text/plain; charset="UTF-8"\r\n\r\n${normalizeBody(input.text)}\r\n--${boundary}\r\nContent-Type: text/html; charset="UTF-8"\r\n\r\n${normalizeBody(input.html)}\r\n--${boundary}--`;
}

function header(value: string) {
  return value.replace(/[\r\n]/g, " ").trim();
}

function normalizeBody(value: string) {
  return value.replace(/\r?\n/g, "\r\n");
}

function smtpDomain() {
  return process.env.SMTP_EHLO_DOMAIN || "duitlater.local";
}

function parseBoolean(value: string | undefined) {
  return value === "true" || value === "1" || value === "yes";
}
