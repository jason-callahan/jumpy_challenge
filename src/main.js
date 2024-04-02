import "pixi-spine";
import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { Spine } from "pixi-spine";
import SuperSpineboy from "./superspineboy/SuperSpineboy";

(async () => {
  console.log(PIXI.VERSION);

  class KeyCode {
    static JUMP = "Space";
    static MOVE_RIGHT = "ArrowRight";
    static MOVE_LEFT = "ArrowLeft";
    static RUN = "KeyX";
    static SHOOT = "Shift";
  }

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

  const initEvents = (app) => {
    const gameWorld = app.stage.getChildByName("gameWorld");
    const superSpineboy = gameWorld.getChildByName("superSpineboy");

    document.addEventListener("keydown", (event) => {
      console.log(event);
      if (event.code === KeyCode.JUMP) superSpineboy.jump();
      if (event.code === KeyCode.MOVE_RIGHT) superSpineboy.move(superSpineboy.DIR_RIGHT);
      if (event.code === KeyCode.MOVE_LEFT) superSpineboy.move(superSpineboy.DIR_LEFT);
      if (event.code === KeyCode.RUN) superSpineboy.run();
      if (event.key === KeyCode.SHOOT) superSpineboy.shoot();
    });

    document.addEventListener("keyup", (event) => {
      console.log(event);
      if ([KeyCode.MOVE_LEFT, KeyCode.MOVE_RIGHT].includes(event.code)) superSpineboy.stop();
      if (event.code === KeyCode.RUN) superSpineboy.stopRunning();
    });
  };

  const initSuperSpineboy = async (gameWorld) => {
    let resource = await PIXI.Assets.load("/spineboy-pro/spineboy-pro.json");
    const superSpineboy = new SuperSpineboy(resource);
    superSpineboy.gsap = gsap;
    gameWorld.addChild(superSpineboy);

    superSpineboy.state.timeScale = 0.02;
    superSpineboy.scale.set(0.3);
    superSpineboy.position.set(gameWorld.width / 4, gameWorld.height);
    superSpineboy.eventMode = "dynamic";

    return superSpineboy;
  };

  const _initSuperSpineboy = async (superSpineboy, app, gameWorld) => {
    let resource = await PIXI.Assets.load("/spineboy-pro/spineboy-pro.json");

    let aiming = false;
    let jumpForce = -15;
    superSpineboy["vy"] = 0;
    superSpineboy["vx"] = 0;
    superSpineboy["walking"] = false;
    superSpineboy["jumping"] = false;
    document.addEventListener("keydown", (event) => {
      event.preventDefault = true;
      // console.log("keydown: ", event);

      if (event.code == "Space") {
        if (!superSpineboy["jumping"] && superSpineboy.vy <= 0) {
          superSpineboy["jumping"] = true;
          superSpineboy.state.setAnimation(0, "jump", false);
          superSpineboy.vy += jumpForce;
          console.log("jump: " + superSpineboy.vy);
          // superSpineboy.state.addAnimation(0, "idle", true, 0);
          // gsap.to(superSpineboy, {
          //   pixi: {
          //     y: "-=200",
          //   },
          //   duration: 0.5,
          // });
        }
      }

      if (event.key === "ArrowRight") {
        flip("right");
        if (!superSpineboy["walking"]) {
          superSpineboy["walking"] = true;
          superSpineboy.vx = 5;
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
          superSpineboy.vx = -5;
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
        superSpineboy.vx = 0;
        superSpineboy.state.setAnimation(0, "idle", true);
      }

      if (event.code == "Space") {
        superSpineboy["jumping"] = false;
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
        // console.log(superSpineboy["walking"]);
        if (trackEntry.animation.name == "jump") {
          superSpineboy["jumping"] = false;
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

  const groundFactory = async (width, offset = 0) => {
    let resource = await PIXI.Assets.load("/iP4_ground_half.png");
    const ground = new PIXI.TilingSprite(resource, width, resource.height);
    ground.tilePosition.x = offset;
    return ground;
  };

  const initGround = async (app, gameWorld) => {
    let ground = await groundFactory(app.renderer.width + 100);
    ground.name = "ground";
    gameWorld.addChild(ground);
    ground.position.set(-50, app.renderer.height - ground.height);

    return ground;
  };

  const isCollision = (bounds1, bounds2) => {
    return (
      bounds1.x + bounds1.width > bounds2.x &&
      bounds1.x < bounds2.x + bounds2.width &&
      bounds1.y + bounds1.height > bounds2.y &&
      bounds1.y < bounds2.y + bounds2.height
    );
  };

  const isAbove = (bounds1, bounds2) => {
    return (
      bounds1.x + bounds1.width > bounds2.x &&
      bounds1.x < bounds2.x + bounds2.width &&
      bounds1.y + bounds1.height > bounds2.y &&
      bounds1.y < bounds2.y + bounds2.height
    );
  };

  const gravity = 0.5;
  window.onload = async () => {
    initGsap();
    const debug = document.querySelector(".debug");
    const app = await initApp();
    const gameWorld = new PIXI.Container();
    gameWorld.name = "gameWorld";
    app.stage.addChild(gameWorld);
    // const bunny = await initBunny(app);
    // const superSpineboy = await initSuperSpineboy(app, gameWorld);

    // let resource = await PIXI.Assets.load("/spineboy-pro/spineboy-pro.json");
    // const superSpineboy = new SuperSpineBoy(gameWorld, resource);
    // gameWorld.addChild(superSpineboy);
    // superSpineboy.position.set(app.renderer.width / 4, app.renderer.height);

    const superSpineboy = await initSuperSpineboy(gameWorld);

    var platforms = [];
    const ground = await initGround(app, gameWorld);
    ground.name = "ground";
    platforms.push(ground);

    const platform1 = await groundFactory(300, -30);
    gameWorld.addChild(platform1);
    platform1.position.set(600, app.renderer.height - 300);
    platforms.push(platform1);

    const platform2 = await groundFactory(300, -400);
    gameWorld.addChild(platform2);
    platform2.position.set(200, app.renderer.height - 500);
    platforms.push(platform2);

    const platform3 = await groundFactory(300, -200);
    gameWorld.addChild(platform3);
    platform3.position.set(800, app.renderer.height - 700);
    platforms.push(platform3);

    const platform4 = await groundFactory(300, -200);
    gameWorld.addChild(platform4);
    platform4.position.set(300, app.renderer.height - 900);
    platforms.push(platform4);

    // const dragon = await initDragon(app);

    // // for testing collisions
    // const graphics = new PIXI.Graphics();
    // graphics.beginFill(0xff0000); // Red color
    // graphics.drawRect(0, 0, 50, 5); // Adjust the radius as needed
    // graphics.endFill();
    // gameWorld.addChild(graphics);

    let debugText = new PIXI.Text("debugging...", {
      fill: "white",
      fontSize: 16,
    });
    debugText.position.set(10, 10);
    app.stage.addChild(debugText);

    initEvents(app);
    window.addEventListener("resize", async () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      let ground = gameWorld.getChildByName("ground");
      gameWorld.removeChild(ground);
      ground = await initGround(app, gameWorld);
      platforms[0] = ground;
      superSpineboy.y = app.renderer.height - 200;
      superSpineboy.vy = 0;
    });

    superSpineboy.y = app.renderer.height - 200;

    let tempText = "";
    let aboveGround = superSpineboy.y - 50;
    let bounds1, bounds2;
    app.ticker.add((dt) => {
      superSpineboy.vy += gravity;
      aboveGround = superSpineboy.y - 100;
      superSpineboy.y += superSpineboy.vy;
      superSpineboy.x += superSpineboy.vx;

      bounds1 = superSpineboy.getBounds();
      bounds1.width -= 60;
      bounds1.x += 25;

      // graphics.x = bounds1.x;
      // graphics.y = bounds1.y;
      // graphics.width = bounds1.width;
      // graphics.height = bounds1.height;

      for (let i = 0; i < platforms.length; i++) {
        let p = platforms[i];
        let py = p.y + 25;
        bounds2 = p.getBounds();
        bounds2.y += 25;
        if (
          superSpineboy.vy > 0 &&
          aboveGround < py &&
          isCollision(bounds1, bounds2)
          // superSpineboy.x + superSpineboy.width > p.x &&
          // superSpineboy.x < p.x + p.width &&
          // superSpineboy.y + superSpineboy.height > p.y &&
          // superSpineboy.y < p.y + p.height
        ) {
          superSpineboy.vy = 0;
          superSpineboy.y = py;
          superSpineboy.hitGround();
          // console.log(`hitGround - py: ${p.y}, superSpineBoy y:${superSpineboy.y}, vy:${superSpineboy.vy}`);
        }
        // p.x += 1;
      }

      // if (!superSpineboy.onground) {
      //   superSpineboy.vy += gravity;
      //   aboveGround = superSpineboy.y + 100;
      //   superSpineboy.y += superSpineboy.vy;
      // }

      // console.log(`vy: ${superSpineboy.vy}, y: ${superSpineboy.y}`);

      if (superSpineboy.y < 500 && gameWorld.y == 0) {
        console.log("move up");
        gsap.to(gameWorld, {
          pixi: {
            y: 200,
          },
          duration: 2,
          ease: "power1.inOut",
        });
      }

      if (superSpineboy.y < 0 && gameWorld.y == 200) {
        console.log("move up");
        gsap.to(gameWorld, {
          pixi: {
            y: 400,
          },
          duration: 2,
          ease: "power1.inOut",
        });
      }

      tempText = `app - width:${app.renderer.width}, height:${app.renderer.height}\n`;
      tempText += `gameWorld - x:${gameWorld.x}, y:${gameWorld.y}, width:${gameWorld.width}, height:${gameWorld.height}\n`;
      tempText += `ground - x:${ground.x}, y:${ground.y}\n`;
      tempText += `platform1 - x:${platform1.x}, y:${platform1.y}\n`;
      tempText += `platform2 - x:${platform2.x}, y:${platform2.y}`;
      tempText += `\naboveGround:${aboveGround}`;
      tempText += `\nsuperSpineboy - \nx:${superSpineboy.x}, y:${superSpineboy.y}`;
      // tempText += `\nwidth: ${superSpineboy.width}, height: ${superSpineboy.height}`;
      tempText += `\nvx:${superSpineboy.vx}, vy:${superSpineboy.vy}`;
      tempText += `\nmoving: ${superSpineboy.moving}, running: ${superSpineboy.running}, jumping: ${superSpineboy.jumping}, onground: ${superSpineboy.onground}`;
      tempText += `\nfrontFootTip: ${superSpineboy.frontFootTipBone.y}`;
      // tempText += `\nbounds: ${bounds1}`;
      tempText += `\nanimation: ${superSpineboy.state.tracks[0].animation.name}`;
      tempText += `\nstage: ${app.stage.children.length}, gameWorld: ${gameWorld.children.length}, platforms: ${platforms.length}`;
      debugText.text = tempText;

      superSpineboy.update(dt);

      // graphics.x = superSpineboy.x;
      // graphics.y = superSpineboy.y;

      // bunny.rotation += 0.01;
      // dragon.update(dt);
      // dragon.x -= 10;
      // if (dragon.x < -200) dragon.x = 2100;

      if (superSpineboy.x > window.innerWidth + 20) superSpineboy.x = -49;
      if (superSpineboy.x < -50) superSpineboy.x = window.innerWidth + 19;
    });
  };
})();
