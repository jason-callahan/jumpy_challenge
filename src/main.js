import "pixi-spine";
import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { Spine } from "pixi-spine";
import SuperSpineboy from "/src/superspineboy/SuperSpineboy";
import Dragon from "/src/dragon/Dragon";

// import spineboyJson from "/assets/spineboy-pro/spineboy-pro.json";
// import dragonJson from "/assets/dragon/dragon.json";

import groundPng from "/assets/iP4_ground_half.png";
import starPng from "/assets/star_sprite_sheet_2d_128px.png";

(async () => {
  console.log(PIXI.VERSION);

  class KeyCode {
    static JUMP = "Space";
    static MOVE_RIGHT = "ArrowRight";
    static MOVE_LEFT = "ArrowLeft";
    static RUN = "KeyX";
    // static SHOOT = "Shift";
    // static RESPAWN = "KeyR";
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

  const initEvents = (app) => {
    const gameWorld = app.stage.getChildByName("gameWorld");
    const superSpineboy = gameWorld.getChildByName("superSpineboy");
    let ground = gameWorld.getChildByName("ground");

    document.addEventListener("keydown", (event) => {
      // console.log(event);
      if (event.code === KeyCode.JUMP) superSpineboy.jump();
      if (event.code === KeyCode.MOVE_RIGHT) superSpineboy.move(superSpineboy.DIR_RIGHT);
      if (event.code === KeyCode.MOVE_LEFT) superSpineboy.move(superSpineboy.DIR_LEFT);
      if (event.code === KeyCode.RUN) superSpineboy.run();
      // if (event.key === KeyCode.SHOOT) superSpineboy.shoot();
      // if (event.code === KeyCode.RESPAWN) superSpineboy.respawn();
    });

    document.addEventListener("keyup", (event) => {
      // console.log(event);
      if ([KeyCode.MOVE_LEFT, KeyCode.MOVE_RIGHT].includes(event.code)) superSpineboy.stop();
      if (event.code === KeyCode.RUN) superSpineboy.stopRunning();
    });

    window.addEventListener("resize", async () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      gameWorld.removeChild(ground);
      ground = await initGround(app, gameWorld);
      // platforms[0] = ground;
      superSpineboy.y = app.renderer.height - 200;
      superSpineboy.vy = 0;
    });
  };

  const initSuperSpineboy = async () => {
    let resource = await PIXI.Assets.load("assets/spineboy-pro/spineboy-pro.json");
    const superSpineboy = new SuperSpineboy(resource);
    superSpineboy.gsap = gsap;

    superSpineboy.state.timeScale = 0.02;
    superSpineboy.scale.set(0.3);
    superSpineboy.eventMode = "dynamic";

    return superSpineboy;
  };

  const groundFactory = async (width, offset = 0) => {
    let resource = await PIXI.Assets.load(groundPng);
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

  const initGoal = async (app, gameWorld) => {
    const resource = await PIXI.Assets.load(starPng);

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
    text.name = title;
    // text.anchor.set(1, 0);
    container.addChild(text);

    return text;
  };

  const GameOverText = (app) => {
    const container = new PIXI.Container();
    app.stage.addChild(container);

    // Create a style for the score text
    const textStyle = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 48,
      fill: "white",
      align: "center",
    });

    const text = new PIXI.Text(`GAME OVER`, textStyle);
    text.name = "GameOver";
    text.anchor.set(0.5);
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
      platform.zIndex = 0;
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

  const gravity = 0.5;
  window.onload = async () => {
    initGsap();
    const debug = document.querySelector(".debug");
    const app = await initApp();

    const gameWorld = new PIXI.Container();
    gameWorld.name = "gameWorld";
    gameWorld.sortableChildren = true;
    app.stage.addChild(gameWorld);

    // // *** Collision testing *** //
    // const graphics = new PIXI.Graphics();
    // graphics.beginFill(0xff0000, 0.5); // Red color
    // graphics.drawRect(0, 0, 50, 5); // Adjust the radius as needed
    // graphics.endFill();
    // gameWorld.addChild(graphics);

    // *** Debug text *** //
    let debugText = new PIXI.Text("Super Spineboy", {
      fill: "white",
      fontSize: 16,
    });
    debugText.position.set(10, 10);
    debugText.text += "\n\nspacebar: jump";
    debugText.text += "\narrow-left: walk left";
    debugText.text += "\narrow-right: walk right";
    debugText.text += "\nhold 'X' (with right/left arrow): run";
    app.stage.addChild(debugText);

    let dragons = [];
    let platforms = [];
    let hitPlatforms = ["p0"];
    let lives = 3;

    // *** Init ground *** //
    const ground = await initGround(app, gameWorld);
    ground.name = "ground";
    ground.zIndex = 0;
    platforms.push(ground);

    // *** Init Goal ** //
    const goal = await initGoal(app, gameWorld);

    // *** Init SuperSpineboy *** //
    const superSpineboy = await initSuperSpineboy();
    gameWorld.addChild(superSpineboy);
    superSpineboy.zIndex = 1;

    const setupGame = async (level) => {
      lives = 3;

      // *** Init platforms *** //
      let platformCount = 10 + level;
      let newPlatforms = [];
      hitPlatforms = ["p0"];
      platforms.forEach((p) => (p.name != "ground" ? gameWorld.removeChild(p) : newPlatforms.push(p)));
      platforms = newPlatforms;
      platforms = platforms.concat(await initPlatforms(app, gameWorld, platformCount));

      // *** Init dragons *** //
      let dragonCount = level;
      let dragonY = 500;
      let newDragons = [];
      let resource = await PIXI.Assets.load("assets/dragon/dragon.json");
      dragons.forEach((d) => gameWorld.removeChild(d));
      for (let i = 0; i < dragonCount; i++) {
        // const dragon = await initDragon(gameWorld);
        const dragon = new Dragon(resource);
        if (i % 2 == 1) dragon.face(dragon.DIR_RIGHT);
        gameWorld.addChild(dragon);
        dragon.zIndex = 2;
        dragon.position.set(getRandomInt(0, app.renderer.width), getRandomInt(500, dragonY));
        console.log(`created dragon at`);
        dragonY -= 500;
        newDragons.push(dragon);
      }
      dragons = newDragons;

      // *** Init goal *** //
      let lastPlatform = platforms[platforms.length - 1];
      let goalX = lastPlatform.x + lastPlatform.width / 2;
      let goalY = platforms[platforms.length - 1].y - 500;
      goal.scale.set(0.75);
      goal.animationSpeed = 0.4;
      goal.position.set(goalX, goalY);
      gameWorld.addChild(goal);

      // *** Init SuperSpineboy *** //
      superSpineboy.position.set(200, app.renderer.height - ground.height + 30);
      superSpineboy.alpha = 1;
      superSpineboy.respawn();
      superSpineboy.state.addListener({
        complete: (trackIndex, loopCount) => {
          var animationName = superSpineboy.state.tracks[0].animation.name;
          // console.log(`${animationName} ended`);

          if (animationName === superSpineboy.ANIM_PORTAL) {
            superSpineboy.isReady = true;
          }

          if (animationName === superSpineboy.ANIM_DEATH) {
            console.log(`live remaingin: ${superSpineboy.lives}`);
            if (superSpineboy.lives > 0) {
              superSpineboy.respawn();
              superSpineboy.health = 100;
              updateHealth(superSpineboy.health);
            }
          }
        },
      });

      gameWorld.y = 0;
    };

    await setupGame(1);

    initEvents(app);

    // *** Game HUD *** //
    let score = 0;
    let scoreText = newHudText(app, "Score");
    scoreText.position.set(app.screen.width - 700, 10);
    let updateScore = (newScore) => {
      score = newScore;
      scoreText.text = `Score: ${score}`;
    };

    let points = 0;
    let pointsText = newHudText(app, "Points");
    pointsText.position.set(app.screen.width - 500, 10);
    let updatePoints = (newPoints) => {
      points = newPoints;
      pointsText.text = `Points: ${points}`;
    };

    let livesText = newHudText(app, "Lives");
    livesText.position.set(app.screen.width - 150, 10);
    let updateLives = () => {
      livesText.text = `Lives: ${superSpineboy.lives}`;
    };
    updateLives();

    let healthText = newHudText(app, "Health");
    healthText.position.set(app.screen.width - 300, 10);
    let updateHealth = (newHealth) => {
      superSpineboy.health = newHealth;
      healthText.text = `Health: ${superSpineboy.health}`;
    };
    updateHealth(100);

    let level = 1;
    let levelText = newHudText(app, "Level");
    levelText.position.set(app.screen.width - 850, 10);
    let updateLevel = (newLevel) => {
      level = newLevel;
      levelText.text = `Level: ${level}`;
    };
    updateLevel(level);

    // game over
    let gameOverText = GameOverText(app);
    gameOverText.position.set(app.screen.width / 2, app.screen.height / 2);
    gameOverText.visible = false;
    let showGameOver = () => {
      gameOverText.visible = true;
      gameOverText.text = `GAME OVER\nLevel: ${level}\nScore: ${score}`;
    };

    // *** Loop vars *** //
    let aboveGround = superSpineboy.y - 50;
    let bounds1, bounds2;
    let isDead = superSpineboy.health <= 0;
    let win = false;
    let winTween;

    // *** GAME LOOP *** //
    app.ticker.add((dt) => {
      isDead = superSpineboy.health <= 0;
      if (livesText.text != superSpineboy.lives) {
        updateLives();
        if (superSpineboy.lives == 0 && !gameOverText.visible) {
          updateScore(score + points);
          showGameOver();
        }
      }

      if (win && !winTween) {
        console.log("win scene");
        goal.gotoAndStop(0);
        winTween = gsap.to(goal, {
          pixi: {
            rotation: "+=720",
            scale: 30,
            alpha: 0,
          },
          duration: 1,
          onComplete: () => {
            win = false;
            goal.scale.set(0.75);
            goal.animationSpeed = 0.4;
            goal.gotoAndPlay(0);
            winTween.kill();
            winTween = null;
            goal.alpha = 1;
            setupGame(level);
          },
        });
        gsap.to(superSpineboy, {
          pixi: {
            alpha: 0,
          },
          duration: 1,
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
        bounds1.y += gameWorld.y;
        bounds1.width -= 60;
        bounds1.x += 30;
        for (let i = 0; i < platforms.length; i++) {
          let p = platforms[i];
          let py = p.y + 30;
          bounds2 = p.getBounds();
          bounds2.y += gameWorld.y;
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
            bounds2.y += gameWorld.y;

            // bounds2.height -= 150;
            // bounds2.x += 60;
            // bounds2.width -= 130;

            bounds2.height *= 0.6;
            bounds2.width *= 0.7;
            bounds2.x += bounds2.width * 0.2;
            bounds2.y += bounds2.height * 0.1;

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
              console.log(`spineboy: ${bounds1}, dragon: ${bounds2}`);
            }

            // dragon.x -= 5;
            // if (dragon.x < -200) dragon.x = app.renderer.width + 200;
            // dragon.update(dt);

            dragon.update(dt);
            if (dragon.facingRight) {
              if (dragon.x > app.renderer.width + 200) dragon.x = -200;
            } else {
              if (dragon.x < -200) dragon.x = app.renderer.width + 200;
            }
          }

          // graphics.x = bounds2.x;
          // graphics.y = bounds2.y;
          // graphics.width = bounds2.width;
          // graphics.height = bounds2.height;

          // *** Star collision *** //
          bounds2 = goal.getBounds();
          bounds2.y += gameWorld.y;
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

      // tempText = `app - width:${app.renderer.width}, height:${app.renderer.height}`;
      // tempText += `\ngameWorld - x:${gameWorld.x}, y:${gameWorld.y}, width:${gameWorld.width}, height:${gameWorld.height}`;
      // tempText += `\nground - x:${ground.x}, y:${ground.y}`;
      // tempText += `\naboveGround:${aboveGround}`;
      // tempText += `\n\n - superSpineboy - `;
      // tempText += `\nhealth: ${superSpineboy.health}`;
      // tempText += `\nx:${superSpineboy.x}, y:${superSpineboy.y}`;
      // tempText += `\nReady: ${superSpineboy.isReady}`;
      // // tempText += `\nwidth: ${superSpineboy.width}, height: ${superSpineboy.height}`;
      // tempText += `\nvx:${superSpineboy.vx}, vy:${superSpineboy.vy}`;
      // tempText += `\nmoving: ${superSpineboy.moving}, running: ${superSpineboy.running}, jumping: ${superSpineboy.jumping}, onground: ${superSpineboy.onground}`;
      // tempText += `\nfrontFootTip: ${superSpineboy.frontFootTipBone.y}`;
      // // tempText += `\nbounds: ${bounds1}`;
      // tempText += `\nanimation: ${superSpineboy.state.tracks[0].animation.name}`;
      // // tempText += `${superSpineboy.getBounds()}`;

      // tempText += `\n\n -- dragons ${dragons.length} -- `;
      // for (let i = 0; i < dragons.length; i++) {
      //   tempText += `\n - dragon - `;
      //   tempText += `\nx:${dragons[i].x}, y:${dragons[i].y}`;
      // }

      // tempText += `\n\nstage: ${app.stage.children.length}, gameWorld: ${gameWorld.children.length}, platforms: ${platforms.length}`;
      // debugText.text = tempText;
    });
  };
})();
