function StateMachine(states) {
    if (!states.IDLE) throw new Error("Missing IDLE state");
    var currentStateName = "IDLE";
    var lock = 0;
    this.trigger = function(eventName) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (lock) throw new Error("Cannot trigger an event while inside an event handler");
        lock++;
        try {
            var currentState = states[currentStateName];
            if (currentState[eventName]) {
                var nextStateName = (typeof currentState[eventName] == "string") ? currentState[eventName] : currentState[eventName].apply(currentState, args);
                if (nextStateName) {
                    if (typeof nextStateName == "string") {
                        if (states[nextStateName]) {
                            currentStateName = nextStateName;
                            if (states[currentStateName].onTransitionIn) states[currentStateName].onTransitionIn();
                        }
                        else throw new Error("Unknown next-state " + nextStateName);
                    }
                    else throw new Error("Event handler must return next-state's name or null to stay in same state");
                }
            }
            else throw new Error("No handler '" + eventName + "' in state " + currentStateName);
        }
        finally {
            lock--;
        }
    }
    this.getState = function() {
        return currentStateName;
    }
}

// if (!Promise.prototype.finally) {
//     Object.defineProperty(Promise.prototype, 'finally', {
//         value: function(callback) {
//             var promise = this;
//             function chain() {
//                 return Promise.resolve(callback()).then(function() {return promise});
//             }
//             return promise.then(chain, chain);
//         },
//         configurable: true,
//         writable: true
//     })
// }
