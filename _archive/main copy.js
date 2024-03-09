import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";

(async () => {
    window.onload = async () => {
        gsap.registerPlugin(PixiPlugin);
        PixiPlugin.registerPIXI(PIXI);

        const app = new PIXI.Application();
        await app.init({
            // width: window.innerWidth,
            // height: window.innerHeight,
            backgroundAlpha: 0,
            resizeTo: window,
        });

        document.body.appendChild(app.canvas);
        const texture = await PIXI.Assets.load("src/assets/sample.png");
        const bunny = new PIXI.Sprite(texture);

        bunny.x = app.renderer.width / 2;
        bunny.y = app.renderer.height / 2;

        bunny.anchor.set(0.5);

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
        bunny.eventMode = "dynamic";

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
