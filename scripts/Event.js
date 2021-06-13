// Event class from Eleazar Meza @ https://hackernoon.com/writing-a-simple-mvc-model-view-controller-app-in-vanilla-javascript-u65i34lx
class Event {
    constructor() {
        this.listeners = [];
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    trigger(params) {
        this.listeners.forEach(listener => { listener(params); });
    }
}

export default Event;