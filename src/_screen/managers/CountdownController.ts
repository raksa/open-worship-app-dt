export default class CountdownController {
    countdownInterval: any = null;
    readonly divContainer: HTMLDivElement;
    readonly targetDateTime: Date;

    constructor(divContainer: HTMLDivElement, targetDateTime: Date) {
        this.divContainer = divContainer;
        this.targetDateTime = targetDateTime;
        this.setHtml(false);
        this.count();
    }

    get timeDiff() {
        return Math.max(0, this.targetDateTime.getTime() - Date.now());
    }

    get hours() {
        return Math.floor(
            (this.timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
    }

    get minutes() {
        return Math.floor((this.timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    }

    get seconds() {
        return Math.floor((this.timeDiff % (1000 * 60)) / 1000);
    }

    getDivChild(divId: string) {
        return this.divContainer.querySelector(`#${divId}`) as HTMLDivElement;
    }

    get divHour() {
        return this.getDivChild('hour');
    }

    get divMinute() {
        return this.getDivChild('minute');
    }

    get divSecond() {
        return this.getDivChild('second');
    }

    toTimeString(n: number) {
        return ('0' + n.toString()).slice(-2);
    }

    get hourStr() {
        return this.toTimeString(this.hours);
    }

    get minuteStr() {
        return this.toTimeString(this.minutes);
    }

    get secondStr() {
        return this.toTimeString(this.seconds);
    }

    count() {
        this.countdownInterval = setInterval(() => {
            if (this.countdownInterval === null) {
                return;
            }
            if (this.timeDiff > 0) {
                this.setHtml(false);
            } else {
                this.stop();
            }
        }, 1e3);
    }

    setHtml(isReset: boolean) {
        this.divHour.innerHTML = isReset ? '00' : this.hourStr;
        this.divMinute.innerHTML = isReset ? '00' : this.minuteStr;
        this.divSecond.innerHTML = isReset ? '00' : this.secondStr;
    }

    pause() {
        const countdownInterval = this.countdownInterval;
        this.countdownInterval = null;
        clearInterval(countdownInterval);
    }

    stop() {
        this.pause();
        this.setHtml(true);
    }

    static init(divContainer: HTMLDivElement, targetDate: Date) {
        return new CountdownController(divContainer, targetDate);
    }
}
