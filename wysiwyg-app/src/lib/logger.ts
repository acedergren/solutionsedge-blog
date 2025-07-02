export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3
}

export class Logger {
	private static instance: Logger;
	private logLevel: LogLevel = LogLevel.INFO;

	private constructor() {}

	static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	setLogLevel(level: LogLevel): void {
		this.logLevel = level;
	}

	private log(level: LogLevel, message: string, ...args: any[]): void {
		if (level >= this.logLevel) {
			const timestamp = new Date().toISOString();
			const levelStr = LogLevel[level];
			
			switch (level) {
				case LogLevel.DEBUG:
					console.debug(`[${timestamp}] [${levelStr}] ${message}`, ...args);
					break;
				case LogLevel.INFO:
					console.log(`[${timestamp}] [${levelStr}] ${message}`, ...args);
					break;
				case LogLevel.WARN:
					console.warn(`[${timestamp}] [${levelStr}] ${message}`, ...args);
					break;
				case LogLevel.ERROR:
					console.error(`[${timestamp}] [${levelStr}] ${message}`, ...args);
					break;
			}
		}
	}

	debug(message: string, ...args: any[]): void {
		this.log(LogLevel.DEBUG, message, ...args);
	}

	info(message: string, ...args: any[]): void {
		this.log(LogLevel.INFO, message, ...args);
	}

	warn(message: string, ...args: any[]): void {
		this.log(LogLevel.WARN, message, ...args);
	}

	error(message: string, ...args: any[]): void {
		this.log(LogLevel.ERROR, message, ...args);
	}
}

export const logger = Logger.getInstance();