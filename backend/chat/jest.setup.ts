jest.mock('fs');
jest.mock('mongoose');
jest.mock('swagger-jsdoc', () => {
    return jest.fn(() => ({}));
});