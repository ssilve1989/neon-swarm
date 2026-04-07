import { beforeEach, describe, expect, it } from "vitest";
import { checkAndSave, getPersonalBest } from "../../src/systems/high-score";

beforeEach(() => {
	localStorage.clear();
});

describe("getPersonalBest", () => {
	it("returns null when no score has been stored for the mode", () => {
		expect(getPersonalBest("standard")).toBeNull();
		expect(getPersonalBest("blitz")).toBeNull();
		expect(getPersonalBest("zen")).toBeNull();
	});

	it("returns the stored score after a save", () => {
		checkAndSave("standard", 500);
		expect(getPersonalBest("standard")).toBe(500);
	});

	it("stores scores independently per mode", () => {
		checkAndSave("standard", 100);
		checkAndSave("blitz", 200);
		checkAndSave("zen", 300);
		expect(getPersonalBest("standard")).toBe(100);
		expect(getPersonalBest("blitz")).toBe(200);
		expect(getPersonalBest("zen")).toBe(300);
	});
});

describe("checkAndSave", () => {
	it("saves and returns true on first play (no previous score)", () => {
		const result = checkAndSave("standard", 42);
		expect(result).toBe(true);
		expect(getPersonalBest("standard")).toBe(42);
	});

	it("saves and returns true when score exceeds previous best", () => {
		checkAndSave("standard", 100);
		const result = checkAndSave("standard", 150);
		expect(result).toBe(true);
		expect(getPersonalBest("standard")).toBe(150);
	});

	it("does not save and returns false when score equals previous best", () => {
		checkAndSave("standard", 100);
		const result = checkAndSave("standard", 100);
		expect(result).toBe(false);
		expect(getPersonalBest("standard")).toBe(100);
	});

	it("does not save and returns false when score is below previous best", () => {
		checkAndSave("standard", 100);
		const result = checkAndSave("standard", 50);
		expect(result).toBe(false);
		expect(getPersonalBest("standard")).toBe(100);
	});

	it("does not affect other modes when saving to one mode", () => {
		checkAndSave("standard", 999);
		expect(getPersonalBest("blitz")).toBeNull();
		expect(getPersonalBest("zen")).toBeNull();
	});
});
