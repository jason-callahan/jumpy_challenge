# jumpy_challenge
This was another coding challenge from work.

## Play the game: 
https://jason-callahan.github.io/jumpy_challenge/

## game controls
<pre>
space bar: jump
arrow-right: walk right
arrow-left: walk left
hold 'X' (with right/left arrow): run
</pre>

## scoring
- 1000 points for each platform you jump on, but just the first time.
- One point is deducted every game loop ~60 per second.
- Your points move to your score when you reach the goal.


## development
npx vite - runs the development environment

## build
npx vite build<br/>
This builds to the "docs" directory which is set to be the root of the github pages.


#### to debug in vscode
after starting the dev server with "npx vite" command, start debugger with F5. 

### Todo:
- Limited number of lives to 3, so game ends
- Refactor code!
- Make responsive enough to not break on full-screen
- Normalize dimensions
- Debug run animation glitch
- Refine controls: hold spacebar doesn't always work
- Respawn on platform, center respawn on last platform
- Add duck animation
- Top 10 Score
- Local top score (local storage)
- Persist top 10 score to mongo
- Progressively harder dragons
- Hide show debug text
- Aim and shoot controls
- Hit points for dragons
- death sequence for dragons
- Logo