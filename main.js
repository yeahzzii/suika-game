import { Bodies, Body, Collision, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS } from './fruits.js';

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F7F4C8",
    width: 620,
    height: 850,
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, { // 중앙을 기준으로 계산 (중앙 왼쪽부터 15, 중앙 위로부터 395에 중앙이 있다)
  isStatic: true, // 물리엔진 고정
  render: { fillStyle: "#E6B143" }
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true, // 물리엔진 고정
  render: { fillStyle: "#E6B143" }
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true, // 물리엔진 고정
  render: { fillStyle: "#E6B143" }
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true, // 부딪히지 않고 감지만 한다
  render: {fillStyle: "E6B143"}
})

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;
let num_suika = 0;

function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true, // 바로 떨어지지 않고 준비중인 상태
    render: {
      sprite: { texture: `${fruit.name}.png`}
    },
    restitution: 0.3,   
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

window.onkeydown = (event) => {

  if(disableAction) {
    return;
  }
  
  switch (event.code) {
    case "KeyA" :
      if(interval)
        return;
      interval = setInterval(() => {
        if(currentBody.position.x - currentFruit.radius > 30)
        Body.setPosition(currentBody, {
          x: currentBody.position.x - 1,
          y: currentBody.position.y,
        });
      }, 5);
      break;

    case "KeyD" :
      if(interval) 
        return;
      interval = setInterval(() => {
        if(currentBody.position.x + currentFruit.radius < 590)
        Body.setPosition(currentBody, {
          x: currentBody.position.x + 1,
          y: currentBody.position.y,
        });
      }, 5);
      
      break;

    case "KeyS" :
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false; // 일정한 시간 전에는 아무리 키보드를 눌러도 반응하지 않음
      }, 1000)
      
      break;
    default:
        // 모든 다른 키에 대한 처리 추가
      break;
  }
}

// 마우스 클릭 이벤트 핸들러 추가
window.addEventListener('click', (event) => {
  if(disableAction) {
    return;
  }
  // 클릭한 위치에 현재 과일 이동
  moveFruitToPosition(event.clientX, topLine.position.y);

  // 현재 과일을 떨어뜨리고, 일정 시간 후에 다시 반응하도록 설정
  currentBody.isSleeping = false;
  disableAction = true;
  setTimeout(() => {
    addFruit();
    disableAction = false; // 일정한 시간 전에는 아무리 키보드를 눌러도 반응하지 않음
    console.log(disableAction);
  }, 1000);
});

// 클릭한 위치에 과일을 이동시키는 함수
function moveFruitToPosition(x, y) {
  if (currentBody) {
    Body.setPosition(currentBody, { x, y });
  }
}




window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null;
      break;
    default:
      break;
  }
}

// 충돌 판정
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if(collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index; // bodyA와 bodyB는 같은 index의 과일일테니 어떤걸 써도 상관 없다.

      if(index === FRUITS.length -1) {
        return;
      }
      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1];

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y, // 부딪힌 지점의 x,y 좌표
        newFruit.radius,
        {
          render: {
            sprite: { texture: `${newFruit.name}.png` }
          },
          index: index + 1,
        }
      );
      World.add(world, newBody);

      if(newFruit === FRUITS[7]) {
        num_suika++;
        if( num_suika === 2 ){
          alert("승");
        }
      }
      
    }

    // 승패 판정
    if(
      !disableAction && (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")) {
      alert("Game over");
    }
  }) // 충돌한 쌍들을 가져와서 for문 돌림
})

addFruit();