"use strict";

import { Spine } from "pixi-spine";

export default class SuperSpineboy extends Spine {
  DIR_RIGHT = "right";
  DIR_LEFT = "left";

  ANIM_IDLE = "idle";
  ANIM_JUMP = "jump";
  ANIM_WALK = "walk";
  ANIM_DEATH = "death";
  ANIM_HOVER = "hoverboard";
  ANIM_RUN = "run";
  ANIM_PORTAL = "portal";
  ANIM_AIM = "aim";

  BONE_CROSSHAIR = "crosshair";
  BONE_FRONT_FOOT_TIP = "front-foot-tip";

  SCALE = 0.3;
  WALK_SPEED = 4;
  RUN_SPEED = 10;
  JUMP_FORCE = -20;

  constructor(resource, name = "superSpineboy") {
    super(resource.spineData);

    this.name = name;
    this.gsap = null;
    this.vxTween = null;

    // default starting animation
    this.state.setAnimation(0, "idle", true);

    // set the animation mixes
    this.stateData.setMix("idle", "jump", 0.2);
    this.stateData.setMix("jump", "idle", 0.2);
    this.stateData.setMix("idle", "walk", 0.15);
    this.stateData.setMix("walk", "idle", 0.2);
    this.stateData.setMix("walk", "jump", 0.2);
    this.stateData.setMix("jump", "walk", 0.2);
    this.stateData.setMix("death", "jump", 0.2);
    this.stateData.setMix("idle", "hoverboard", 0.3);
    this.stateData.setMix("hoverboard", "walk", 0.3);

    this.aimBone = this.skeleton.findBone("crosshair");
    this.aimSlot = this.skeleton.findSlot("crosshair");
    this.frontFootTipBone = this.skeleton.findBone(this.BONE_FRONT_FOOT_TIP);
    this.facingRight = true;
    this.vx = 0;
    this.vy = 0;
    this.jumping = false;
    this.moving = false;
    this.running = false;
    this.aiming = false;
    this.onground = false;
    this.isReady = true;
    this.health = 100;
    this.lives = 3;
  }

  face(direction) {
    if (!this.isReady) return;
    this.facingRight = direction === this.DIR_RIGHT;
    if (this.facingRight) this.scale.x = this.SCALE;
    else this.scale.x = -this.SCALE;
  }

  canJump() {
    return this.isReady && !this.jumping && this.onground;
  }

  jump(jumpForce = this.JUMP_FORCE) {
    if (!this.isReady) return;
    if (this.jumping) return;
    if (this.canJump()) {
      console.log("jump");
      this.jumping = true;
      this.onground = false;
      this.state.setAnimation(0, this.ANIM_JUMP, false);
      this.vy = jumpForce;
    }
  }

  move(direction) {
    if (!this.isReady) return;
    if (this.moving) return;
    this.moving = true;
    if (direction) this.face(direction);
    if (this.running) this.run(direction);
    else this.walk(direction);
  }

  walk() {
    if (!this.isReady) return;
    if (this.onground) {
      this.state.setAnimation(0, this.ANIM_WALK, true);
      if (this.gsap) {
        if (this.vxTween) this.vxTween.kill();
        this.vxTween = this.gsap.to(this, {
          vx: this.WALK_SPEED * (this.facingRight ? 1 : -1),
          duration: 0.3,
        });
      }
    }
  }

  run() {
    this.running = true;
    if (!this.moving) return;
    if ([this.ANIM_IDLE, this.ANIM_WALK, this.ANIM_JUMP].includes(this.state.tracks[0].animation.name)) {
      console.log("run");
      this.state.setAnimation(0, this.ANIM_RUN, true);
      if (this.gsap) {
        if (this.vxTween) this.vxTween.kill();
        this.vxTween = this.gsap.to(this, {
          vx: this.RUN_SPEED * (this.facingRight ? 1 : -1),
          duration: 0.3,
        });
      }
    }
  }

  stopRunning() {
    if (!this.isReady) return;
    if (this.moving) {
      this.walk();
    }
    this.running = false;
  }

  hover() {
    if (!this.isReady) return;
    this.state.setAnimation(0, ANIM_HOVER, true);
  }

  die() {
    this.lives--;
    this.isReady = false;
    this.state.setAnimation(0, this.ANIM_DEATH, false);
  }

  respawn() {
    this.isReady = false;
    this.state.setAnimation(0, "portal", false);
    this.state.addAnimation(0, "idle", true, 0);
  }

  aim() {
    if (!this.isReady) return;
    this.aiming = true;
    this.state.setAnimation(1, ANIM_AIM, false);
  }

  shoot() {
    if (!this.isReady) return;
    this.state.setAnimation(2, "shoot", false);
  }

  hitGround() {
    if (!this.isReady) return;
    this.onground = true;
    if (!this.moving) this.stop();
    else {
      if (this.running && this.state.tracks[0].animation.name === this.ANIM_JUMP) this.run();
      else if (!this.running && this.state.tracks[0].animation.name !== this.ANIM_WALK) this.walk();
    }
    this.jumping = false;
  }

  stop() {
    if (!this.isReady) return;
    this.moving = false;
    if (this.onground && this.state.tracks[0].animation.name !== this.ANIM_IDLE) {
      this.state.setAnimation(0, this.ANIM_IDLE, true);
      if (this.gsap) {
        if (this.vxTween) this.vxTween.kill();
        this.vxTween = this.gsap.to(this, {
          vx: 0,
          duration: 0.05,
        });
      }
    }
  }

  update(dt) {
    super.update(dt);
  }
}
