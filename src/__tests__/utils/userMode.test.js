/**
 * User Mode Tests — Kids vs Adult dual mode
 * Added by MBP M1 — QA Guardian
 */
import { describe, it, expect } from 'vitest';
import { USER_MODES, MODE_CONFIG, getModeConfig, isAdultMode } from '../../utils/userMode.js';

describe('USER_MODES', () => {
    it('should have kids and adult modes', () => {
        expect(USER_MODES.KIDS).toBe('kids');
        expect(USER_MODES.ADULT).toBe('adult');
    });
});

describe('MODE_CONFIG', () => {
    it('kids should have shorter SM-2 max interval', () => {
        expect(MODE_CONFIG.kids.sm2MaxInterval).toBe(60);
        expect(MODE_CONFIG.adult.sm2MaxInterval).toBe(365);
    });

    it('kids should have lower daily goal', () => {
        expect(MODE_CONFIG.kids.dailyGoal).toBe(10);
        expect(MODE_CONFIG.adult.dailyGoal).toBe(20);
    });

    it('kids should show mascot, adult should not', () => {
        expect(MODE_CONFIG.kids.showMascot).toBe(true);
        expect(MODE_CONFIG.adult.showMascot).toBe(false);
    });

    it('kids scoring should be more generous than adult', () => {
        expect(MODE_CONFIG.kids.scoreThresholds.perfect).toBeLessThan(MODE_CONFIG.adult.scoreThresholds.perfect);
    });

    it('greeting should work with name', () => {
        expect(MODE_CONFIG.kids.greeting('An')).toBe('An');
        expect(MODE_CONFIG.adult.greeting('Long')).toBe('Long');
    });

    it('greeting should work without name', () => {
        expect(MODE_CONFIG.kids.greeting('')).toBe('bạn nhỏ');
        expect(MODE_CONFIG.adult.greeting('')).toBe('bạn');
    });
});

describe('getModeConfig', () => {
    it('should return kids config by default', () => {
        const config = getModeConfig('invalid_mode');
        expect(config).toEqual(MODE_CONFIG.kids);
    });

    it('should return correct config for each mode', () => {
        expect(getModeConfig('kids')).toEqual(MODE_CONFIG.kids);
        expect(getModeConfig('adult')).toEqual(MODE_CONFIG.adult);
    });
});

describe('isAdultMode', () => {
    it('should return true only for adult mode', () => {
        expect(isAdultMode('adult')).toBe(true);
        expect(isAdultMode('kids')).toBe(false);
        expect(isAdultMode(undefined)).toBe(false);
    });
});
