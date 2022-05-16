/// <reference types="@rbxts/testez/globals" />
import { roundvec } from "ReplicatedStorage/Utility/RoundVector";

export = function () {
	describe("rounding with a number", () => {
		it("should round upwards on halves", () => {
			expect(roundvec(new Vector3(0.5, 0.5, 0.5), 1)).to.equal(new Vector3(1, 1, 1));
			expect(roundvec(new Vector3(  1, 0.5,   1), 1)).to.equal(new Vector3(1, 1, 1));
			expect(roundvec(new Vector3(  0, 0.5,   1), 1)).to.equal(new Vector3(0, 1, 1));
		});
		it("should be unchanged when the rounding has the same precision as the values", () => {
			expect(roundvec(new Vector3(0.5, 0.5, 0.5), 0.1)).to.equal(new Vector3(0.5, 0.5, 0.5));
			expect(roundvec(new Vector3(  1, 0.5,   1), 0.1)).to.equal(new Vector3(  1, 0.5,   1));
			expect(roundvec(new Vector3(  0, 0.5,   1), 0.1)).to.equal(new Vector3(  0, 0.5,   1));
		});
		it("should be unchanged when the rounding has more precision as the values", () => {
			expect(roundvec(new Vector3(0.5, 0.5, 0.5), 0.01)).to.equal(new Vector3(0.5, 0.5, 0.5));
			expect(roundvec(new Vector3(  1, 0.5,   1), 0.01)).to.equal(new Vector3(  1, 0.5,   1));
			expect(roundvec(new Vector3(  0, 0.5,   1), 0.01)).to.equal(new Vector3(  0, 0.5,   1));
		});
		it("should throw upon trying to round with zero", () => {
			expect(() => roundvec(new Vector3(0.5, 0.5, 0.5), 0)).to.throw();
			expect(() => roundvec(new Vector3(  1, 0.5,   1), 0)).to.throw();
			expect(() => roundvec(new Vector3(  0, 0.5,   1), 0)).to.throw();
		});
	});
	describe("rounding with a Vector3", () => {
		it("should be rounding based on each part of a vector", () => {
			expect(roundvec(new Vector3(0.5, 1.5, 2.985), new Vector3(1, 2, 2))).to.equal(new Vector3(1, 2, 2));
			expect(roundvec(new Vector3(0.5, 1.5, 3    ), new Vector3(1, 2, 2))).to.equal(new Vector3(1, 2, 4));
		});
		it("should throw when a part of the vector is omitted (a zero is used)", () => {
			expect(() => roundvec(new Vector3(0.5, 1.5, 2.985), new Vector3(1, 2))).to.throw();
		});
	});
};
