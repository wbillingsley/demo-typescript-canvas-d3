

console.log("before dec");

(function () {
    
    "use strict";

    /**
     *  A simple Newtonian physics body, with position, velocity, and acceleration
     */
    function Body(config) {
        config = config || {};
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.theta = config.theta || 0;
        this.vx = config.vx || 0;
        this.vy = config.vy || 0;
        this.omega = config.omega || 0;
        this.ax = config.ax || 0;
        this.ay = config.ay || 0;

        /*
         * Moves the simulation forward by dt
         */
        this.step = function (dt) {
            if (!dt) {
                throw "dt was zero";
            }
            this.x = this.x + (dt * this.vx);
            this.y = this.y + (dt * this.vy);
            this.vx = this.vx + (dt * this.ax);
            this.vy = this.vy + (dt * this.ay);
            this.theta = this.theta + (dt * this.omega);
        };
    }

    /**
     *  An asteroid is a circle in space. I haven't added any collision detection.
     */ 
    function Asteroid(config) {
        config = config || {};
                
        // Set up all the Body stuff on this asteroid. 
        Body.call(this, config);

        this.radius = config.radius || 10;
        this.colour = config.colour || "#997766";
        
        this.draw = function (canvas) {
            var ctx = canvas.getContext("2d");
            ctx.save();
                                
            centreCanvasOnPlayer(ctx);
        
            ctx.strokeStyle = "orange";
            ctx.beginPath();
            ctx.translate(this.x - player.x, this.y - player.y)
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2, true);
            ctx.stroke();
            
            ctx.restore();
        };
    }
    
    /**
     *  The player is a triangle in space. It can turn and thrust.
     */
    function Player(config) {
        config = config || {};
        
        // Set up all the Body stuff on this asteroid. 
        Body.call(this, config);
        
        this.h = 18;
        this.w = 12;
        
        this.thrust = function (force) {
            this.ax = force - Math.sin(this.theta);
            this.ay = force * Math.cos(this.theta);
        }
        
        this.draw = function (canvas) {
            var ctx = canvas.getContext("2d"),
                cx = canvas.width / 2,
                ch = canvas.height / 2;
                        
            ctx.save();
            
            ctx.strokeStyle = "white";
            ctx.fillStyle = "white";
            
            centreCanvasOnPlayer(ctx);            
            ctx.rotate(this.theta);
            ctx.beginPath();
            ctx.moveTo(-this.w / 2, 0);
            ctx.lineTo(0, this.h);
            ctx.lineTo(this.w / 2, 0);
            ctx.lineTo(-this.w / 2, 0);
            ctx.fillText(Math.floor(this.x) + "," + Math.floor(this.y), -10, -10, 20);
            ctx.fill();
            
            ctx.restore();
        };

    }
    
    function centreCanvasOnPlayer(ctx) {
        ctx.translate(width / 2, width / 2);
    }
    
    function rotateCanvasToPlayer(ctx) {
        ctx.rotate(-player.theta);
    }
    
    function drawAll(canvas) {
        var ctx = canvas.getContext("2d");
        
        ctx.fillStyle = "black";        
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        player.draw(canvas);
        for (var i = 0; i < asteroids.length; i++) {
            asteroids[i].draw(canvas);
        }
        
    }
    
    function stepAll(dt) {
        player.step(dt);
        for (var i = 0; i < asteroids.length; i++) {
            asteroids[i].step(dt);
        }        
    }
    
    var canvas = document.getElementById("canvas"),
        width = canvas.width,
        height = canvas.height,
        player = new Player(),
        speed = 30,
        turnSpeed = 1,
        thrustConst = 10,
        asteroids = [];
    
    for (var i = 0; i < 15; i++) {        
        var asteroid = new Asteroid({
            x: Math.random() * width - width / 2,
            y: Math.random() * height - height / 2,
            vx: Math.random() * speed - speed / 2,
            vy: Math.random() * speed - speed / 2
        })
        asteroids.push(asteroid)
    }
    
        
    window.addEventListener("keydown", function(e) {
       console.log(e.keyCode);
       if (e.keyCode == 68) {
           player.omega = turnSpeed;
       } else if (e.keyCode == 65) {
           player.omega = -turnSpeed;
       } else if (e.keyCode == 83) {
           player.thrust(-thrustConst);
       } else if (e.keyCode == 87) {
           player.thrust(thrustConst);
       }
    });
    
    window.addEventListener("keyup", function(e) {
       if (e.keyCode == 68) {
           player.omega = 0;
       } else if (e.keyCode == 65) {
           player.omega = 0;
       } else if (e.keyCode == 83) {
           player.thrust(0);
       } else if (e.keyCode == 87) {
           player.thrust(0);
       }
    });
    
    
    setInterval(function () {
        stepAll(.02);
        drawAll(canvas);        
    }, 20);   
    
}());



console.log("after dec");

