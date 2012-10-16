
var Bindings = require("..");

describe("bindings", function () {

    describe("computed properties", function () {

        describe("string", function () {
            it("should propagate related bindings", function () {

                var object = Bindings.create(null, {
                    foo: 10,
                    bar: 20
                }, {
                    baz: {
                        args: ["foo", "bar"],
                        compute: function (foo, bar) {
                            return foo + bar;
                        }
                    },
                    qux: {
                        "<-": "baz"
                    }
                });

                expect(object.qux).toEqual(30);

                object.bar = 30;
                expect(object.qux).toEqual(40);

            });
        });

        describe("array", function () {

            it("should propagate related bindings", function () {

                var object = Bindings.create(null, {
                    foo: 10,
                    bar: 20
                }, {
                    baz: {
                        args: ["foo", "bar"],
                        compute: function (foo, bar) {
                            return foo + bar;
                        }
                    },
                    qux: {
                        "<-": "baz"
                    }
                });

                expect(object.qux).toEqual(30);

                object.bar = 30;
                expect(object.qux).toEqual(40);

            });

        });

    });

    describe("exclusive options", function () {

        it("should work", function () {

            var bindings = Bindings.create(null, {
                options: [],
                off: true,
                on: false
            }, {

                "!options.has('feature')": {
                    "<->": "off"
                },
                "options.has('feature')": {
                    "<->": "on"
                }
            });

            expect(bindings.options.slice()).toEqual([]);

            bindings.on = true;
            expect(bindings.options.slice()).toEqual(['feature']);
            bindings.off = true;
            expect(bindings.options.slice()).toEqual([]);

        });

        it("should work", function () {

            var bindings = Bindings.create(null, {
                options: [],
                off: true,
                on: false
            }, {
                "options.has('feature')": {
                    "<-": "!off"
                },
                "options.has('feature')": {
                    "<-": "on"
                },
                "on": {"<->": "!off"}
            });

            expect(bindings.options.slice()).toEqual([]);

            bindings.on = true;
            expect(bindings.options.slice()).toEqual(['feature']);
            bindings.off = true;
            expect(bindings.options.slice()).toEqual([]);

        });

    });

});
