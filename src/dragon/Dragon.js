"use strict";

import { Spine } from "pixi-spine";

export default class Dragon extends Spine {
  DIR_RIGHT = "right";
  DIR_LEFT = "left";

  ANIM_FLY = "flying";

  constructor(resource, scale = 0.25, direction = "left", name = "dragon") {
    super(resource.spineData);

    this.eventMode = "dynamic";
    this.autoUpdate = false;
    this.name = name;

    this.vx = 0;
    this.vy = 0;

    this.pivot.set(0, 0);
    this.state.timeScale = 0.02;
    this.scale.set(scale);
    this.speed = 5;

    this.face(direction);

    this.state.setAnimation(0, this.ANIM_FLY, true);
  }

  face(direction) {
    switch (direction) {
      case this.DIR_LEFT:
        this.scale.x = -this.scale._x;
        this.facingRight = false;
        this.vx = -this.speed;
        break;
      case this.DIR_RIGHT:
        this.scale.x = Math.abs(this.scale._x);
        this.facingRight = true;
        this.vx = this.speed;
        break;
      default:
        this.face(this.DIR_LEFT);
    }
  }

  update(dt) {
    super.update(dt);

    this.vx = this.facingRight ? this.speed : -this.speed;
    this.x += this.vx;
  }
}
