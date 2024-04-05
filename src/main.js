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
    static RESPAWN = "KeyR";
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
    dragon.scale.set(0.25);
    dragon.scale.x = -0.25;
    dragon.eventMode = "dynamic";

    dragon.state.setAnimation(0, "flying", true);

    return dragon;
  };

  const initEvents = (app) => {
    const gameWorld = app.stage.getChildByName("gameWorld");
    const superSpineboy = gameWorld.getChildByName("superSpineboy");
    const ground = gameWorld.getChildByName("ground");

    document.addEventListener("keydown", (event) => {
      console.log(event);
      if (event.code === KeyCode.JUMP) superSpineboy.jump();
      if (event.code === KeyCode.MOVE_RIGHT) superSpineboy.move(superSpineboy.DIR_RIGHT);
      if (event.code === KeyCode.MOVE_LEFT) superSpineboy.move(superSpineboy.DIR_LEFT);
      if (event.code === KeyCode.RUN) superSpineboy.run();
      if (event.key === KeyCode.SHOOT) superSpineboy.shoot();
      if (event.code === KeyCode.RESPAWN) superSpineboy.respawn();
    });

    document.addEventListener("keyup", (event) => {
      console.log(event);
      if ([KeyCode.MOVE_LEFT, KeyCode.MOVE_RIGHT].includes(event.code)) superSpineboy.stop();
      if (event.code === KeyCode.RUN) superSpineboy.stopRunning();
    });

    window.addEventListener("resize", async () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      gameWorld.removeChild(ground);
      ground = await initGround(app, gameWorld);
      platforms[0] = ground;
      superSpineboy.y = app.renderer.height - 200;
      superSpineboy.vy = 0;
    });
  };

  const initSuperSpineboy = async () => {
    let resource = await PIXI.Assets.load("/spineboy-pro/spineboy-pro.json");
    const superSpineboy = new SuperSpineboy(resource);
    superSpineboy.gsap = gsap;

    superSpineboy.state.timeScale = 0.02;
    superSpineboy.scale.set(0.3);
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

  const _initGoal = async (app, gameWorld) => {
    let resource = await PIXI.Assets.load("/star.png");
    const goal = new PIXI.Sprite(resource);
    goal.name = "goal";
    goal.anchor.set(0.5);
    gameWorld.addChild(goal);

    return goal;
  };

  const initGoal = async (app, gameWorld) => {
    const resource = await PIXI.Assets.load("/star_sprite_sheet_2d_128px.png");

    // load each sprite sheet cell as an animation frame
    const textures = [];
    for (let i = 0; i < 16; i++) {
      const x = (i % 4) * 128;
      const y = Math.floor(i / 4) * 128;
      textures.push(new PIXI.Texture(resource, new PIXI.Rectangle(x, y, 128, 128)));
    }

    const goal = new PIXI.AnimatedSprite(textures);
    goal.name = "goal";
    goal.loop = true;
    goal.anchor.set(0.5);
    gameWorld.addChild(goal);
    goal.play();

    return goal;
  };

  const isCollision = (bounds1, bounds2) => {
    return (
      bounds1.x + bounds1.width > bounds2.x &&
      bounds1.x < bounds2.x + bounds2.width &&
      bounds1.y + bounds1.height > bounds2.y &&
      bounds1.y < bounds2.y + bounds2.height
    );
  };

  const newHudText = (app, title) => {
    const container = new PIXI.Container();
    app.stage.addChild(container);

    // Create a style for the score text
    const textStyle = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 24,
      fill: "white",
    });

    const text = new PIXI.Text(`${title}: 0`, textStyle);
    // text.anchor.set(1, 0);
    container.addChild(text);

    return text;
  };

  const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
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
      platform.name = `p${platforms.length + 1}`;
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

  let camTweenUp;
  const updateCamera = (app, gameWorld, superSpineboy) => {
    const moveArea = Math.floor(app.renderer.height / 3);

    if (gameWorld.y < 0) gameWorld.y = 0;
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
    if (moveDown) {
      if (camTweenUp && camTweenUp.isActive()) camTweenUp.kill();
      let moveSpeed = superSpineboy.vy;
      if (moveSpeed <= 6) moveSpeed = 6;
      gameWorld.y -= moveSpeed;
    }
  };

  const initLevel = (level) => {};

  const gravity = 0.5;
  window.onload = async () => {
    initGsap();
    const debug = document.querySelector(".debug");
    const app = await initApp();

    let hitPlatforms = ["p0"];

    const gameWorld = new PIXI.Container();
    gameWorld.name = "gameWorld";
    app.stage.addChild(gameWorld);

    // *** Init platforms *** //
    var platforms = [];
    const ground = await initGround(app, gameWorld);
    ground.name = "ground";
    platforms.push(ground);
    platforms = platforms.concat(await initPlatforms(app, gameWorld, 10));

    // *** Init Goal ** //
    const goal = await initGoal(app, gameWorld);
    let lastPlatform = platforms[platforms.length - 1];
    let goalX = lastPlatform.x + lastPlatform.width / 2;
    let goalY = platforms[platforms.length - 1].y - 500;
    goal.scale.set(0.75);
    goal.animationSpeed = 0.4;
    goal.position.set(goalX, goalY);

    // *** Init SuperSpineboy *** //
    const superSpineboy = await initSuperSpineboy();
    superSpineboy.position.set(200, app.renderer.height - ground.height + 30);
    superSpineboy.respawn();
    superSpineboy.state.addListener({
      complete: (trackIndex, loopCount) => {
        var animationName = superSpineboy.state.tracks[0].animation.name;
        // console.log(`${animationName} ended`);

        if (animationName === superSpineboy.ANIM_PORTAL) {
          superSpineboy.isReady = true;
        }

        if (animationName === superSpineboy.ANIM_DEATH) {
          superSpineboy.respawn();
          superSpineboy.health = 100;
          updateHealth(superSpineboy.health);
        }
      },
    });
    gameWorld.addChild(superSpineboy);

    // *** Init dragons *** //
    let dragons = [];
    let dragonCount = 1;
    for (let i = 0; i < dragonCount; i++) {
      const dragon = await initDragon(gameWorld);
      dragon.position.set(app.renderer.width, 300);
      dragons.push(dragon);
    }

    initEvents(app);

    // // *** Collision testing *** //
    // const graphics = new PIXI.Graphics();
    // graphics.beginFill(0xff0000, 0.5); // Red color
    // graphics.drawRect(0, 0, 50, 5); // Adjust the radius as needed
    // graphics.endFill();
    // gameWorld.addChild(graphics);

    // *** Debug text *** //
    let debugText = new PIXI.Text("debugging...", {
      fill: "white",
      fontSize: 16,
    });
    debugText.position.set(10, 10);
    app.stage.addChild(debugText);

    // *** Game HUD *** //
    let score = 0;
    let scoreText = newHudText(app, "Score");
    scoreText.position.set(app.screen.width - 600, 10);
    let updateScore = (newScore) => {
      score = newScore;
      scoreText.text = `Score: ${score}`;
    };

    let points = 0;
    let pointsText = newHudText(app, "Points");
    pointsText.position.set(app.screen.width - 400, 10);
    let updatePoints = (newPoints) => {
      points = newPoints;
      pointsText.text = `Points: ${points}`;
    };

    let healthText = newHudText(app, "Health");
    healthText.position.set(app.screen.width - 200, 10);
    let updateHealth = (newHealth) => {
      superSpineboy.health = newHealth;
      healthText.text = `Health: ${superSpineboy.health}`;
    };
    updateHealth(100);

    let level = 1;
    let levelText = newHudText(app, "Level");
    levelText.position.set(app.screen.width - 800, 10);
    let updateLevel = (newLevel) => {
      level = newLevel;
      levelText.text = `Level: ${level}`;
    };
    updateLevel(level);

    // let dragons = [];

    // const setupGame = async (level) => {
    //   // *** Init dragons *** //
    //   let dragonCount = 1;
    //   for (let i = 0; i < dragonCount; i++) {
    //     const dragon = await initDragon(gameWorld);
    //     dragon.position.set(app.renderer.width, 300);
    //     dragons.push(dragon);
    //   }
    // }

    // setupGame(1);

    // *** Loop vars *** //
    let tempText = "";
    let aboveGround = superSpineboy.y - 50;
    let bounds1, bounds2;
    let isDead = superSpineboy.health <= 0;
    let win = false;
    let winTween;

    // *** GAME LOOP *** //
    app.ticker.add((dt) => {
      isDead = superSpineboy.health <= 0;

      if (win && !winTween) {
        console.log("win scene");
        goal.gotoAndStop(0);
        winTween = gsap.to(goal, {
          pixi: {
            rotation: "+=720",
            scale: 30,
          },
          duration: 1,
          onComplete: () => {
            win = false;
            goal.scale.set(0.75);
            goal.animationSpeed = 0.4;
            goal.gotoAndPlay(0);
            winTween.kill();
            winTween = null;
          },
        });
        return;
      }

      if (isDead) superSpineboy.vx = 0;

      if (superSpineboy.isReady || isDead) {
        superSpineboy.tint = 0xffffff;
        superSpineboy.vy += gravity;
        aboveGround = superSpineboy.y - 100;
        superSpineboy.y += superSpineboy.vy;
        superSpineboy.x += superSpineboy.vx;

        // *** Platforms collision *** //
        bounds1 = superSpineboy.getBounds();
        bounds1.width -= 60;
        bounds1.x += 30;
        for (let i = 0; i < platforms.length; i++) {
          let p = platforms[i];
          let py = p.y + 30;
          bounds2 = p.getBounds();
          bounds2.y += 30;
          if (superSpineboy.vy > 0 && aboveGround < py && isCollision(bounds1, bounds2)) {
            superSpineboy.vy = 0;
            superSpineboy.y = py;
            superSpineboy.hitGround();
            let platformName = `p${i}`;
            if (!hitPlatforms.includes(platformName)) {
              console.log(`hit platform ${platformName}`);
              updatePoints(points + 1000);
              hitPlatforms.push(platformName);
            }
            // console.log(`hitGround - py: ${p.y}, superSpineBoy y:${superSpineboy.y}, vy:${superSpineboy.vy}`);
          }
          // p.x += 1;
        }

        if (!isDead) {
          let newPoints = points - 1;

          // *** Dragons *** //
          for (let i = 0; i < dragons.length; i++) {
            let dragon = dragons[i];
            bounds2 = dragon.getBounds();
            bounds2.height -= 150;
            bounds2.x += 60;
            bounds2.width -= 130;
            bounds2.y += 30;
            if (isCollision(bounds1, bounds2)) {
              superSpineboy.health -= 1;
              newPoints -= 1;
              if (superSpineboy.health <= 0) {
                superSpineboy.health = 0;
                superSpineboy.die();
              }
              updateHealth(superSpineboy.health);
              superSpineboy.x += -10;
              superSpineboy.tint = 0xff0000;
            }

            dragon.x -= 5;
            if (dragon.x < -200) dragon.x = gameWorld.width + 200;
            dragon.update(dt);
          }

          // *** Star collision *** //
          bounds2 = goal.getBounds();
          if (!win && isCollision(bounds1, bounds2)) {
            win = true;
            updateScore(score + points);
            newPoints = 0;
            updateLevel(++level);
            updateHealth(100);
          }

          if (newPoints >= 0) updatePoints(newPoints);
        }
      }

      /// *** Updates *** //

      if (superSpineboy.x > window.innerWidth + 20) superSpineboy.x = -49;
      if (superSpineboy.x < -50) superSpineboy.x = window.innerWidth + 19;
      superSpineboy.update(dt);

      if (!superSpineboy.isReady) {
        for (let i = 0; i < dragons.length; i++) {
          let dragon = dragons[i];
          dragon.x -= 5;
          if (dragon.x < -200) dragon.x = gameWorld.width + 200;
          dragon.update(dt);
        }
      }

      updateCamera(app, gameWorld, superSpineboy);

      // graphics.x = bounds1.x;
      // graphics.y = bounds1.y;
      // graphics.width = bounds1.width;
      // graphics.height = bounds1.height;

      // graphics.x = bounds2.x;
      // graphics.y = bounds2.y;
      // graphics.width = bounds2.width;
      // graphics.height = bounds2.height;
      // graphics.x = superSpineboy.x;
      // graphics.y = superSpineboy.y;

      tempText = `app - width:${app.renderer.width}, height:${app.renderer.height}`;
      tempText += `\ngameWorld - x:${gameWorld.x}, y:${gameWorld.y}, width:${gameWorld.width}, height:${gameWorld.height}`;
      tempText += `\nground - x:${ground.x}, y:${ground.y}`;
      tempText += `\naboveGround:${aboveGround}`;
      tempText += `\n\n - superSpineboy - `;
      tempText += `\nhealth: ${superSpineboy.health}`;
      tempText += `\nx:${superSpineboy.x}, y:${superSpineboy.y}`;
      tempText += `\nReady: ${superSpineboy.isReady}`;
      // tempText += `\nwidth: ${superSpineboy.width}, height: ${superSpineboy.height}`;
      tempText += `\nvx:${superSpineboy.vx}, vy:${superSpineboy.vy}`;
      tempText += `\nmoving: ${superSpineboy.moving}, running: ${superSpineboy.running}, jumping: ${superSpineboy.jumping}, onground: ${superSpineboy.onground}`;
      tempText += `\nfrontFootTip: ${superSpineboy.frontFootTipBone.y}`;
      // tempText += `\nbounds: ${bounds1}`;
      tempText += `\nanimation: ${superSpineboy.state.tracks[0].animation.name}`;

      // tempText += `\n\n - dragon - `;
      // tempText += `\nx:${dragon.x}, y:${dragon.y}`;

      tempText += `\n\nstage: ${app.stage.children.length}, gameWorld: ${gameWorld.children.length}, platforms: ${platforms.length}`;
      debugText.text = tempText;
    });
  };
})();
