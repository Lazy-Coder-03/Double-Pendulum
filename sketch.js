const WIDTH = 800;
const HEIGHT = 800;
const dt1 = 0.01;  // Smaller time step for better accuracy
const steps1 = 1 / dt1;    // Use 1 step per frame to avoid excessive calculations
 
// const dt2 = 0.002;  // Larger time step for better performance
// const steps2 = 1 / dt2;    // Use 1 step per frame to avoid excessive calculations

const MAX_TRAIL_POINTS = 100;
let doublePendulums1 = [];
// let doublePendulums2 = [];
let trailGraphics;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  colorMode(HSB, 360, 100, 100);

  trailGraphics = createGraphics(WIDTH, HEIGHT);
  trailGraphics.background(0);  // Start with a black background
  trailGraphics.colorMode(HSB, 360, 100, 100);

  let a1 = Math.random()* 2* PI //PI / 2;  // Initial angle 1
  let a2 = Math.random() * 2 * PI //-PI / 4;  // Initial angle 2
  let totalPendulums = 24;
  let colorAngle = 360 / totalPendulums;
  for (let i = 0; i < totalPendulums; i++) {
    doublePendulums1.push(new DoublePendulum(WIDTH / 2, HEIGHT /2, 180, 180, 10, 10, a1, a2 + i * 0.0001, colorAngle * i));
    //doublePendulums2.push(new DoublePendulum(WIDTH / 2, HEIGHT / 4 * 3, 100, 100, 10, 10, a1, a2 + i * 0.001, colorAngle * i));
  }
}

function draw() {
  background(0);
  image(trailGraphics, 0, 0);  // Draw the trail graphics on the main canvas
  if (frameCount % 5 == 0) {
    trailGraphics.background(0, 0, 0, 0.1);  // Fade the trail graphics slightly
  }
  for (let i = 0; i < doublePendulums1.length; i++) {
    doublePendulums1[i].update(dt1, steps1);
    doublePendulums1[i].show(trailGraphics);  // Pass the trailGraphics to the show method
    // doublePendulums2[i].update(dt2, steps2);
    // doublePendulums2[i].show(trailGraphics);
  }

}

class DoublePendulum {
  constructor(x, y, l1, l2, m1, m2, a1, a2, colorAngle) {
    this.x = x;
    this.y = y;
    this.l1 = l1;
    this.l2 = l2;
    this.m1 = m1;
    this.m2 = m2;
    this.a1 = a1;
    this.a2 = a2;
    this.a1_v = 0;
    this.a2_v = 0;
    this.g = 1;
    this.colorAngle = colorAngle;
    this.history = [];
    this.maxHistoryLength = 10; // Maximum number of points in the history
  }

  // Runge-Kutta integration method
  update(dt,steps) {
    for (let i = 0; i < steps; i++) {
      const k1 = this.derivs(this.a1, this.a2, this.a1_v, this.a2_v);
      const k2 = this.derivs(this.a1 + 0.5 * k1.a1_a * dt, this.a2 + 0.5 * k1.a2_a * dt, this.a1_v + 0.5 * k1.a1_a * dt, this.a2_v + 0.5 * k1.a2_a * dt);
      const k3 = this.derivs(this.a1 + 0.5 * k2.a1_a * dt, this.a2 + 0.5 * k2.a2_a * dt, this.a1_v + 0.5 * k2.a1_a * dt, this.a2_v + 0.5 * k2.a2_a * dt);
      const k4 = this.derivs(this.a1 + k3.a1_a * dt, this.a2 + k3.a2_a * dt, this.a1_v + k3.a1_a * dt, this.a2_v + k3.a2_a * dt);

      this.a1_v += (k1.a1_a + 2 * k2.a1_a + 2 * k3.a1_a + k4.a1_a) * dt / 6;
      this.a2_v += (k1.a2_a + 2 * k2.a2_a + 2 * k3.a2_a + k4.a2_a) * dt / 6;

      this.a1 += this.a1_v * dt;
      this.a2 += this.a2_v * dt;


    }

    //Add new point to history
    let x1 = this.l1 * sin(this.a1) + this.x;
    let y1 = this.l1 * cos(this.a1) + this.y;
    let x2 = x1 + this.l2 * sin(this.a2);
    let y2 = y1 + this.l2 * cos(this.a2);

    this.history.push({ x: x2, y: y2 });

    // Limit the number of points in history
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift(); // Remove the oldest point
    }
  }

  derivs(a1, a2, a1_v, a2_v) {
    let num1 = -this.g * (2 * this.m1 + this.m2) * sin(a1);
    let num2 = -this.m2 * this.g * sin(a1 - 2 * a2);
    let num3 = -2 * sin(a1 - a2) * this.m2;
    let num4 = a2_v * a2_v * this.l2 + a1_v * a1_v * this.l1 * cos(a1 - a2);
    let den = this.l1 * (2 * this.m1 + this.m2 - this.m2 * cos(2 * a1 - 2 * a2));
    let a1_a = (num1 + num2 + num3 * num4) / den;  // a1 acceleration

    num1 = 2 * sin(a1 - a2);
    num2 = a1_v * a1_v * this.l1 * (this.m1 + this.m2);
    num3 = this.g * (this.m1 + this.m2) * cos(a1);
    num4 = a2_v * a2_v * this.l2 * this.m2 * cos(a1 - a2);
    den = this.l2 * (2 * this.m1 + this.m2 - this.m2 * cos(2 * a1 - 2 * a2));
    let a2_a = (num1 * (num2 + num3 + num4)) / den;  // a2 acceleration

    return { a1_a, a2_a };
  }

  show(trailGraphics) {
    // Draw the trail on trailGraphics
    trailGraphics.stroke(this.colorAngle, 100, 100, 50);  // Set the stroke color with some transparency
    trailGraphics.fill(this.colorAngle, 100, 100, 50);    // Set the fill color with some transparency
    trailGraphics.strokeWeight(1);

    // Draw the trail
    trailGraphics.beginShape();
    for (let i = 0; i < this.history.length - 1; i++) {
      let point1 = this.history[i];
      let point2 = this.history[i + 1];
      trailGraphics.stroke(this.colorAngle, 100, 100, 10 * (1 - i / this.history.length)); // Fading effect
      //trailGraphics.ellipse(point2.x, point2.y, 2);
      trailGraphics.line(point1.x, point1.y, point2.x, point2.y);
    }
    trailGraphics.endShape();  // End shape without closing it

    //Optional: Draw the pendulums
    // let x1 = this.l1 * sin(this.a1) + this.x;
    // let y1 = this.l1 * cos(this.a1) + this.y;
    // let x2 = x1 + this.l2 * sin(this.a2);
    // let y2 = y1 + this.l2 * cos(this.a2);

    // stroke(255);
    // strokeWeight(2);
    // line(this.x, this.y, x1, y1);
    // line(x1, y1, x2, y2);
    // fill(this.colorAngle, 100, 100);
    // ellipse(x1, y1, this.m1);
    // ellipse(x2, y2, this.m2);
  }

}
