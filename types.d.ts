/*
 * @Author: salterok 
 * @Date: 2018-03-01 20:32:29 
 * @Last Modified by: salterok
 * @Last Modified time: 2018-03-01 21:09:05
 */

interface Ride {
    index: number;
    start: {
        row: number;
        col: number;
    };
    finish: {
        row: number;
        col: number;
    },
    minStart: number;
    lastEnd: number;

    done: boolean;
    tripTime: number;
    maxStart: number;
}

interface Veh {
    isFree: boolean;
    rideUntil: number;
    pos: {
        row: number;
        col: number;
    }
}