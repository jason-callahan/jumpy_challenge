# Super Spineboy
*a fun coding challenge from work.*


## Play the game: 
https://jason-callahan.github.io/jumpy_challenge/

## game controls
> JUMP = "Space"  
> MOVE_RIGHT = "ArrowRight"  
> MOVE_LEFT = "ArrowLeft"  
> RUN = "KeyX"  


## scoring
- 1000 points for each platform you jump on, but just the first time.
- One point is deducted every game loop ~60 per second.
- Your points move to your score when you reach the goal.


## development
```
// command to run the development environment
npx vite
```

### debug in vscode
> after starting the dev server with "npx vite" command, start debugger with F5. 


## build
```
// production build command
npx vite build
```

## CD
I'm using github pages here.  The vite.config.js file has settings for the build destination of "docs" along with the base path of the github project name.  This allows for setting the github pages root directory to the main branch docs/ folder which acts like the root directory for a web site.


___

## Todo:
- ~~Limited number of lives to 3, so game ends~~
- Refactor code!
- Make responsive enough to not break on full-screen
- Normalize dimensions
- Debug run animation glitch
- Refine controls: hold spacebar doesn't always work
- Respawn on platform, center respawn on last platform
- Add duck animation
- Mobile friendly
- Top 10 Score
- Local top score (local storage)
- Persist top 10 score to mongo
- Progressively harder dragons
- Hide show debug text
- Aim and shoot controls
- Hit points for dragons
- death sequence for dragons
- Logo