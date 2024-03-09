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

  const initSuperSpineboy = async (app) => {
    let resource = await PIXI.Assets.load("/spineboy-pro/spineboy-pro.json");

    console.log(resource);
    const superSpineboy = new Spine(resource.spineData);
    app.stage.addChild(superSpineboy);
    console.log(superSpineboy);

    superSpineboy.position.set(app.renderer.width / 2, app.renderer.height);
    superSpineboy.state.timeScale = 0.02;
    superSpineboy.scale.set(0.5);
    superSpineboy.eventMode = "dynamic";

    superSpineboy.state.setAnimation(0, "idle", true);
    // superSpineboy.state.setAnimation(1, "shoot", true);

    superSpineboy.stateData.setMix("idle", "jump", 0.2);
    superSpineboy.stateData.setMix("jump", "idle", 0.4);
    superSpineboy.stateData.setMix("idle", "walk", 0.2);
    superSpineboy.stateData.setMix("walk", "idle", 0.2);
    superSpineboy.stateData.setMix("walk", "jump", 0.2);
    superSpineboy.stateData.setMix("jump", "walk", 0.2);

    let aimBone = superSpineboy.skeleton.findBone("crosshair");
    let aimSlot = superSpineboy.skeleton.findSlot("crosshair");

    let facingRight = true;
    const flip = (direction) => {
      if (direction === "right") superSpineboy.scale.x = 0.5;
      else if (direction === "left") superSpineboy.scale.x = -0.5;
    };

    let walking = false;
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
        }
      }

      if (event.key === "ArrowRight") {
        flip("right");
        if (!walking) {
          walking = true;
          superSpineboy.state.setAnimation(0, "walk", true);
        }
      }

      if (event.key === "ArrowLeft") {
        flip("left");
        if (!walking) {
          walking = true;
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
        walking = false;
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

    function getMousePosition(event) {
      const rect = app.view.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }

    function transformToLocalSpace(globalPosition, spineAnimation) {
      // This function should convert globalPosition to the spineAnimation's local space.
      // This might involve inverse transforming by the animation's global position, scale, and rotation.
      // For simplicity, this is just a placeholder.
      const globalPoint = new PIXI.Point(globalPosition.x, globalPosition.y);
      const inverseMatrix = spineAnimation.worldTransform.clone().invert();
      const localPoint = inverseMatrix.apply(globalPoint);
      // localPoint.y = spineAnimation.height - localPoint.y;

      return {
        x: localPoint.x,
        y: -localPoint.y,
      }; // This needs to be properly implemented
    }

    app.view.eventMode = "dynamic";
    app.view.addEventListener("pointermove", (event) => {
      const mousePosition = getMousePosition(event);
      const localPosition = transformToLocalSpace(mousePosition, superSpineboy);

      // console.log(rect);
      // console.log(
      //   `${event.clientX} | ${event.clientY}, ${event.screenX} | ${event.screenY}, ${event.layerX} | ${event.layerY}`
      // );

      aimBone.x = localPosition.x;
      aimBone.y = localPosition.y;
    });

    // app.stage.eventMode = "dynamio";
    // app.stage.on("mousemove", (event) => {
    //   if (aiming) {
    //     let mousePos = event.dat
    //     aimBone.x = mousePos.x;
    //     aimBone.y = mousePos.y;
    //   }
    // });

    superSpineboy.state.addListener({
      complete: (trackEntry, loopCount) => {
        // console.log(trackEntry);
        console.log(walking);
        if (trackEntry.animation.name == "jump") {
          jumping = false;
          if (walking) {
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
    const superSpineboy = await initSuperSpineboy(app);

    app.ticker.add((dt) => {
      superSpineboy.update(dt);
      // bunny.rotation += 0.01;
    });

    window.addEventListener("resize", () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      animation.position.set(app.renderer.width / 2, app.renderer.height);
    });
  };
})();
