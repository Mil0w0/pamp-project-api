export interface EmailNotification {
    to: string;
    subject: string;
    message: string;
    from: string;
    buttonText?: string;
}

export class NotificationError extends Error {
    constructor(
        message: string,
        public readonly type: 'API_ERROR' | 'HTTP_ERROR' | 'ENV_ERROR' | 'JSON_ERROR',
        public readonly originalError?: Error,
    ) {
        super(message);
        this.name = 'NotificationError';
    }

    static apiError(message: string): NotificationError {
        return new NotificationError(`API error: ${message}`, 'API_ERROR');
    }

    static httpError(error: Error): NotificationError {
        return new NotificationError(`HTTP client error: ${error.message}`, 'HTTP_ERROR', error);
    }

    static envError(variable: string): NotificationError {
        return new NotificationError(`Environment variable not set: ${variable}`, 'ENV_ERROR');
    }
}