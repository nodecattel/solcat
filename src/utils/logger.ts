import { LogLevel } from '../types/enums.js';
import { LogMessage } from '../types/index.js';
import util from 'util';
import config from '../config/index.js';

class Logger {
    private logLevel: LogLevel = LogLevel.INFO;
    private isDevelopment = config.isDevelopment;

    private readonly COLOR_CODES = {
        [LogLevel.DEBUG]: '\x1b[35m',  // Magenta
        [LogLevel.INFO]: '\x1b[36m',   // Cyan
        [LogLevel.WARN]: '\x1b[33m',   // Yellow
        [LogLevel.ERROR]: '\x1b[31m',  // Red
        timestamp: '\x1b[90m',         // Gray
        reset: '\x1b[0m'               // Reset
    };

    public debug(message: string, data?: unknown): void {
        this.log(LogLevel.DEBUG, message, data);
    }

    public info(message: string, data?: unknown): void {
        this.log(LogLevel.INFO, message, data);
    }

    public warn(message: string, data?: unknown): void {
        this.log(LogLevel.WARN, message, data);
    }

    public error(message: string, data?: unknown): void {
        this.log(LogLevel.ERROR, message, data);
    }

    private formatData(data: unknown): string {
        return util.inspect(data, {
            colors: true,
            depth: null,
            compact: false
        });
    }

    private colorize(text: string, colorCode: string): string {
        return `${colorCode}${text}${this.COLOR_CODES.reset}`;
    }

    private log(level: LogLevel, message: string, data?: unknown): void {
        if (this.shouldLog(level)) {
            const timestamp = new Date().toISOString();
            
            if (this.isDevelopment) {
                const levelColor = this.COLOR_CODES[level];
                const formattedLevel = this.colorize(level.padEnd(5), levelColor);
                const formattedTimestamp = this.colorize(timestamp, this.COLOR_CODES.timestamp);
                
                console.log(`\n${formattedLevel} [${formattedTimestamp}] ${message}`);
                
                if (data) {
                    console.log(this.formatData(data));
                    console.log(''); // Empty line after data
                }
            } else {
                // Production JSON format
                const logMessage: LogMessage = {
                    level,
                    message,
                    timestamp: new Date(),
                    data
                };
                console.log(JSON.stringify(logMessage));
            }
        }
    }

    private shouldLog(level: LogLevel): boolean {
        const levels = Object.values(LogLevel);
        return levels.indexOf(level) >= levels.indexOf(this.logLevel);
    }
}

export const logger = new Logger();
