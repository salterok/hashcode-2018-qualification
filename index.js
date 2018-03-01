/*
 * @Author: salterok 
 * @Date: 2018-03-01 19:11:37 
 * @Last Modified by: salterok
 * @Last Modified time: 2018-03-02 01:40:11
 */

const fs = require("fs");

// const caseName = "a_example";
// const caseName = "b_should_be_easy";
// const caseName = "c_no_hurry";
// const caseName = "d_metropolis";
const caseName = "e_high_bonus";


const data = fs.readFileSync(`./in/${caseName}.in`, { encoding: "utf-8" });

const lines = data.split("\n");
const meta = readHeader(lines[0]);

let rides = lines.slice(1, 1 + meta.rideCount).map(parseDataLine).map(preComp);
console.log("ok", meta);
// console.log("ok", rides);

console.assert(rides.length === meta.rideCount);


// compute max teoretical score, note it is not precise
const MAX_TEORETICAL_SCORE = rides.reduce((acc, ride) => acc + distance(ride.start, ride.finish) + meta.inTimeStartBonus, 0);


const maxTripScore = meta.rows + meta.cols;

class Veh {

    isFree(step) {
        return step >= this.rideUntil;
    }

    constructor() {
        this.rideUntil = 0;
        this.pos = {
            row: 0,
            col: 0,
        };
        this.rides = [];
        this.score = 0;
    }

    /**
     * 
     * @param {Ride} ride 
     */
    handle(ride, withBonus, step) {
        const timeToPlace = distance(this.pos, ride.start);
        const startTime = Math.max(step + timeToPlace, ride.minStart);
        
        this.rideUntil = startTime + ride.tripTime;

        this.pos.row = ride.finish.row;
        this.pos.col = ride.finish.col;

        ride.done = true;
        this.score += ride.tripTime + (withBonus ? meta.inTimeStartBonus : 0);
        this.rides.push(ride);
    }

}

/**
 * @type {Veh[]}
 */
const vehs = new Array(meta.vehicleCount).fill(0).map(v => {
    return new Veh();
});

function chooseRide(veh, step) {
    let maxScore = -Infinity;
    let cRide = undefined;
    let withBonus = false;

    for (const ride of rides) {
        if (ride.done) {
            continue;
        }
        const timeToPlace = ride.maxStart - step;
        const dist = distance(ride.start, veh.pos);

        const waitTime = (timeToPlace - dist);

        if (dist < timeToPlace) {
            const bonus = (step + dist <= ride.minStart) ? meta.inTimeStartBonus * 10 : 0;

            const score = ride.tripTime - waitTime + bonus;

            if (score > maxScore) {
                maxScore = score;
                cRide = ride;
                withBonus = bonus > 0;
            }

        }

    }
    return [cRide, withBonus];
}

function main() {
    console.time(`case:${caseName}`);

    for (let step = 0; step < meta.steps; step++) {
        const freeVehs = vehs.filter(veh => veh.isFree(step));
        let dirty = false;
        // console.log(step, freeVehs.length);
        for (const veh of freeVehs) {
            const [ride, withBonus] = chooseRide(veh, step);
            
            if (ride) {
                // console.log(step, freeVehs.length, veh, ride)
                dirty = true;
                veh.handle(ride, withBonus, step);
            }
        }

        if (dirty) {
            let o = rides.length;
            rides = rides.filter(ride => !(ride.done || ride.maxStart <= step));
            // console.log(o, rides.length)
        }
    }

    console.timeEnd(`case:${caseName}`);
}

main();

let scoreTotal = 0;
let ridesTotal = 0;
vehs.forEach(veh => {
    scoreTotal += veh.score;
    ridesTotal += veh.rides.length;
    // console.log(veh.score, veh.rides);
});
console.log("TOTAL-rides", ridesTotal);
console.log("TOTAL-score", scoreTotal);
console.log("MAX-score", MAX_TEORETICAL_SCORE);

const result = vehs.map(veh => {
    return veh.rides.length + " " + veh.rides.map(ride => ride.index).join(" ");
}).join("\n");


fs.writeFileSync(`./out/${caseName}.out`, result, { encoding: "ascii" });


function distance(start, end) {
    return Math.abs(start.row - end.row) + Math.abs(start.col - end.col);
}

function inPlace(place, target) {
    return place.row === target.row && place.col === target.col;
}


function readHeader(line) {
    const vals = line.split(" ").map(v => parseInt(v));
    return {
        rows: vals[0],
        cols: vals[1],
        vehicleCount: vals[2],
        rideCount: vals[3],
        inTimeStartBonus: vals[4],
        steps: vals[5]
    };
}

/**
 * 
 * @param {*} line 
 * @returns {Ride}
 */
function parseDataLine(line, index) {
    const vals = line.split(" ").map(v => parseInt(v));

    return {
        index: index,
        start: {
            row: vals[0],
            col: vals[1],
        },
        finish: {
            row: vals[2],
            col: vals[3],
        },
        minStart: vals[4],
        lastEnd: vals[5],
    };
}

/**
 * 
 * @param {Ride} ride 
 * @returns {Ride}
 */
function preComp(ride) {
    ride.done = false;
    ride.tripTime = distance(ride.start, ride.finish);
    ride.maxStart = ride.lastEnd - ride.tripTime;
    return ride;
}
