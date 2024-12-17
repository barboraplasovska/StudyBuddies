jest.mock('bull', () => {
    return jest.fn().mockImplementation(() => ({
        add: jest.fn(),
        close: jest.fn(),
        process: jest.fn(),
    }));
});
jest.mock('fs');
jest.mock('swagger-jsdoc', () => {
    return jest.fn(() => ({}));
});
