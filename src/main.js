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

  const initDragon = async (gameWorld) => {
    let resource = await PIXI.Assets.load("/dragon/dragon.json");
    const dragon = new Spine(resource.spineData);
    gameWorld.addChild(dragon);

    dragon.pivot.set(0, 0);
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

  const initScore = (app) => {
    const scoreContainer = new PIXI.Container();
    app.stage.addChild(scoreContainer);

    // Create a style for the score text
    const textStyle = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 24,
      fill: "white",
    });

    // Create the score text object
    const scoreText = new PIXI.Text("Score: 0", textStyle);
    scoreText.anchor.set(1, 0); // Anchor to the upper right corner
    scoreText.position.set(app.screen.width - 10, 10); // Position in the upper right corner with a 10px margin
    scoreContainer.addChild(scoreText);

    return scoreText;
  };

  const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const __initPlatforms = async (gameWorld, count = 5) => {
    const platformWidth = 300;

    let platforms = [];
    let textureOffset = -30;
    let xPosition = 0;
    let yLevel = gameWorld.height - 300;
    for (let i = 0; i < count; i++) {
      const platform = await groundFactory(platformWidth, textureOffset);
      gameWorld.addChild(platform);

      xPosition = Math.random();
      platform.position.set(600, yLevel);
      platforms.push(platform);

      console.log(`created platform ${i}: ${platform.getBounds()}`);

      yLevel -= 200;
    }

    return platforms;
  };

  const initPlatforms = async (app, gameWorld, count = 5) => {
    const platformWidth = 300;
    const maxDistance = 500;
    const yDistance = 300;

    let platforms = [];
    let textureOffset = -30;
    let xPosition = 0;
    let distance = 0;
    let gameWidth = app.renderer.width;
    let gameHeight = app.renderer.height;
    let yLevel = gameHeight - yDistance - 100;
    for (let i = 0; i < count; i++) {
      const platform = await groundFactory(platformWidth, textureOffset);
      gameWorld.addChild(platform);

      xPosition = getRandomInt(platformWidth + 10, gameWidth - (platformWidth + 10));
      if (i > 0) {
        distance = xPosition - platforms[i - 1].x;
        if (Math.abs(distance) > 500)
          xPosition = distance > 0 ? platforms[i - 1].x + maxDistance : platforms[i - 1].x - maxDistance;
      }
      platform.position.set(xPosition, yLevel);
      platforms.push(platform);

      console.log(`created platform ${i}: ${platform.getBounds()}`);

      yLevel -= yDistance;
    }

    return platforms;
  };

  let camTweenUp, camTweenDown;
  const updateCamera = (app, gameWorld, superSpineboy) => {
    const moveArea = Math.floor(app.renderer.height / 3);

    if (superSpineboy.y > moveArea * 2 && gameWorld.y == 0) return;

    let moveUp = superSpineboy.y + gameWorld.y < app.renderer.height / 2;
    if (moveUp) {
      // console.log(`moveUp: ${moveUp}, ssb.y: ${superSpineboy.y + gameWorld.y} < ${moveArea}`);
      let moveTo = gameWorld.y + moveArea;
      if (!gsap.isTweening(gameWorld)) {
        camTweenUp = gsap.to(gameWorld, {
          pixi: {
            y: moveTo,
          },
          duration: 1,
          ease: "power1.inOut",
        });
      } else console.log("already tweening gameworld");

      return;
    }

    let moveDown = superSpineboy.y + gameWorld.y + 60 > moveArea * 3;
    // if (moveDown) {
    //   console.log(`moveDown: ${moveDown}, ssb.y: ${superSpineboy.y + gameWorld.y} > ${moveArea * 2}`);
    //   let moveTo = gameWorld.y - moveArea;
    //   if (!gsap.isTweening(gameWorld)) {
    //     if (camTweenUp && camTweenUp.isActive()) camTweenUp.kill();
    //     if (camTweenDown && camTweenDown.isActive()) {
    //       console.log("killing camTweenDown");
    //       camTweenDown.kill();
    //     }
    //     camTweenDown = gsap.to(gameWorld, {
    //       pixi: {
    //         y: moveTo,
    //       },
    //       duration: 0.5,
    //       ease: "power1.inOut",
    //     });
    //   } else console.log("already tweening gameworld");
    // }
    if (moveDown) {
      if (camTweenUp && camTweenUp.isActive()) camTweenUp.kill();
      let moveSpeed = superSpineboy.vy;
      if (moveSpeed <= 6) moveSpeed = 6;
      gameWorld.y -= moveSpeed;
    }
  };

  const gravity = 0.5;
  window.onload = async () => {
    initGsap();
    const debug = document.querySelector(".debug");
    const app = await initApp();

    const gameWorld = new PIXI.Container();
    // gameWorld.width = app.renderer.width;
    // gameWorld.height = app.renderer.height;
    gameWorld.name = "gameWorld";
    app.stage.addChild(gameWorld);

    const superSpineboy = await initSuperSpineboy(gameWorld);

    var platforms = [];
    const ground = await initGround(app, gameWorld);
    ground.name = "ground";
    platforms.push(ground);
    platforms = platforms.concat(await initPlatforms(app, gameWorld));

    const dragon = await initDragon(gameWorld);
    dragon.position.set(app.renderer.width, 300);

    // // for testing collisions
    // const graphics = new PIXI.Graphics();
    // graphics.beginFill(0xff0000, 0.5); // Red color
    // graphics.drawRect(0, 0, 50, 5); // Adjust the radius as needed
    // graphics.endFill();
    // gameWorld.addChild(graphics);

    let debugText = new PIXI.Text("debugging...", {
      fill: "white",
      fontSize: 16,
    });
    debugText.position.set(10, 10);
    app.stage.addChild(debugText);

    let score = 0;
    let scoreText = initScore(app);
    let updateScore = (newScore) => {
      score = newScore;
      scoreText.text = `Score: ${score}`;
    };

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

      bounds2 = dragon.getBounds();
      bounds2.height -= 150;
      bounds2.x += 60;
      bounds2.width -= 130;
      bounds2.y += 30;
      if (isCollision(bounds1, bounds2)) {
        updateScore(score - 1);
        superSpineboy.x += -10;
      }

      // graphics.x = bounds2.x;
      // graphics.y = bounds2.y;
      // graphics.width = bounds2.width;
      // graphics.height = bounds2.height;

      // if (!superSpineboy.onground) {
      //   superSpineboy.vy += gravity;
      //   aboveGround = superSpineboy.y + 100;
      //   superSpineboy.y += superSpineboy.vy;
      // }

      // console.log(`vy: ${superSpineboy.vy}, y: ${superSpineboy.y}`);

      updateCamera(app, gameWorld, superSpineboy);

      tempText = `app - width:${app.renderer.width}, height:${app.renderer.height}\n`;
      tempText += `gameWorld - x:${gameWorld.x}, y:${gameWorld.y}, width:${gameWorld.width}, height:${gameWorld.height}\n`;
      tempText += `ground - x:${ground.x}, y:${ground.y}\n`;
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

      dragon.update(dt);
      dragon.x -= 10;
      if (dragon.x < -200) dragon.x = gameWorld.width + 200;

      if (superSpineboy.x > window.innerWidth + 20) superSpineboy.x = -49;
      if (superSpineboy.x < -50) superSpineboy.x = window.innerWidth + 19;
    });
  };
})();
