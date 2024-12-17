class DateWrapper {

    getTime(date: number) {
        return new Date(date).getTime();
    }
}

export {
    DateWrapper
};