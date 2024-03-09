import "pixi-spine";
import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { Spine } from "pixi-spine";

(async () => {
  const initGsap = async () => {
    gsap.registerPlugin(PixiPlugin);
    PixiPlugin.registerPIXI(PIXI);
  };

  const initApp = async () => {
    const app = new PIXI.Application();
    await app.init({
      // width: window.innerWidth,
      // height: window.innerHeight,
      backgroundAlpha: 0,
      resizeTo: window,
    });
    document.body.appendChild(app.canvas);

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
    initGsap();
    const app = await initApp();
    const bunny = await initBunny(app);

    // let resource = await PIXI.Assets.load("assets/spineboy-pro.json");
    // const animation = new Spine(resource.spineData);
    // app.stage.addChild(animation);

    app.ticker.add(() => {
      bunny.rotation += 0.01;
    });

    window.addEventListener("resize", () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      bunny.x = app.renderer.width / 2;
      bunny.y = app.renderer.height / 2;
    });
  };
})();
