# Advent of Code 2021 - Day 22 - Submarine Reactor

This project is a 3d model of part 2 of the problem found at https://adventofcode.com/2021/day/22

## Technologies

This project uses Babylon.js and React.

### Notes

The project can run in 2 different ways. Normally it loads a 3d model from /public/assets/reactor-mesh.babylon.
But if desired, or this file is not available, then it can be configured (by uncommenting one section of code in App.js) to build the 3d model from the instructions found in /src/instructions.js. That is 420 instructions of adding and subtracting cuboids which are approaching sizes of 100k^3 so this will take longer time - perhaps around 15 minutes on an average computer.

Site is deployed at: https://aoc-2021-day22-reactor-3d.netlify.app
