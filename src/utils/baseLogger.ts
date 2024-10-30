import { LogLevel } from '../types/enums.js';

interface LogData {
    level: LogLevel;
    timestamp: string;
    message: string;
    data?: unknown;
    error?: unknown;
}

export const baseLogger = {
    info: (message: string, data?: unknown) => {
        const logData: LogData = {
            level: LogLevel.INFO,
            timestamp: new Date().toISOString(),
            message
        };

        if (data !== undefined) {
            logData.data = data;
        }

        console.log(JSON.stringify(logData));
    },

    error: (message: string, error?: unknown) => {
        const logData: LogData = {
            level: LogLevel.ERROR,
            timestamp: new Date().toISOString(),
            message
        };

        if (error !== undefined) {
            logData.error = error;
        }

        console.log(JSON.stringify(logData));
    }
};
