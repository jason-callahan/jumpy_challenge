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
    bunny.y = app.renderer.height / 2;
    bunny.anchor.set(0.5);
    bunny.eventMode = "dynamic";

    app.stage.addChild(bunny);

    // gsap.to(bunny, {
    //     pixi: {
    //         scaleX: 2,
    //         scaleY: 2,
    //     },
    //     duration: 2,
    //     yoyo: true,
    //     repeat: -1,
    // });

    bunny.on("pointerdown", (event) => {
      console.log(event);
      gsap.to(bunny, {
        pixi: {
          scaleX: 2,
          scaleY: 2,
        },
        duration: 0.2,
      });
    });
    bunny.on("pointerup", (event) => {
      console.log(event);
      gsap.to(bunny, {
        pixi: {
          scaleX: 1,
          scaleY: 1,
        },
        duration: 0.2,
      });
    });
    bunny.on("pointerleave", (event) => {
      console.log(event);
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

  window.onload = async () => {
    // initGsap();
    const app = await initApp();
    // const bunny = await initBunny(app);

    PIXI.Assets.load("/spineboy-pro/spineboy-pro.json")
      .then((resource) => {
        console.log(resource);
        const animation = new Spine(resource.spineData);
        app.stage.addChild(animation);
        console.log(animation);

        // let spine = app.stage.addChild(new Spine(resource.spineData));
        animation.position.set(app.renderer.width / 2, app.renderer.height);
        animation.state.setAnimation(0, "idle", true);
        animation.state.timeScale = 0.02;
        animation.scale.set(0.5);
        animation.eventMode = "dynamic";
        // animation.autoUpdate = true;

        animation.stateData.setMix("idle", "jump", 0.2);
        animation.stateData.setMix("jump", "idle", 0.4);

        app.ticker.add((dt) => {
          animation.update(dt);
        });

        // animation.state.addListener({
        //   complete: (trackIndex, loopCount) => {
        //     console.log(trackIndex);
        //     animation.state.setAnimation(0, "idle", true);
        //     // animation.state.mixDuration = 0.5;
        //   },
        // });

        animation.on("pointerdown", (event) => {
          console.log(event);
          animation.state.setAnimation(0, "jump", false);
          animation.state.addAnimation(0, "idle", true, 0);
        });

        document.addEventListener("keydown", (event) => {
          if (event.key == " ") {
            animation.state.setAnimation(0, "jump", false);
            animation.state.addAnimation(0, "idle", true, 0);
          }
        });
        document.addEventListener("keyup", (event) => {});

        window.addEventListener("resize", () => {
          app.renderer.resize(window.innerWidth, window.innerHeight);
          animation.position.set(app.renderer.width / 2, app.renderer.height);
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };
})();
