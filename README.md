# jumpy_challenge
This was another coding challenge from work.

## Play the game: 
https://jason-callahan.github.io/jumpy_challenge/

## game controls
spacebar: jump
arrow-right: walk right
arrow-left: walk left
hold 'X' (with right/left arrow): run

## scoring
1000 points for each platform you jump on, but just the first time.
One point is deducted every game loop ~60 second.
Your points move to your score when you reach the goal.


## development
npx vite - runs the development environment

## build
npx vite build

## deploy to github pages
git subtree push --prefix dist origin gh-pages

#### to debug in vscode
after starting the dev server with "npx vite" command, start debugger with F5. 

### Todo:
- Help instructions on game screen
- Limited number of lives; 3
- Refactor code
- Make responsive enough to not break
- Make dimensions relative 
- Debug run animation glitch
- Refine controls: hold spacebar
- Respawn on platform 
- Add duck animation
- Top 10 Score
- Local top score (local storage)
- Logo
- Progressively harder dragons
- Hide show debug text
- Aim and shoot controls
- Hit points for dragons
- death sequence for dragons