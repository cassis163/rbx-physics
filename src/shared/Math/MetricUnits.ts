import { Workspace } from "@rbxts/services";

// ROBLOX equivalent of 9.81 m/s^2
const NORMAL_GRAVITY = 35;
// Amount of studs in a meter
const REAL_METER = ((1 / 0.28) * Workspace.Gravity) / NORMAL_GRAVITY;
const REAL_KILOGRAM = REAL_METER ** 3 / 1000;

export const convertKiloGram = (value: number, unitExponent: number): number => value * REAL_KILOGRAM ** unitExponent;

export const convertMeter = (value: number, unitExponent: number): number => value * REAL_METER ** unitExponent;

export const convertMeterAndKiloGram = (
	value: number,
	meterUnitExponent: number,
	kiloGramUnitExponent: number,
): number => convertKiloGram(convertMeter(value, meterUnitExponent), kiloGramUnitExponent);
