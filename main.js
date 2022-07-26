const field = document.getElementById('field');
const neuronsCanvas = document.getElementById('neuronsCanvas');
field.width= 400;
neuronsCanvas.width= 400;
const ctx = field.getContext("2d");
const neuronsctx = neuronsCanvas.getContext("2d");
const road = new Road(field.width/2, field.width*0.9)
const N = 100;
const cars = generateCars(N);
const traffic = generateTraffic(100);
// let variance = 0.1;
let variance = localStorage.getItem("variance") ? parseFloat(localStorage.getItem("variance")) : 1;
let bestCar = cars[0];
let traintime = localStorage.getItem("traintime") ? parseFloat(localStorage.getItem("traintime")) : 10;
if(localStorage.getItem("bestBrain")){
    for(let i=0; i<cars.length;i++){
        cars[i].brain=JSON.parse(localStorage.getItem("bestBrain"));
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain, variance);
        }
    }
 
}

animate();

function save(){
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
    localStorage.setItem("variance", JSON.stringify(variance/1.5));
    localStorage.setItem("traintime", JSON.stringify(traintime+5)); 
}
function reset(){
    localStorage.removeItem("bestBrain", JSON.stringify(bestCar.brain));
    localStorage.setItem("variance", JSON.stringify(1));
    localStorage.setItem("traintime", JSON.stringify(10));
}

function generateCars(N){
    const cars=[];
    for(let i=0; i< N; i++){
        cars.push(new Car(road.getLaneCenter(1),200, 30, 50, "AI", 8));
    }
    return cars;
}

function generateTraffic(N){
    const traffic=[];
    for(let i=0; i< N; i++){
        const laneVar = -40 + Math.floor(Math.random()*80);
        const lane = Math.floor(Math.random()*3);
        const height = 50 + Math.floor(Math.random()*20);
        traffic.push(new Car(road.getLaneCenter(lane)+laneVar,-180*i, 30, height, "DUMMY", 6),);
    }
    return traffic;
}

function animate(time){
    for(let i=0; i< traffic.length; i++){
        traffic[i].update(road.borders, []);
    }
    for(let i=0; i< cars.length; i++){
       cars[i].update(road.borders, traffic);
    }

   bestCar = cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        )
    );

    carCount = cars.map(c=> c.damaged ? 0 : 1 ).reduce((a,b)=> a+b);
    if(time/1000 > traintime){
        save();
        window.location.reload();
    }
    if(carCount <= N/10){
        save();
        window.location.reload();
    }

    field.height=window.innerHeight;
    neuronsCanvas.height=window.innerHeight;
    ctx.save();
    ctx.translate(0,-bestCar.y+field.height*0.7);

    road.draw(ctx);
    for(let i=0; i< traffic.length; i++){
        traffic[i].draw(ctx);
    }
    ctx.globalAlpha = 0.2;
    for(let i=0; i< cars.length; i++){
        cars[i].draw(ctx);
    }
    ctx.globalAlpha = 1;
    bestCar.draw(ctx, true, 'blue');
    ctx.restore();
    neuronsctx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(neuronsctx, bestCar.brain);
    requestAnimationFrame(animate)
}


