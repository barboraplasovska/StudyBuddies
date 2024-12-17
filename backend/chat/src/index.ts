import { server } from './app';

server.listen(4001, () => {
    // eslint-disable-next-line no-restricted-syntax
    console.log(`Server running on port 4001.`);
});