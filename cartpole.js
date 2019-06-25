/**
 * Cart-pole system simulator.
 *
 * In the control-theory sense, there are four state variables in this system:
 *
 *   - x: The 1D location of the cart.
 *   - xDot: The velocity of the cart.
 *   - theta: The angle of the pole (in radians). A value of 0 corresponds to
 *     a vertical position.
 *   - thetaDot: The angular velocity of the pole.
 *
 * The system is controlled through a single action:
 *
 *   - leftward or rightward force.
 */
class CartPole {
  /**
   * Constructor of CartPole.
   */
  constructor() {
    // Constants that characterize the system.
    this.gravity = 9.8;
    this.massCart = 1.0;
    this.massPole = 0.1;
    this.totalMass = this.massCart + this.massPole;
    this.cartWidth = 0.2;
    this.cartHeight = 0.1;
    this.length = 0.5;
    this.poleMoment = this.massPole * this.length;
    this.forceMag = 10.0;
    this.tau = 0.02;  // Seconds between state updates.

    // Threshold values, beyond which a simulation will be marked as failed.
    this.xThreshold = 2.4;
    this.thetaThreshold = 12 / 360 * 2 * Math.PI;

    this.setRandomState();
  }

  /**
   * Set the state of the cart-pole system randomly.
   */
  setRandomState() {
    // The control-theory state variables of the cart-pole system.
    // Cart position, meters.
    this.x = Math.random() - 0.5;
    // Cart velocity.
    this.xDot = (Math.random() - 0.5) * 1;
    // Pole angle, radians.
    this.theta = (Math.random() - 0.5) * 2 * (6 / 360 * 2 * Math.PI);
    // Pole angle velocity.
    this.thetaDot =  (Math.random() - 0.5) * 0.5;
  }

  /**
   * Get current state
   */
  getState() {
    return [this.x, this.xDot, this.theta, this.thetaDot];
  }

  /**
   * Update the cart-pole system using an action.
   * @param {number} action Only the sign of `action` matters.
   *   A value > 0 leads to a rightward force of a fixed magnitude.
   *   A value <= 0 leads to a leftward force of the same fixed magnitude.
   */
  update(action) {
    const force = action > 0 ? this.forceMag : -this.forceMag;

    const cosTheta = Math.cos(this.theta);
    const sinTheta = Math.sin(this.theta);

    const temp =
        (force + this.poleMoment * this.thetaDot * this.thetaDot * sinTheta) /
        this.totalMass;
    const thetaAcc = (this.gravity * sinTheta - cosTheta * temp) /
        (this.length *
         (4 / 3 - this.massPole * cosTheta * cosTheta / this.totalMass));
    const xAcc = temp - this.poleMoment * thetaAcc * cosTheta / this.totalMass;

    // Update the four state variables, using Euler's metohd.
    this.x += this.tau * this.xDot;
    this.xDot += this.tau * xAcc;
    this.theta += this.tau * this.thetaDot;
    this.thetaDot += this.tau * thetaAcc;

    return this.isDone();
  }

  /**
   * Determine whether this simulation is done.
   *
   * A simulation is done when `x` (position of the cart) goes out of bound
   * or when `theta` (angle of the pole) goes out of bound.
   *
   * @returns {bool} Whether the simulation is done.
   */
  isDone() {
    return this.x < -this.xThreshold || this.x > this.xThreshold ||
        this.theta < -this.thetaThreshold || this.theta > this.thetaThreshold;
  }
}

module.exports = CartPole;