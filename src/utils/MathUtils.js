/**
 * @file MathUtils.js
 * @description Mathematical utility functions.
 */

import { Vector3, Quaternion } from '@babylonjs/core';

export class MathUtils {
    /**
     * Lerp between two numbers.
     * @param {number} start
     * @param {number} end
     * @param {number} t
     * @returns {number}
     */
    static lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    /**
     * Checks if a point is within a given distance to a target.
     * @param {Vector3} point1
     * @param {Vector3} point2
     * @param {number} distance
     * @returns {boolean}
     */
    static isWithinDistance(point1, point2, distance) {
        return Vector3.DistanceSquared(point1, point2) <= distance * distance;
    }
}