
require("../array");

describe("ObservableArray", function () {

    var array = [1, 2, 3];
    var spy;

    // the following tests all share the same initial array so they
    // are sensitive to changes in order

    it("set up listeners", function () {

        Object.addBeforeOwnPropertyChangeListener(array, "length", function (length) {
            spy("length change from", length);
        });

        Object.addOwnPropertyChangeListener(array, "length", function (length) {
            spy("length change to", length);
        });

        array.addBeforeContentChangeListener(function (plus, minus, index) {
            spy("before content change at", index, "to add", plus.slice(), "to remove", minus.slice());
        });

        array.addContentChangeListener(function (plus, minus, index) {
            spy("content change at", index, "added", plus.slice(), "removed", minus.slice());
        });

        array.addBeforeEachContentChangeListener(function (value, key) {
            spy("change at", key, "from", value);
        });

        array.addEachContentChangeListener(function (value, key) {
            spy("change at", key, "to", value);
        });

    });

    it("wipe initial values", function () {
        spy = jasmine.createSpy();
        expect(array.slice()).toEqual([1, 2, 3]);
        array.wipe();
        expect(array.slice()).toEqual([]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 3],
            ["before content change at", 0, "to add", [], "to remove", [1, 2, 3]],
            ["change at", 0, "from", 1],
            ["change at", 1, "from", 2],
            ["change at", 2, "from", 3],
            ["change at", 0, "to", undefined],
            ["change at", 1, "to", undefined],
            ["change at", 2, "to", undefined],
            ["content change at", 0, "added", [], "removed", [1, 2, 3]],
            ["length change to", 0]
        ]);
    });

    it("push two values on empty array", function () {
        spy = jasmine.createSpy();
        expect(array.slice()).toEqual([]); // initial
        array.push(10, 20);
        expect(array.slice()).toEqual([10, 20]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 0],
            ["before content change at", 0, "to add", [10, 20], "to remove", []],
            ["change at", 0, "from", undefined],
            ["change at", 1, "from", undefined],
            ["change at", 0, "to", 10],
            ["change at", 1, "to", 20],
            ["content change at", 0, "added", [10, 20], "removed", []],
            ["length change to", 2],
        ]);

    });

    it("pop one value", function () {
        spy = jasmine.createSpy();
        expect(array.slice()).toEqual([10, 20]);
        array.pop();
        expect(array.slice()).toEqual([10]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 2],
            ["before content change at", 1, "to add", [], "to remove", [20]],
            ["change at", 1, "from", 20],
            ["change at", 1, "to", undefined],
            ["content change at", 1, "added", [], "removed", [20]],
            ["length change to", 1],
        ]);

    });

    it("push two values on top of existing one, with hole open for splice", function () {
        spy = jasmine.createSpy();
        expect(array.slice()).toEqual([10]);
        array.push(40, 50);
        expect(array.slice()).toEqual([10, 40, 50]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 1],
            ["before content change at", 1, "to add", [40, 50], "to remove", []],
            ["change at", 1, "from", undefined],
            ["change at", 2, "from", undefined],
            ["change at", 1, "to", 40],
            ["change at", 2, "to", 50],
            ["content change at", 1, "added", [40, 50], "removed", []],
            ["length change to", 3]
        ]);
    });

    it("splices two values into middle", function () {
        spy = jasmine.createSpy();
        expect(array.slice()).toEqual([10, 40, 50]);
        expect(array.splice(1, 0, 20, 30)).toEqual([]);
        expect(array.slice()).toEqual([10, 20, 30, 40, 50]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 3],
            ["before content change at", 1, "to add", [20, 30], "to remove", []],
            ["change at", 1, "from", 40],
            ["change at", 2, "from", 50],
            ["change at", 3, "from", undefined],
            ["change at", 4, "from", undefined],
            ["change at", 1, "to", 20],
            ["change at", 2, "to", 30],
            ["change at", 3, "to", 40],
            ["change at", 4, "to", 50],
            ["content change at", 1, "added", [20, 30], "removed", []],
            ["length change to", 5]
        ]);
    });

    it("pushes one value to end", function () {
        spy = jasmine.createSpy();
        expect(array.slice()).toEqual([10, 20, 30, 40, 50]);
        array.push(60);
        expect(array.slice()).toEqual([10, 20, 30, 40, 50, 60]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 5],
            ["before content change at", 5, "to add", [60], "to remove", []],
            ["change at", 5, "from", undefined],
            ["change at", 5, "to", 60],
            ["content change at", 5, "added", [60], "removed", []],
            ["length change to", 6]
        ]);
    });

    it("splices in place", function () {
        spy = jasmine.createSpy();
        expect(array.slice()).toEqual([10, 20, 30, 40, 50, 60]);
        expect(array.splice(2, 2, "A", "B")).toEqual([30, 40]);
        expect(array.slice()).toEqual([10, 20, "A", "B", 50, 60]);
        expect(spy.argsForCall).toEqual([
            // no length change
            ["before content change at", 2, "to add", ["A", "B"], "to remove", [30, 40]],
            ["change at", 2, "from", 30],
            ["change at", 3, "from", 40],
            ["change at", 2, "to", "A"],
            ["change at", 3, "to", "B"],
            ["content change at", 2, "added", ["A", "B"], "removed", [30, 40]],
        ]);
    });

    // ---- fresh start

    it("shifts one from the beginning", function () {
        array.wipe(); // start over fresh
        array.push(10, 20, 30);
        spy = jasmine.createSpy();
        expect(array.slice()).toEqual([10, 20, 30]);
        expect(array.shift()).toEqual(10);
        expect(array.slice()).toEqual([20, 30]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 3],
            ["before content change at", 0, "to add", [], "to remove", [10]],
            ["change at", 0, "from", 10],
            ["change at", 1, "from", 20],
            ["change at", 2, "from", 30],
            ["change at", 0, "to", 20],
            ["change at", 1, "to", 30],
            ["change at", 2, "to", undefined],
            ["content change at", 0, "added", [], "removed", [10]],
            ["length change to", 2]
        ]);
    });

    it("sets new value at end", function () {
        spy = jasmine.createSpy();
        expect(array.slice()).toEqual([20, 30]);
        expect(array.set(2, 40)).toBe(array);
        expect(array.slice()).toEqual([20, 30, 40]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 2],
            ["before content change at", 2, "to add", [40], "to remove", []],
            ["change at", 2, "from", undefined],
            ["change at", 2, "to", 40],
            ["content change at", 2, "added", [40], "removed", []],
            ["length change to", 3]
        ]);
    });

    it("sets new value at beginning", function () {
        spy = jasmine.createSpy();
        expect(array.slice()).toEqual([20, 30, 40]);
        expect(array.set(0, 10)).toBe(array);
        expect(array.slice()).toEqual([10, 30, 40]);
        expect(spy.argsForCall).toEqual([
            ["before content change at", 0, "to add", [10], "to remove", [20]],
            ["change at", 0, "from", 20],
            ["change at", 0, "to", 10],
            ["content change at", 0, "added", [10], "removed", [20]]
        ]);
    });

    // ---- fresh start

    it("unshifts one to the beginning", function () {
        array.wipe(); // start over fresh
        expect(array.slice()).toEqual([]);
        spy = jasmine.createSpy();
        array.unshift(30);
        expect(array.slice()).toEqual([30]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 0],
            ["before content change at", 0, "to add", [30], "to remove", []],
            ["change at", 0, "from", undefined],
            ["change at", 0, "to", 30],
            ["content change at", 0, "added", [30], "removed", []],
            ["length change to", 1]
        ]);
    });

    it("unshifts two values on beginning of already populated array", function () {
        spy = jasmine.createSpy();
        expect(array.slice()).toEqual([30]);
        array.unshift(10, 20);
        expect(array.slice()).toEqual([10, 20, 30]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 1],
            // added and removed values reflect the ending values, not the values at the time of the call
            ["before content change at", 0, "to add", [10, 20], "to remove", []],
            ["change at", 0, "from", 30],
            ["change at", 1, "from", undefined],
            ["change at", 2, "from", undefined],
            ["change at", 0, "to", 10],
            ["change at", 1, "to", 20],
            ["change at", 2, "to", 30],
            ["content change at", 0, "added", [10, 20], "removed", []],
            ["length change to", 3]
        ]);
    });

    it("reverses in place", function () {
        spy = jasmine.createSpy();
        expect(array.slice()).toEqual([10, 20, 30]);
        array.reverse();
        expect(array.slice()).toEqual([30, 20, 10]);
        expect(spy.argsForCall).toEqual([
            ["before content change at", 0, "to add", [10, 20, 30], "to remove", [10, 20, 30]],
            ["change at", 0, "from", 10],
            ["change at", 1, "from", 20],
            ["change at", 2, "from", 30],
            ["change at", 0, "to", 30],
            ["change at", 1, "to", 20],
            ["change at", 2, "to", 10],
            ["content change at", 0, "added", [30, 20, 10], "removed", [30, 20, 10]],
        ]);
    });

    it("sorts in place", function () {
        spy = jasmine.createSpy();
        expect(array.slice()).toEqual([30, 20, 10]);
        array.reverse();
        expect(array.slice()).toEqual([10, 20, 30]);
        expect(spy.argsForCall).toEqual([
            // added and removed values reflect the ending values, not the values at the time of the call
            ["before content change at", 0, "to add", [30, 20, 10], "to remove", [30, 20, 10]],
            ["change at", 0, "from", 30],
            ["change at", 1, "from", 20],
            ["change at", 2, "from", 10],
            ["change at", 0, "to", 10],
            ["change at", 1, "to", 20],
            ["change at", 2, "to", 30],
            ["content change at", 0, "added", [10, 20, 30], "removed", [10, 20, 30]],
        ]);
    });

    it("wipes all values finally", function () {
        spy = jasmine.createSpy();
        expect(array.slice()).toEqual([10, 20, 30]);
        array.wipe();
        expect(array.slice()).toEqual([]);
        expect(spy.argsForCall).toEqual([
            ["length change from", 3],
            ["before content change at", 0, "to add", [], "to remove", [10, 20, 30]],
            ["change at", 0, "from", 10],
            ["change at", 1, "from", 20],
            ["change at", 2, "from", 30],
            ["change at", 0, "to", undefined],
            ["change at", 1, "to", undefined],
            ["change at", 2, "to", undefined],
            ["content change at", 0, "added", [], "removed", [10, 20, 30]],
            ["length change to", 0]
        ]);
    });

    it("handles cyclic content change listeners", function () {
        var foo = [];
        var bar = [];
        foo.addContentChangeListener(function (plus, minus, index) {
            // if this is a change in response to a change in bar,
            // do not send back
            if (bar.getContentChangeDescriptor().isActive)
                return;
            bar.splice.apply(bar, [index, minus.length].concat(plus));
        });
        bar.addContentChangeListener(function (plus, minus, index) {
            if (foo.getContentChangeDescriptor().isActive)
                return;
            foo.splice.apply(foo, [index, minus.length].concat(plus));
        });
        foo.push(10, 20, 30);
        expect(bar.slice()).toEqual([10, 20, 30]);
        bar.pop();
        expect(foo.slice()).toEqual([10, 20]);
    });

    it("observes length changes on arrays that are not otherwised observed", function () {
        var array = [1, 2, 3];
        var spy = jasmine.createSpy();
        Object.addOwnPropertyChangeListener(array, "length", spy);
        array.push(4);
        expect(spy).toHaveBeenCalled();
    });

});

