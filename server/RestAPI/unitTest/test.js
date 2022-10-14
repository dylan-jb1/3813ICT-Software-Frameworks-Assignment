var assert = require("assert"); //link in assertion library
describe("Tests for function one", () => {
	describe("Test Case 1 #fnOne()", () => {
		it("should return -1 when the value is not present", () => {
			assert.equal([1, 2, 3].indexOf(4), -1);
		});
	});
	describe("Test Case #fnOne()", () => {
		it("should return 3 as the value is present", () => {
			assert.equal([1, 2, 3, 4, 5].indexOf(4), 3);
		});
	});
});
