import "pixi-spine";
import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { Spine } from "pixi-spine";

(async () => {
  console.log(PIXI.VERSION);

  const initGsap = async () => {
    gsap.registerPlugin(PixiPlugin);
    PixiPlugin.registerPIXI(PIXI);
  };

  const initApp = async () => {
    const app = new PIXI.Application({
      resizeTo: window,
    });
    // await app.init({
    //   // width: window.innerWidth,
    //   // height: window.innerHeight,
    //   backgroundAlpha: 0,
    //   resizeTo: window,
    // });
    document.body.appendChild(app.view);

    return app;
  };

  const initBunny = async (app) => {
    const texture = await PIXI.Assets.load("src/assets/sample.png");
    const bunny = new PIXI.Sprite(texture);

    bunny.x = app.renderer.width / 2;
    bunny.y = app.renderer.height / 3;
    bunny.anchor.set(0.5);
    bunny.eventMode = "dynamic";

    app.stage.addChild(bunny);

    // gsap.to(bunny, {
    //   pixi: {
    //     scaleX: 2,
    //     scaleY: 2,
    //   },
    //   duration: 2,
    //   yoyo: true,
    //   repeat: -1,
    // });

    bunny.on("pointerdown", (event) => {
      gsap.to(bunny, {
        pixi: {
          scaleX: 2,
          scaleY: 2,
        },
        duration: 0.2,
      });
    });
    bunny.on("pointerup", (event) => {
      gsap.to(bunny, {
        pixi: {
          scaleX: 1,
          scaleY: 1,
        },
        duration: 0.2,
      });
    });
    bunny.on("pointerleave", (event) => {
      gsap.to(bunny, {
        pixi: {
          scaleX: 1,
          scaleY: 1,
        },
        duration: 0.2,
      });
    });

    return bunny;
  };

  const initDragon = async (app) => {
    let resource = await PIXI.Assets.load("/dragon/dragon.json");
    const dragon = new Spine(resource.spineData);
    app.stage.addChild(dragon);

    dragon.position.set(app.renderer.width / 2 + 50, app.renderer.height / 3);
    dragon.state.timeScale = 0.02;
    dragon.scale.set(0.5);
    dragon.scale.x = -0.5;
    dragon.eventMode = "dynamic";

    dragon.state.setAnimation(0, "flying", true);

    return dragon;
  };

  const initSuperSpineboy = async (app) => {
    let resource = await PIXI.Assets.load("/spineboy-pro/spineboy-pro.json");

    console.log(resource);
    const superSpineboy = new Spine(resource.spineData);
    app.stage.addChild(superSpineboy);
    console.log(superSpineboy);

    superSpineboy.position.set(app.renderer.width / 4, app.renderer.height);
    superSpineboy.state.timeScale = 0.02;
    superSpineboy.scale.set(0.5);
    superSpineboy.eventMode = "dynamic";

    superSpineboy.state.setAnimation(0, "idle", true);
    // superSpineboy.state.setAnimation(1, "shoot", true);

    superSpineboy.stateData.setMix("idle", "jump", 0.2);
    superSpineboy.stateData.setMix("jump", "idle", 0.4);
    superSpineboy.stateData.setMix("idle", "walk", 0.15);
    superSpineboy.stateData.setMix("walk", "idle", 0.2);
    superSpineboy.stateData.setMix("walk", "jump", 0.2);
    superSpineboy.stateData.setMix("jump", "walk", 0.2);
    superSpineboy.stateData.setMix("death", "jump", 0.2);
    superSpineboy.stateData.setMix("idle", "hoverboard", 0.3);
    superSpineboy.stateData.setMix("hoverboard", "walk", 0.3);

    let aimBone = superSpineboy.skeleton.findBone("crosshair");
    let aimSlot = superSpineboy.skeleton.findSlot("crosshair");

    superSpineboy["facingRight"] = true;
    const flip = (direction) => {
      superSpineboy.facingRight = direction == "right";
      if (superSpineboy.facingRight) superSpineboy.scale.x = 0.5;
      else superSpineboy.scale.x = -0.5;
    };

    superSpineboy["walking"] = false;
    let jumping = false;
    let aiming = false;
    document.addEventListener("keydown", (event) => {
      event.preventDefault = true;
      console.log("keydown: ", event);

      if (event.code == "Space") {
        if (!jumping) {
          jumping = true;
          superSpineboy.state.setAnimation(0, "jump", false);
          // superSpineboy.state.addAnimation(0, "idle", true, 0);
          gsap.to(superSpineboy, {
            pixi: {
              y: "-=200",
            },
            duration: 0.5,
          });
        }
      }

      if (event.key === "ArrowRight") {
        flip("right");
        if (!superSpineboy["walking"]) {
          superSpineboy["walking"] = true;
          superSpineboy.state.setAnimation(0, "walk", true);
        }
      }

      if (event.key === "h") {
        superSpineboy.state.setAnimation(0, "hoverboard", true);
      }

      if (event.key === "d") {
        superSpineboy.state.setAnimation(0, "death", false);
      }

      if (event.key === "p") {
        superSpineboy.state.setAnimation(0, "portal", false);
        superSpineboy.state.addAnimation(0, "idle", true, 0);
      }

      if (event.key === "ArrowLeft") {
        flip("left");
        if (!superSpineboy["walking"]) {
          superSpineboy["walking"] = true;
          superSpineboy.state.setAnimation(0, "walk", true);
        }
      }

      if (event.key == "a") {
        if (!aiming) {
          aiming = true;
          superSpineboy.state.setAnimation(1, "aim", false);
        } // else {
        //   aimBone.y += 1;
        // }
      }

      if (event.key === "f") {
        superSpineboy.state.setAnimation(2, "shoot", false);
        // superSpineboy.state.addEmptyAnimation(2, 0.5, 0.1);
      }
    });

    document.addEventListener("keyup", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        superSpineboy["walking"] = false;
        superSpineboy.state.setAnimation(0, "idle", true);
      }

      if (event.code == "Space") {
        jumping = false;
      }

      if (event.key == "a") {
        aiming = false;
        superSpineboy.state.addEmptyAnimation(1, 0.2, 0.1);
      }
    });

    const getMousePosition = (event) => {
      const rect = app.view.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const transformToLocalSpace = (globalPosition, spineAnimation) => {
      const globalPoint = new PIXI.Point(globalPosition.x, globalPosition.y);
      const inverseMatrix = spineAnimation.worldTransform.clone().invert();
      const localPoint = inverseMatrix.apply(globalPoint);

      return {
        x: localPoint.x,
        y: -localPoint.y,
      };
    };

    app.view.eventMode = "dynamic";
    app.view.addEventListener("pointermove", (event) => {
      const mousePosition = getMousePosition(event);
      const localPosition = transformToLocalSpace(mousePosition, superSpineboy);

      aimBone.x = localPosition.x;
      aimBone.y = localPosition.y;
    });

    superSpineboy.state.addListener({
      complete: (trackEntry, loopCount) => {
        // console.log(trackEntry);
        console.log(superSpineboy["walking"]);
        if (trackEntry.animation.name == "jump") {
          jumping = false;
          if (superSpineboy["walking"]) {
            superSpineboy.state.setAnimation(0, "walk", true);
          } else {
            superSpineboy.state.setAnimation(0, "idle", true);
          }
        }
      },
    });

    return superSpineboy;
  };

  window.onload = async () => {
    initGsap();
    const app = await initApp();
    // const bunny = await initBunny(app);
    const dragon = await initDragon(app);
    const superSpineboy = await initSuperSpineboy(app);

    app.ticker.add((dt) => {
      superSpineboy.update(dt);
      // bunny.rotation += 0.01;
      dragon.update(dt);
      dragon.x -= 10;
      if (dragon.x < -200) dragon.x = 2100;

      if (superSpineboy.walking)
        superSpineboy.x += superSpineboy.facingRight ? 5 : -5;
      if (superSpineboy.x > window.innerWidth + 20) superSpineboy.x = -49;
      if (superSpineboy.x < -50) superSpineboy.x = window.innerWidth + 19;
    });

    window.addEventListener("resize", () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      // superSpineboy.position.set(app.renderer.width / 3, app.renderer.height);
    });
  };
})();
