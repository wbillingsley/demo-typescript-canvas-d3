# demo-typescript-canvas-d3

This was written as a demo for a web course I'm covering this year. 
The originally allocated academic headed off overseas, and there wasn't a written course to pick up, so it's all somewhat ad-hoc, 
done via live-coding, projects, and little demos.

This demo tries to be a small way of showing four different concepts in the same <400 line project.

- The physics simulation is written in TypeScript, showing how it introduces classes, optional static typing, 
  easy syntax for turning constructor arguments into public fields, etc.

- The drawing of the simulation takes place on a Canvas, showing the basic drawing API and also the concept of 
  translating the origin (0,0) on the canvas to the body's center, rather than re-calculating the position of each corner of 
  the player's ship.
  
- The velocity chart below is an SVG path, showing vector graphics that are part of the document model

- The velocity chart and the position list are generated using d3.js, showing how it keeps document elements (the 'p's in the
  list and the 'path' elements in the chart) in sync with data from a JavaScript array
  
As this is also pushed to the gh-pages branch, you can see the demo running in your browser at 
[www.wbillingsley.com/demo-typescript-canvas-d3/](http://www.wbillingsley.com/demo-typescript-canvas-d3/)

