declare var d3

const names = [ "Algernon", "Bertie", "Cecily", "Dahlia", "Edwin", "Fergus", "Gertrude", "Horatio", "Ignatius", "Jairus", "Kenneth", "Leopold", "Matilda", "Neville", "Oriel", "Petroc", "Quentin", "Reginald", "Sadie", "Tarquin" ]

/**
 * Soemthing that we can call draw on...
 * ... included to demo TypeScript's interfaces
 */ 
interface Drawable {
    draw(canvas);
}

/**
 * A simple Newtonian physics body, with position, 
 * velocity, and acceleration. Also has an angle (theta) and
 * angular velocity (omega), but no angular acceleration.
 */    
class Body implements Drawable { 
    x: number = 0; 
    y: number = 0;
    theta: number = 0;

    vx: number = 0;
    vy: number = 0;
    omega: number = 0;

    ax: number = 0;
    ay: number = 0;
    // we don't have angular acceleration in this game
    
    name: string = "A body"; 

    /*
     * Update the physics as time has advanced
     */
    step(dt: number) {
        if (!dt) {
            throw "dt was zero";
        }
        this.x = this.x + (dt * this.vx);
        this.y = this.y + (dt * this.vy);
        this.vx = this.vx + (dt * this.ax);
        this.vy = this.vy + (dt * this.ay);
        this.theta = this.theta + (dt * this.omega);
        
        /*
         * acceleration are reset to zero after each step, because
         * acceleration is done by applying forces.
         */
        this.ax = 0;
        this.ay = 0;
    }
    
    /**
     * Apply a force at a particular angle
     */ 
    applyForceTheta(strength: number, theta: number) {
        let fx = strength * Math.cos(theta),
            fy = strength * Math.sin(theta);
            
        this.ax = this.ax + fx;
        this.ay = this.ay + fy;
    }

    /*
     * Apply a force, and work out the angle from an x, y pair.
     * Note that the x,y pair do not affect amplitude -- 1,1 is the same as 2,2
     */
    applyForceXY(strength: number, x: number, y: number) {
        this.applyForceTheta(strength, Math.atan2(y, x));
    }
    
    /*
     * An impulse is an instantaneous addition to velocity. Apply it at an angle..
     */
    applyImpulseTheta(strength: number, theta: number) {
        let ix = strength * Math.cos(theta),
            iy = strength * Math.sin(theta);
            
        this.vx = this.vx + ix;
        this.vy = this.vy + iy;
    }

    /**
     * Apply an impulse at an angle worked out from an x, y pair
     */
    applyImpulseXY(strength: number, x: number, y: number) {
        this.applyImpulseTheta(strength, Math.atan2(y, x));
    }    

    /*
     * Bodies need to be drawable, but there's no default implementation
     */
    draw(canvas) {}
}

/**
 * An asteroid is a circle in space. I haven't added any
 * collision detection.
 */
class Asteroid extends Body {
    radius: number = 10;
    
    draw(canvas) {
        var ctx = canvas.getContext("2d");
        ctx.save();

        ctx.strokeStyle = "orange";
        ctx.beginPath();
        ctx.translate(this.x, this.y);
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2, true);
        ctx.stroke();

        ctx.restore();        
    }
}

/**
 * The player is a triangle in space. It can turn and
 * thrust.
 */
class Player extends Body {

    thrustConst = 50;
    turnSpeed = 2;

    h: number = 12;
    w: number = 18;
    thrust: number = 0;
    
    constructor(public x: number, public y: number) {
      super();
      this.name = "The player";
    }

    step(dt: number) {
        this.applyForceTheta(this.thrust, this.theta);
        super.step(dt);        
    }

    draw(canvas) {
        let ctx = canvas.getContext("2d");

        ctx.save();

        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";

        ctx.translate(this.x, this.y);            
        ctx.rotate(this.theta);
        ctx.beginPath();
        ctx.moveTo(0, -this.h / 2);
        ctx.lineTo(0, this.h / 2);
        ctx.lineTo(this. w, 0);
        ctx.lineTo(0, -this.h / 2);
        ctx.rotate(Math.PI / 2);
        ctx.fillText(Math.floor(this.x) + "," + Math.floor(this.y) + "," +Math.floor(this.theta / Math.PI * 180), -20, 10, 40);
        ctx.fill();

        ctx.restore();
    };

}

/**
 * A gravity well. It's fixed in place (it's not a body), but applies gravity to other bodies
 */
class Well implements Drawable {

    // TypeScript constructors let you just say "public" to make an argument a property
    constructor(public strength: number, public x: number, public y: number, public bodies: Array<Body>) {}
    
    step(dt: number) {
      for (let i = 0; i < this.bodies.length; i++) {
        let body = this.bodies[i];
        body.applyForceXY(this.strength, this.x - body.x, this.y - body.y);
      }
    }
    
    draw(canvas) {
        let ctx = canvas.getContext("2d");
        ctx.save();    
    
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.translate(this.x, this.y);
        ctx.arc(0, 0, this.strength, 0, Math.PI * 2, true);
        ctx.fill();
        
        ctx.restore();
    }
    
}

/**
 * A bullet fired from the Player's ship. Collision detection has not been implemented yet.
 */
class Bullet extends Body {

    constructor() {
      super();
      this.name = "A bullet";
    }
   
    draw(canvas) {
        let ctx = canvas.getContext("2d");
        ctx.save();    
    
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.translate(this.x, this.y);
        ctx.arc(0, 0, 2, 0, Math.PI * 2, true);
        ctx.fill();
        
        ctx.restore();
    }
}


/**
 *  Set up code that uses the parts...
 */

// Declare our variables
let canvas = document.getElementById("canvas"),
    width = canvas.width,
    height = canvas.height,
    player = new Player(width / 2 + 100, height / 2),
    speed = 30,
    thrustConst = 10,
    asteroids: Array<Body> = [player],
    well = new Well(20, width/2, height/2, asteroids),
    xSpeedHistory:Array<number> = [1, 3, 4, 5, 6, 7],
    ySpeedHistory:Array<number> = [],
    historyLength = 1000;

// Draws all our astral bodies on the canvas
function drawAll(canvas) {
    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";        
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    well.draw(canvas);
    for (var i = 0; i < asteroids.length; i++) {
        asteroids[i].draw(canvas);
    }
    
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillText("A,D to turn. W,S to thrust. Y to fire", 10, height-10, 400);
    ctx.fill();
    ctx.restore();
}

// Steps the simulation forwards by dt milliseconds
function stepAll(dt) {
    well.step(dt);
    for (var i = 0; i < asteroids.length; i++) {
        asteroids[i].step(dt);
    }       
    
    xSpeedHistory.push(player.vx);
    ySpeedHistory.push(player.vy);
    if (xSpeedHistory.length > historyLength) {
        xSpeedHistory.shift();
        ySpeedHistory.shift();
    }
}

/**
 * Creates a new bullet, moving slightly away from the player
 */
function fire() {
    let bullet = new Bullet();
    
    bullet.x = player.x;
    bullet.y = player.y;
    bullet.vx = player.vx;
    bullet.vy = player.vy;
    
    bullet.applyImpulseTheta(50, player.theta);
    asteroids.push(bullet);    
}


// Add some asteroids, orbiting the well clockwise
for (let i = 0; i < 15; i++) {        
    let asteroid = new Asteroid(),
      x = Math.random() * width,
      y = Math.random() * height,
      d = Math.sqrt(Math.pow(x - well.x, 2) + Math.pow(y - well.y, 2)),
      theta = Math.atan2(y - well.y, x - well.x);
    
    asteroid.x = x;
    asteroid.y = y;
    asteroid.name = names[i];
    asteroid.applyImpulseTheta(d / 3, theta + Math.PI/2);
    asteroids.push(asteroid)
}

// controls
window.addEventListener("keydown", function(e) {
   console.log(e.keyCode);
   if (e.keyCode == 68) {
       player.omega = player.turnSpeed;
   } else if (e.keyCode == 65) {
       player.omega = -player.turnSpeed;
   } else if (e.keyCode == 83) {
       player.thrust = -player.thrustConst;
   } else if (e.keyCode == 87) {
       player.thrust = player.thrustConst;
   } else if (e.keyCode == 89) {
       fire();
   }
});

// controls
window.addEventListener("keyup", function(e) {
   if (e.keyCode == 68) {
       player.omega = 0;
   } else if (e.keyCode == 65) {
       player.omega = 0;
   } else if (e.keyCode == 83) {
       player.thrust = 0;
   } else if (e.keyCode == 87) {
       player.thrust = 0;
   }
});


function updateLocationsTable() {
    // Update the asteroid locations table using d3.js
    d3.select("#locations").selectAll("p").data(asteroids)
      .text(function(body:Body) {
        return body.name + " is at " + Math.floor(body.x) + "," + Math.floor(body.y)
      })
      .enter().append("p").text(function(body:Body) {
        return body.name + " is at " + Math.floor(body.x) + "," + Math.floor(body.y)
      });
}

/*
 *
 * d3.js velocity chart
 *
 */
let svgGroup = d3.select("#velocity-graph").append('g'),
    yscale = d3.scaleLinear().domain([-100, 100]).range([0, 200]),
    xscale = d3.scaleLinear().domain([0, historyLength]).range([0, 600]),
    line = d3.line()
      .x(function(d,i) { return xscale(i) })
      .y(function(d,i) { return yscale(d) }),
    xPath = svgGroup.append("path").attr("class", "line x"),
    yPath = svgGroup.append("path").attr("class", "line y"),
    xAxis = svgGroup.append("path").attr("class", "line b").attr('d', "M0,100l600,0"),
    yAxis = svgGroup.append("path").attr("class", "line b").attr('d', "M0,0L0,200");
    

// The SVG's width depends on the page
function setupVelocityChart() {
    var yAxis = d3.svg.axis()
        .scale(yscale)
        .orient("left");
}

function updateVelocityChart() {
    xPath.datum(xSpeedHistory).attr('d', line);
    yPath.datum(ySpeedHistory).attr('d', line);
}

// a timer to run our simulation and update our data
setInterval(function () {
    stepAll(.02);
    drawAll(canvas);     
    
    updateLocationsTable();
    updateVelocityChart();
      
    // update the player velocity chart using d3.js
}, 20);   


  
