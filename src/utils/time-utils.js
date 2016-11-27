
export function getTimestamp(since = 0.0) {
    const date = new Date();
    return (date.getTime() + date.getMilliseconds() / 1000.0) - since;
}
